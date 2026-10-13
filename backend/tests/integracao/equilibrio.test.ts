import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import type { Orcamento } from '../../src/aplicacao/orcamento/orcamento'

// Spec 018: meta mensal, horas produtivas, horas estimadas e aviso de equilíbrio.
// Valores fictícios, os mesmos do teste de unidade: meta 8.000,00 ÷ 160 h = 50,00 por hora.

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

type Config = { equilibrio: { metaMensal: string | null; horasProdutivasMes: string | null; necessarioPorHora: string | null } }

async function conta(rotulo: string) {
  const r = await fetch(`${baseUrl}/auth/cadastro`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeMarcenaria: 'Marcenaria Exemplo', nomeResponsavel: 'Responsável Fictício', email: `${rotulo}.${Date.now()}@example.test`, senha: 'teste1234' }),
  })
  const { token } = await r.json() as { token: string }
  const cliente = await esperar<{ id: string }>(chamar(token, '/clientes', 'POST', { nome: 'Cliente Fictício' }), 201)
  return { token, clienteId: cliente.id }
}

// Itens simples e conferíveis à mão: material 1.200,00, serviço 800,00, adicional 100,00.
// Markup 100% sem arredondamento: custo direto 2.100,00; preço final 4.200,00;
// contribuição = 4.200,00 − 1.200,00 − 100,00 = 2.900,00 (o serviço não é descontado).
async function orcamentoSimples(token: string, clienteId: string, extra: object = {}) {
  let o = await esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', {
    clienteId, descricaoProjeto: 'Armário de cozinha', dataEmissao: '2026-10-01', modoLucro: 'markup', percentualLucro: '100', regraArredondamento: 'duas_casas', ...extra,
  }), 201)
  for (const [tipo, descricao, valorUnitario] of [['material', 'MDF', '1200'], ['servico', 'Montagem', '800']]) {
    o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'avulso', tipo, descricao, unidade: 'un', quantidade: '1', valorUnitario }), 201)
  }
  return esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/custos-adicionais`, 'POST', { descricao: 'Frete', valor: '100,00' }), 201)
}

const cabecalhoBase = (clienteId: string) => ({ clienteId, descricaoProjeto: 'Armário de cozinha', dataEmissao: '2026-10-01' })

describe('configuração do equilíbrio (RF44)', () => {
  it('exige autenticação', async () => {
    expect((await fetch(`${baseUrl}/configuracoes/equilibrio`, { method: 'PUT' })).status).toBe(401)
  })

  it('conta nova não tem meta nem horas; gravar devolve o necessário por hora calculado pelo domínio', async () => {
    const { token } = await conta('eq.config')
    expect((await esperar<Config>(chamar(token, '/configuracoes'), 200)).equilibrio)
      .toEqual({ metaMensal: null, horasProdutivasMes: null, necessarioPorHora: null })

    const config = await esperar<Config>(chamar(token, '/configuracoes/equilibrio', 'PUT', { metaMensal: '8000,00', horasProdutivasMes: '160' }), 200)
    expect(config.equilibrio).toEqual({ metaMensal: '8000.00', horasProdutivasMes: '160.00', necessarioPorHora: '50.00' })
  })

  it('vazio limpa os campos', async () => {
    const { token } = await conta('eq.limpar')
    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { metaMensal: '8000', horasProdutivasMes: '160' }), 200)
    const config = await esperar<Config>(chamar(token, '/configuracoes/equilibrio', 'PUT', { metaMensal: '', horasProdutivasMes: '' }), 200)
    expect(config.equilibrio).toEqual({ metaMensal: null, horasProdutivasMes: null, necessarioPorHora: null })
  })

  it.each([
    ['meta zero', { metaMensal: '0', horasProdutivasMes: '160' }],
    ['meta negativa', { metaMensal: '-5', horasProdutivasMes: '160' }],
    ['meta com 3 casas', { metaMensal: '10,001', horasProdutivasMes: '160' }],
    ['meta com letras', { metaMensal: 'abc', horasProdutivasMes: '160' }],
    ['horas zero', { metaMensal: '8000', horasProdutivasMes: '0' }],
    ['horas acima de um mês', { metaMensal: '8000', horasProdutivasMes: '745' }],
    ['horas negativas', { metaMensal: '8000', horasProdutivasMes: '-1' }],
  ])('recusa com 400: %s', async (_nome, corpo) => {
    const { token } = await conta('eq.invalido')
    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', corpo), 400)
  })

  it('a meta de uma marcenaria não aparece em outra', async () => {
    const a = await conta('eq.iso.a')
    const b = await conta('eq.iso.b')
    await esperar(chamar(a.token, '/configuracoes/equilibrio', 'PUT', { metaMensal: '8000', horasProdutivasMes: '160' }), 200)
    expect((await esperar<Config>(chamar(b.token, '/configuracoes'), 200)).equilibrio.metaMensal).toBeNull()
  })
})

describe('aviso no orçamento (RF45, RF46)', () => {
  it('sem horas estimadas não há aviso; o preço final é 4.200,00', async () => {
    const { token, clienteId } = await conta('eq.semhoras')
    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { metaMensal: '8000', horasProdutivasMes: '160' }), 200)
    const o = await orcamentoSimples(token, clienteId)
    expect(o.horasEstimadas).toBeNull()
    expect(o.equilibrio).toBeNull()
    expect(o.memorial).toMatchObject({ custoDiretoTotal: '2100.00', precoFinal: '4200.00' })
  })

  it('sem meta configurada não há aviso, mesmo com horas estimadas', async () => {
    const { token, clienteId } = await conta('eq.semmeta')
    const o = await orcamentoSimples(token, clienteId, { horasEstimadas: '40' })
    expect(o.horasEstimadas).toBe('40.00')
    expect(o.equilibrio).toBeNull()
  })

  it('contribuição 2.900,00: com 40 h dá 72,50 por hora (acima de 50,00); com 80 h dá 36,25 (abaixo) e o preço não muda', async () => {
    const { token, clienteId } = await conta('eq.aviso')
    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { metaMensal: '8000', horasProdutivasMes: '160' }), 200)
    const base = await orcamentoSimples(token, clienteId, { horasEstimadas: '40' })
    expect(base.equilibrio).toEqual({ contribuicao: '2900.00', valorPorHora: '72.50', necessarioPorHora: '50.00', abaixoDoNecessario: false })

    const editado = await esperar<Orcamento>(chamar(token, `/orcamentos/${base.id}`, 'PUT', { ...cabecalhoBase(clienteId), horasEstimadas: '80' }), 200)
    expect(editado.horasEstimadas).toBe('80.00')
    expect(editado.equilibrio).toEqual({ contribuicao: '2900.00', valorPorHora: '36.25', necessarioPorHora: '50.00', abaixoDoNecessario: true })
    expect(editado.memorial.precoFinal).toBe('4200.00')
    expect(editado.memorial).toEqual(base.memorial)
  })

  it('campo omitido na edição mantém as horas; vazio limpa e o aviso some', async () => {
    const { token, clienteId } = await conta('eq.edicao')
    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { metaMensal: '8000', horasProdutivasMes: '160' }), 200)
    const base = await orcamentoSimples(token, clienteId, { horasEstimadas: '40' })

    const mantido = await esperar<Orcamento>(chamar(token, `/orcamentos/${base.id}`, 'PUT', cabecalhoBase(clienteId)), 200)
    expect(mantido.horasEstimadas).toBe('40.00')

    const limpo = await esperar<Orcamento>(chamar(token, `/orcamentos/${base.id}`, 'PUT', { ...cabecalhoBase(clienteId), horasEstimadas: '' }), 200)
    expect(limpo.horasEstimadas).toBeNull()
    expect(limpo.equilibrio).toBeNull()
  })

  it.each(['0', '-3', 'abc', '10,555', '100000'])('recusa horas estimadas inválidas (%s) com 400', async (horas) => {
    const { token, clienteId } = await conta('eq.horasinvalidas')
    await esperar(chamar(token, '/orcamentos', 'POST', { ...cabecalhoBase(clienteId), horasEstimadas: horas }), 400)
  })

  it('o aviso acompanha a meta atual, inclusive no orçamento já registrado; as horas ficam travadas', async () => {
    const { token, clienteId } = await conta('eq.registrado')
    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { metaMensal: '8000', horasProdutivasMes: '160' }), 200)
    const base = await orcamentoSimples(token, clienteId, { horasEstimadas: '40' })
    const registrado = await esperar<Orcamento>(chamar(token, `/orcamentos/${base.id}/registrar`, 'POST'), 200)
    expect(registrado.equilibrio?.abaixoDoNecessario).toBe(false)

    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { metaMensal: '16000', horasProdutivasMes: '160' }), 200)
    const depois = await esperar<Orcamento>(chamar(token, `/orcamentos/${base.id}`), 200)
    expect(depois.equilibrio).toMatchObject({ necessarioPorHora: '100.00', valorPorHora: '72.50', abaixoDoNecessario: true })

    await esperar(chamar(token, `/orcamentos/${base.id}`, 'PUT', { ...cabecalhoBase(clienteId), horasEstimadas: '10' }), 409)
  })
})
