import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import type { Orcamento } from '../../src/aplicacao/orcamento/orcamento'

// Spec 018: lucro mínimo e aviso de equilíbrio. Valores fictícios, os mesmos do teste de unidade.

let servidor: Server
let baseUrl: string

beforeAll(async () => {
  if (!process.env.DATABASE_URL_TESTE) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL é obrigatória para integração')
    const urlTeste = new URL(process.env.DATABASE_URL)
    urlTeste.pathname = `/${decodeURIComponent(urlTeste.pathname.slice(1))}_teste`
    process.env.DATABASE_URL_TESTE = urlTeste.toString()
  }
  process.env.DATABASE_URL = process.env.DATABASE_URL_TESTE
  const { app } = await import('../../src/servidor')
  servidor = app.listen(0)
  await new Promise<void>((resolver) => servidor.once('listening', resolver))
  const endereco = servidor.address()
  if (!endereco || typeof endereco === 'string') throw new Error('Não foi possível iniciar a API de teste')
  baseUrl = `http://127.0.0.1:${endereco.port}`
})

afterAll(async () => {
  if (!servidor) return
  await new Promise<void>((resolver, rejeitar) => servidor.close((erro) => erro ? rejeitar(erro) : resolver()))
})

const chamar = (token: string, rota: string, metodo = 'GET', corpo?: unknown) => fetch(`${baseUrl}${rota}`, {
  method: metodo,
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: corpo === undefined ? undefined : JSON.stringify(corpo),
})

async function esperar<T>(resposta: Promise<Response>, status: number): Promise<T> {
  const r = await resposta
  const corpo = await r.json()
  expect(r.status, JSON.stringify(corpo)).toBe(status)
  return corpo as T
}

type Config = { equilibrio: { lucroMinimo: string | null } }

async function conta(rotulo: string) {
  const r = await fetch(`${baseUrl}/auth/cadastro`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeMarcenaria: 'Marcenaria Exemplo', nomeResponsavel: 'Responsável Fictício', email: `${rotulo}.${Date.now()}@example.test`, senha: 'teste1234' }),
  })
  const { token } = await r.json() as { token: string }
  const cliente = await esperar<{ id: string }>(chamar(token, '/clientes', 'POST', { nome: 'Cliente Fictício' }), 201)
  return { token, clienteId: cliente.id }
}

const cabecalhoBase = (clienteId: string) => ({ clienteId, descricaoProjeto: 'Armário de cozinha', dataEmissao: '2026-10-01' })

const criar = (token: string, clienteId: string) => esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', {
  ...cabecalhoBase(clienteId), modoLucro: 'markup', percentualLucro: '100', regraArredondamento: 'duas_casas',
}), 201)

