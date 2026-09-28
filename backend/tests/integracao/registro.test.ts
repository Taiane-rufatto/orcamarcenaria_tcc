import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import type { Orcamento } from '../../src/aplicacao/orcamento/orcamento'

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

async function criarConta(rotulo: string): Promise<string> {
  const resposta = await fetch(`${baseUrl}/auth/cadastro`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeMarcenaria: `Marcenaria ${rotulo}`, nomeResponsavel: 'Teste', email: `${rotulo}.${Date.now()}@example.test`, senha: 'teste1234' }),
  })
  expect(resposta.status).toBe(201)
  return (await resposta.json() as { token: string }).token
}

const chamar = (token: string, rota: string, metodo = 'GET', corpo?: unknown) => fetch(`${baseUrl}${rota}`, {
  method: metodo,
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: corpo === undefined ? undefined : JSON.stringify(corpo),
})

async function esperar<T = Orcamento>(resposta: Promise<Response>, status: number): Promise<T> {
  const r = await resposta
  const corpo = await r.json()
  expect(r.status, JSON.stringify(corpo)).toBe(status)
  return corpo as T
}

type Resumo = { id: string; numero: number | null; clienteNome: string; dataEmissao: string; precoFinal: string; situacao: string }

// Dados fictícios (AGENTS §5.3). Validade no futuro, salvo nos testes de vencimento.
const cabecalho = { clienteNome: 'Cliente Fictício', descricaoProjeto: 'Estante', dataEmissao: '2026-10-01', dataValidade: '2099-12-31' }
const item = { origem: 'avulso', tipo: 'material', descricao: 'Chapa', unidade: 'ch', quantidade: '1', valorUnitario: '100' }

