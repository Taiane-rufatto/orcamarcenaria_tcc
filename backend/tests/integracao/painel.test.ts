import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import type { Orcamento } from '../../src/aplicacao/orcamento/orcamento'

// Spec 019: painel do mês. Valores fictícios, os mesmos do teste de unidade quando possível.

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

type Painel = {
  mes: string; rascunhos: number; enviados: number; aguardando: number; recusados: number; vencidos: number
  aprovados: { quantidade: number; valor: string; lucro: string; percentualDoPreco: string | null }
  taxaDeAprovacao: string | null
}

async function conta(rotulo: string) {
  const r = await fetch(`${baseUrl}/auth/cadastro`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeMarcenaria: 'Marcenaria Exemplo', nomeResponsavel: 'Responsável Fictício', email: `${rotulo}.${Date.now()}@example.test`, senha: 'teste1234' }),
  })
  const { token } = await r.json() as { token: string }
  const cliente = await esperar<{ id: string }>(chamar(token, '/clientes', 'POST', { nome: 'Cliente Fictício' }), 201)
  return { token, clienteId: cliente.id }
}

// Um material só, markup `markup`%: custo direto = valor; preço final = valor × (1 + markup/100).
async function criar(token: string, clienteId: string, dataEmissao: string, valor: string, markup: string, dataValidade = '2099-12-31') {
  const o = await esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', {
    clienteId, descricaoProjeto: 'Armário', dataEmissao, dataValidade, modoLucro: 'markup', percentualLucro: markup, regraArredondamento: 'duas_casas',
  }), 201)
  return esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', {
    origem: 'avulso', tipo: 'material', descricao: 'MDF', unidade: 'un', quantidade: '1', valorUnitario: valor,
  }), 201)
}

const enviar = (token: string, o: Orcamento) => esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/registrar`, 'POST'), 200)
const responder = (token: string, o: Orcamento, situacao: 'aprovado' | 'recusado') =>
  esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/situacao`, 'POST', { situacao }), 200)

describe('painel do mês (RF47, RF48)', () => {
  it('exige autenticação', async () => {
    expect((await fetch(`${baseUrl}/painel`)).status).toBe(401)
  })

  it.each(['2026-13', '2026-00', '26-10', 'outubro', '2026-1'])('mês inválido (%s) dá 400', async (mes) => {
    const { token } = await conta('painel.invalido')
    await esperar(chamar(token, `/painel?mes=${mes}`), 400)
  })

  it('sem o parâmetro usa o mês atual', async () => {
    const { token } = await conta('painel.atual')
    expect((await esperar<Painel>(chamar(token, '/painel'), 200)).mes).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
  })

  it('mês sem orçamentos: tudo zerado e sem taxa', async () => {
    const { token } = await conta('painel.vazio')
    expect(await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)).toEqual({
      mes: '2026-10', rascunhos: 0, enviados: 0, aguardando: 0, recusados: 0, vencidos: 0,
      aprovados: { quantidade: 0, valor: '0.00', lucro: '0.00', percentualDoPreco: null }, taxaDeAprovacao: null,
    })
  })

  it('conta só o mês pedido: aprovado 4.200,00 (lucro 2.100,00), recusado, rascunho; o de setembro não entra', async () => {
    const { token, clienteId } = await conta('painel.mes')
    // Aprovado: custo 2.100,00, markup 100% → preço 4.200,00, lucro 2.100,00.
    await responder(token, await enviar(token, await criar(token, clienteId, '2026-10-05', '2100', '100')), 'aprovado')
    // Recusado: custo 1.000,00, markup 50% → preço 1.500,00.
    await responder(token, await enviar(token, await criar(token, clienteId, '2026-10-06', '1000', '50')), 'recusado')
    // Rascunho: não conta como enviado.
    await criar(token, clienteId, '2026-10-07', '500', '50')
    // Aprovado em setembro: fora do mês.
    await responder(token, await enviar(token, await criar(token, clienteId, '2026-09-20', '9999', '100')), 'aprovado')

    expect(await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)).toEqual({
      mes: '2026-10', rascunhos: 1, enviados: 2, aguardando: 0, recusados: 1, vencidos: 0,
      aprovados: { quantidade: 1, valor: '4200.00', lucro: '2100.00', percentualDoPreco: '50.00' },
      taxaDeAprovacao: '50.00',
    })
    expect((await esperar<Painel>(chamar(token, '/painel?mes=2026-09'), 200)).aprovados.valor).toBe('19998.00')
  })

  it('enviado sem resposta fica aguardando; enviado com validade vencida conta como vencido', async () => {
    const { token, clienteId } = await conta('painel.vencido')
    await enviar(token, await criar(token, clienteId, '2026-10-05', '100', '100'))
    await enviar(token, await criar(token, clienteId, '2026-01-01', '100', '100', '2026-01-02'))

    const outubro = await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)
    expect(outubro).toMatchObject({ enviados: 1, aguardando: 1, vencidos: 0, taxaDeAprovacao: '0.00' })
    const janeiro = await esperar<Painel>(chamar(token, '/painel?mes=2026-01'), 200)
    expect(janeiro).toMatchObject({ enviados: 1, aguardando: 0, vencidos: 1 })
  })

  it('o painel de uma marcenaria não mostra orçamentos de outra', async () => {
    const a = await conta('painel.iso.a')
    const b = await conta('painel.iso.b')
    await responder(a.token, await enviar(a.token, await criar(a.token, a.clienteId, '2026-10-05', '2100', '100')), 'aprovado')
    expect((await esperar<Painel>(chamar(b.token, '/painel?mes=2026-10'), 200)).enviados).toBe(0)
  })
})