// Material 1.200,00 + serviço 800,00 + adicional 100,00 = custo direto 2.100,00.
// Markup 100% sem arredondamento: preço final 4.200,00; lucro 2.100,00 = 50,00% do preço.
async function orcamentoSimples(token: string, clienteId: string) {
  let o = await criar(token, clienteId)
  for (const [tipo, descricao, valorUnitario] of [['material', 'MDF', '1200'], ['servico', 'Montagem', '800']]) {
    o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'avulso', tipo, descricao, unidade: 'un', quantidade: '1', valorUnitario }), 201)
  }
  return esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/custos-adicionais`, 'POST', { descricao: 'Frete', valor: '100,00' }), 201)
}

describe('lucro mínimo na configuração (RF44)', () => {
  it('exige autenticação', async () => {
    expect((await fetch(`${baseUrl}/configuracoes/equilibrio`, { method: 'PUT' })).status).toBe(401)
  })

  it('conta nova não tem mínimo; gravar aceita vírgula e devolve com duas casas', async () => {
    const { token } = await conta('eq.config')
    expect((await esperar<Config>(chamar(token, '/configuracoes'), 200)).equilibrio).toEqual({ lucroMinimo: null })
    expect((await esperar<Config>(chamar(token, '/configuracoes/equilibrio', 'PUT', { lucroMinimo: '25,5' }), 200)).equilibrio).toEqual({ lucroMinimo: '25.50' })
  })

  it('vazio limpa o mínimo', async () => {
    const { token } = await conta('eq.limpar')
    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { lucroMinimo: '30' }), 200)
    expect((await esperar<Config>(chamar(token, '/configuracoes/equilibrio', 'PUT', { lucroMinimo: '' }), 200)).equilibrio).toEqual({ lucroMinimo: null })
  })

  it.each(['0', '100', '150', '-5', 'abc', '10,001'])('recusa com 400: %s', async (valor) => {
    const { token } = await conta('eq.invalido')
    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { lucroMinimo: valor }), 400)
  })

  it('o mínimo de uma marcenaria não aparece em outra', async () => {
    const a = await conta('eq.iso.a')
    const b = await conta('eq.iso.b')
    await esperar(chamar(a.token, '/configuracoes/equilibrio', 'PUT', { lucroMinimo: '30' }), 200)
    expect((await esperar<Config>(chamar(b.token, '/configuracoes'), 200)).equilibrio.lucroMinimo).toBeNull()
  })
})

describe('aviso no orçamento (RF45, RF46)', () => {
  it('orçamento sem itens (preço zero) não tem aviso', async () => {
    const { token, clienteId } = await conta('eq.vazio')
    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { lucroMinimo: '30' }), 200)
    expect((await criar(token, clienteId)).equilibrio).toBeNull()
  })

  it('sem mínimo informado mostra o lucro (2.100,00 = 50,00%) e nunca avisa', async () => {
    const { token, clienteId } = await conta('eq.semminimo')
    const o = await orcamentoSimples(token, clienteId)
    expect(o.memorial).toMatchObject({ custoDiretoTotal: '2100.00', precoFinal: '4200.00' })
    expect(o.equilibrio).toEqual({ lucro: '2100.00', percentualDoPreco: '50.00', lucroMinimo: null, abaixoDoMinimo: false })
  })

  it('mínimo de 40% não avisa; mínimo de 60% avisa; o preço continua 4.200,00 nos dois', async () => {
    const { token, clienteId } = await conta('eq.minimo')
    const base = await orcamentoSimples(token, clienteId)

    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { lucroMinimo: '40' }), 200)
    const ok = await esperar<Orcamento>(chamar(token, `/orcamentos/${base.id}`), 200)
    expect(ok.equilibrio).toEqual({ lucro: '2100.00', percentualDoPreco: '50.00', lucroMinimo: '40.00', abaixoDoMinimo: false })

    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { lucroMinimo: '60' }), 200)
    const aviso = await esperar<Orcamento>(chamar(token, `/orcamentos/${base.id}`), 200)
    expect(aviso.equilibrio).toMatchObject({ lucroMinimo: '60.00', abaixoDoMinimo: true })
    expect(aviso.memorial).toEqual(base.memorial)
    expect(aviso.memorial.precoFinal).toBe('4200.00')
  })

  it('baixar o markup para ganhar o cliente: com 20% o preço cai para 2.520,00, o lucro vira 420,00 (16,67%) e avisa', async () => {
    const { token, clienteId } = await conta('eq.baixar')
    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { lucroMinimo: '30' }), 200)
    const base = await orcamentoSimples(token, clienteId)
    expect(base.equilibrio?.abaixoDoMinimo).toBe(false)

    const baixo = await esperar<Orcamento>(chamar(token, `/orcamentos/${base.id}`, 'PUT', { ...cabecalhoBase(clienteId), percentualLucro: '20' }), 200)
    expect(baixo.memorial.precoFinal).toBe('2520.00')
    expect(baixo.equilibrio).toEqual({ lucro: '420.00', percentualDoPreco: '16.67', lucroMinimo: '30.00', abaixoDoMinimo: true })
  })

  it('o orçamento registrado acompanha o mínimo atual', async () => {
    const { token, clienteId } = await conta('eq.registrado')
    const base = await orcamentoSimples(token, clienteId)
    await esperar(chamar(token, `/orcamentos/${base.id}/registrar`, 'POST'), 200)

    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { lucroMinimo: '70' }), 200)
    const depois = await esperar<Orcamento>(chamar(token, `/orcamentos/${base.id}`), 200)
    expect(depois.equilibrio).toMatchObject({ lucroMinimo: '70.00', abaixoDoMinimo: true })
    expect(depois.memorial.precoFinal).toBe('4200.00')
  })
})