async function rascunho(token: string, dados: Partial<typeof cabecalho> = {}, comItem = true): Promise<Orcamento> {
  const o = await esperar(chamar(token, '/orcamentos', 'POST', { ...cabecalho, ...dados }), 201)
  return comItem ? esperar(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', item), 201) : o
}

describe('registro e acompanhamento', () => {
  it('registra com número sequencial por marcenaria, sem reutilizar nem recalcular (RN11, RF34, RF38, D020)', async () => {
    const tokenA = await criarConta('registro.a')
    const tokenB = await criarConta('registro.b')
    const primeiro = await rascunho(tokenA)
    const segundo = await rascunho(tokenA)
    expect(primeiro).toMatchObject({ numero: null, situacao: 'rascunho' })

    const registrado = await esperar(chamar(tokenA, `/orcamentos/${primeiro.id}/registrar`, 'POST'), 200)
    expect(registrado).toMatchObject({ numero: 1, situacao: 'enviado' })
    // RF38: registrar não muda nenhum valor.
    expect(registrado.itens).toEqual(primeiro.itens)
    expect(registrado.memorial).toEqual(primeiro.memorial)

    expect(await esperar(chamar(tokenA, `/orcamentos/${segundo.id}/registrar`, 'POST'), 200)).toMatchObject({ numero: 2 })
    expect(await esperar(chamar(tokenB, `/orcamentos/${(await rascunho(tokenB)).id}/registrar`, 'POST'), 200)).toMatchObject({ numero: 1 })

    // Registrar de novo não gera outro número.
    expect((await chamar(tokenA, `/orcamentos/${primeiro.id}/registrar`, 'POST')).status).toBe(409)
    expect(await esperar(chamar(tokenA, `/orcamentos/${primeiro.id}`), 200)).toMatchObject({ numero: 1 })
  })

  it('recusa registrar sem itens (CN05) e criar sem cliente ou descrição (CN06, RF32)', async () => {
    const token = await criarConta('registro.cn05')
    const vazio = await rascunho(token, {}, false)
    const resposta = await chamar(token, `/orcamentos/${vazio.id}/registrar`, 'POST')
    expect(resposta.status).toBe(400)
    expect((await resposta.json() as { mensagem: string }).mensagem).toBe('Inclua ao menos um item antes de registrar o orçamento')
    expect(await esperar(chamar(token, `/orcamentos/${vazio.id}`), 200)).toMatchObject({ numero: null, situacao: 'rascunho' })

    expect((await chamar(token, '/orcamentos', 'POST', { ...cabecalho, clienteNome: '' })).status).toBe(400)
    expect((await chamar(token, '/orcamentos', 'POST', { ...cabecalho, descricaoProjeto: '' })).status).toBe(400)
  })

  it('bloqueia qualquer edição fora de rascunho (RF39, RN09)', async () => {
    const token = await criarConta('registro.bloqueio')
    const o = await rascunho(token)
    const comCusto = await esperar(chamar(token, `/orcamentos/${o.id}/custos-adicionais`, 'POST', { descricao: 'Frete', valor: '50' }), 201)
    const registrado = await esperar(chamar(token, `/orcamentos/${o.id}/registrar`, 'POST'), 200)
    const itemId = registrado.itens[0].id
    const custoId = comCusto.custosAdicionais[0].id

    for (const [rota, metodo, corpo] of [
      [`/orcamentos/${o.id}`, 'PUT', { ...cabecalho, percentualLucro: '10' }],
      [`/orcamentos/${o.id}/itens`, 'POST', item],
      [`/orcamentos/${o.id}/itens/${itemId}`, 'PUT', { quantidade: '5', valorUnitario: '1' }],
      [`/orcamentos/${o.id}/itens/${itemId}`, 'DELETE', undefined],
      [`/orcamentos/${o.id}/custos-adicionais`, 'POST', { descricao: 'Outro', valor: '1' }],
      [`/orcamentos/${o.id}/custos-adicionais/${custoId}`, 'DELETE', undefined],
    ] as const) {
      const resposta = await chamar(token, rota, metodo, corpo)
      expect(resposta.status, `${metodo} ${rota}`).toBe(409)
      expect((await resposta.json() as { mensagem: string }).mensagem).toBe('Só é possível alterar um orçamento em rascunho')
    }
    expect(await esperar(chamar(token, `/orcamentos/${o.id}`), 200)).toEqual(registrado)
  })

  it('segue as transições da RN09: enviado → aprovado ou recusado, e nada além disso', async () => {
    const token = await criarConta('registro.transicoes')
    const aprovar = await rascunho(token)
    const recusar = await rascunho(token)
    const continuaRascunho = await rascunho(token)

    // Rascunho não é aprovado sem antes ser registrado.
    expect((await chamar(token, `/orcamentos/${continuaRascunho.id}/situacao`, 'POST', { situacao: 'aprovado' })).status).toBe(409)

    await esperar(chamar(token, `/orcamentos/${aprovar.id}/registrar`, 'POST'), 200)
    await esperar(chamar(token, `/orcamentos/${recusar.id}/registrar`, 'POST'), 200)
    expect(await esperar(chamar(token, `/orcamentos/${aprovar.id}/situacao`, 'POST', { situacao: 'aprovado' }), 200)).toMatchObject({ situacao: 'aprovado' })
    expect(await esperar(chamar(token, `/orcamentos/${recusar.id}/situacao`, 'POST', { situacao: 'recusado' }), 200)).toMatchObject({ situacao: 'recusado' })

    // Situações finais não mudam; enviado e vencido não são escolhidos pelo usuário.
    expect((await chamar(token, `/orcamentos/${aprovar.id}/situacao`, 'POST', { situacao: 'recusado' })).status).toBe(409)
    expect((await chamar(token, `/orcamentos/${recusar.id}/situacao`, 'POST', { situacao: 'aprovado' })).status).toBe(409)
    for (const situacao of ['enviado', 'vencido', 'rascunho', 'qualquer']) {
      expect((await chamar(token, `/orcamentos/${aprovar.id}/situacao`, 'POST', { situacao })).status).toBe(400)
    }
  })

  it('marca como vencido o enviado com validade passada e não deixa aprová-lo (RF36)', async () => {
    const token = await criarConta('registro.vencimento')
    const antigo = await rascunho(token, { dataEmissao: '2026-01-01', dataValidade: '2026-01-31' })
    const rascunhoAntigo = await rascunho(token, { dataEmissao: '2026-01-01', dataValidade: '2026-01-31' })
    await esperar(chamar(token, `/orcamentos/${antigo.id}/registrar`, 'POST'), 200)

    expect(await esperar(chamar(token, `/orcamentos/${antigo.id}`), 200)).toMatchObject({ situacao: 'vencido', numero: 1 })
    // Só enviado vence: rascunho com validade passada continua rascunho.
    expect(await esperar(chamar(token, `/orcamentos/${rascunhoAntigo.id}`), 200)).toMatchObject({ situacao: 'rascunho' })
    const lista = await esperar<Resumo[]>(chamar(token, '/orcamentos?situacao=vencido'), 200)
    expect(lista.map((o) => o.id)).toEqual([antigo.id])
    expect((await chamar(token, `/orcamentos/${antigo.id}/situacao`, 'POST', { situacao: 'aprovado' })).status).toBe(409)
  })

  it('lista com busca por cliente e filtros de situação e período (RF37)', async () => {
    const token = await criarConta('registro.lista')
    const ana = await rascunho(token, { clienteNome: 'Ana Fictícia', dataEmissao: '2026-10-05' })
    const bruno = await rascunho(token, { clienteNome: 'Bruno Fictício', dataEmissao: '2026-11-10' })
    const carla = await rascunho(token, { clienteNome: 'Carla Fictícia', dataEmissao: '2026-12-15' })
    await esperar(chamar(token, `/orcamentos/${bruno.id}/registrar`, 'POST'), 200)

    const todos = await esperar<Resumo[]>(chamar(token, '/orcamentos'), 200)
    expect(todos.map((o) => o.clienteNome)).toEqual(['Carla Fictícia', 'Bruno Fictício', 'Ana Fictícia']) // mais recentes primeiro
    expect(todos[1]).toMatchObject({ numero: 1, situacao: 'enviado', precoFinal: '250.00', dataEmissao: '2026-11-10' })
    expect(todos[0]).toMatchObject({ numero: null, situacao: 'rascunho' })

    const ids = async (consulta: string) => (await esperar<Resumo[]>(chamar(token, `/orcamentos?${consulta}`), 200)).map((o) => o.id)
    expect(await ids('busca=ana')).toEqual([ana.id])
    expect(await ids('busca=FICT')).toHaveLength(3)
    expect(await ids('busca=%25')).toEqual([]) // "%" é texto, não curinga
    expect(await ids('situacao=rascunho')).toEqual([carla.id, ana.id])
    expect(await ids('situacao=enviado')).toEqual([bruno.id])
    expect(await ids('de=2026-11-01&ate=2026-11-30')).toEqual([bruno.id])
    expect(await ids('de=2026-11-01')).toEqual([carla.id, bruno.id])
    expect(await ids('busca=&situacao=&de=&ate=')).toHaveLength(3) // campos vazios valem como ausentes
    expect((await chamar(token, '/orcamentos?situacao=qualquer')).status).toBe(400)
    expect((await chamar(token, '/orcamentos?de=ontem')).status).toBe(400)
  })

  it('isola listagem, registro e situação entre marcenarias (TI01, TI02)', async () => {
    const tokenA = await criarConta('registro.isolamento.a')
    const tokenB = await criarConta('registro.isolamento.b')
    const deA = await rascunho(tokenA)
    const outroDeA = await rascunho(tokenA)
    await esperar(chamar(tokenA, `/orcamentos/${outroDeA.id}/registrar`, 'POST'), 200)

    expect(await esperar<Resumo[]>(chamar(tokenB, '/orcamentos'), 200)).toEqual([])
    expect((await chamar(tokenB, `/orcamentos/${deA.id}/registrar`, 'POST')).status).toBe(404)
    expect((await chamar(tokenB, `/orcamentos/${outroDeA.id}/situacao`, 'POST', { situacao: 'aprovado' })).status).toBe(404)
    expect(await esperar(chamar(tokenA, `/orcamentos/${deA.id}`), 200)).toMatchObject({ situacao: 'rascunho', numero: null })
    expect(await esperar(chamar(tokenA, `/orcamentos/${outroDeA.id}`), 200)).toMatchObject({ situacao: 'enviado' })
  })

  it('exige autenticação na listagem', async () => {
    expect((await fetch(`${baseUrl}/orcamentos`)).status).toBe(401)
  })
})
