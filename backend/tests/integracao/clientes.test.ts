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

async function esperar<T>(resposta: Promise<Response>, status: number): Promise<T> {
  const r = await resposta
  const corpo = r.status === 204 ? null : await r.json()
  expect(r.status, JSON.stringify(corpo)).toBe(status)
  return corpo as T
}

type Cliente = { id: string; nome: string; telefone: string | null; email: string | null; endereco: string | null; ativo: boolean }

// Dados fictícios (AGENTS §5.3, RNF15).
const cabecalho = (clienteId: string) => ({ clienteId, descricaoProjeto: 'Balcão', dataEmissao: '2026-10-01', dataValidade: '2099-12-31' })

describe('clientes (US06)', () => {
  it('exige autenticação', async () => {
    expect((await fetch(`${baseUrl}/clientes`)).status).toBe(401)
  })

  it('cadastra só com o nome, busca, filtra, edita, inativa sem excluir e reativa (RF08–RF10, D021)', async () => {
    const token = await criarConta('clientes.crud')
    const joao = await esperar<Cliente>(chamar(token, '/clientes', 'POST', { nome: 'João Fictício' }), 201)
    expect(joao).toMatchObject({ nome: 'JOÃO FICTÍCIO', telefone: null, email: null, endereco: null, ativo: true })
    const maria = await esperar<Cliente>(chamar(token, '/clientes', 'POST', {
      nome: 'Maria Fictícia', telefone: '(45) 90000-0000', email: 'maria@example.test', endereco: 'Rua Fictícia, 100',
    }), 201)
    // Homônimos são permitidos (D021).
    await esperar<Cliente>(chamar(token, '/clientes', 'POST', { nome: 'João Fictício', telefone: '(45) 91111-1111' }), 201)

    for (const corpo of [{ nome: '' }, { nome: '  ' }, {}, { nome: 'X', email: 'nao-e-email' }, { nome: 'X', telefone: '9'.repeat(31) }]) {
      expect((await chamar(token, '/clientes', 'POST', corpo)).status, JSON.stringify(corpo)).toBe(400)
    }

    const nomes = async (consulta: string) => (await esperar<Cliente[]>(chamar(token, `/clientes?${consulta}`), 200)).map((c) => c.nome)
    expect(await nomes('')).toEqual(['JOÃO FICTÍCIO', 'JOÃO FICTÍCIO', 'MARIA FICTÍCIA'])
    expect(await nomes('busca=mar')).toEqual(['MARIA FICTÍCIA'])
    expect(await nomes('busca=%25')).toEqual([]) // "%" é texto, não curinga

    const editado = await esperar<Cliente>(chamar(token, `/clientes/${joao.id}`, 'PUT', { nome: 'João Fictício Silva', telefone: '(45) 92222-2222', email: '' }), 200)
    expect(editado).toMatchObject({ nome: 'JOÃO FICTÍCIO SILVA', telefone: '(45) 92222-2222', email: null })

    await esperar(chamar(token, `/clientes/${maria.id}`, 'DELETE'), 204)
    expect(await nomes('')).not.toContain('MARIA FICTÍCIA')
    expect(await nomes('situacao=inativos')).toEqual(['MARIA FICTÍCIA'])
    expect(await nomes('situacao=todos')).toContain('MARIA FICTÍCIA') // não foi excluída

    await esperar(chamar(token, `/clientes/${maria.id}/reativar`, 'POST'), 204)
    expect(await nomes('')).toContain('MARIA FICTÍCIA')
    expect((await chamar(token, '/clientes/nao-e-uuid', 'PUT', { nome: 'X' })).status).toBe(404)
  })

  it('isola clientes entre marcenarias (TI03)', async () => {
    const tokenA = await criarConta('clientes.ti03.a')
    const tokenB = await criarConta('clientes.ti03.b')
    const deA = await esperar<Cliente>(chamar(tokenA, '/clientes', 'POST', { nome: 'Cliente da A' }), 201)

    expect(await esperar<Cliente[]>(chamar(tokenB, '/clientes?situacao=todos'), 200)).toEqual([])
    expect((await chamar(tokenB, `/clientes/${deA.id}`, 'PUT', { nome: 'Invadido' })).status).toBe(404)
    expect((await chamar(tokenB, `/clientes/${deA.id}`, 'DELETE')).status).toBe(404)
    expect((await chamar(tokenB, `/clientes/${deA.id}/reativar`, 'POST')).status).toBe(404)
    // B também não usa o cliente de A num orçamento.
    expect((await chamar(tokenB, '/orcamentos', 'POST', cabecalho(deA.id))).status).toBe(400)

    expect(await esperar<Cliente[]>(chamar(tokenA, '/clientes'), 200)).toEqual([expect.objectContaining({ nome: 'CLIENTE DA A', ativo: true })])
  })

  it('liga o orçamento ao cadastro: só cliente ativo, nome sempre atualizado (RF23, D021)', async () => {
    const token = await criarConta('clientes.vinculo')
    const ana = await esperar<Cliente>(chamar(token, '/clientes', 'POST', { nome: 'Ana Fictícia' }), 201)
    const beto = await esperar<Cliente>(chamar(token, '/clientes', 'POST', { nome: 'Beto Fictício' }), 201)

    const o = await esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', cabecalho(ana.id)), 201)
    expect(o).toMatchObject({ clienteId: ana.id, clienteNome: 'ANA FICTÍCIA' })

    // Corrigir o cadastro reflete no orçamento e na lista.
    await esperar(chamar(token, `/clientes/${ana.id}`, 'PUT', { nome: 'Ana Fictícia Souza' }), 200)
    expect(await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}`), 200)).toMatchObject({ clienteNome: 'ANA FICTÍCIA SOUZA' })
    const lista = await esperar<{ clienteNome: string }[]>(chamar(token, '/orcamentos?busca=souza'), 200)
    expect(lista.map((l) => l.clienteNome)).toEqual(['ANA FICTÍCIA SOUZA'])

    // Inativo: não entra em orçamento novo nem como troca, mas o orçamento que já tem continua.
    await esperar(chamar(token, `/clientes/${ana.id}`, 'DELETE'), 204)
    const recusado = await chamar(token, '/orcamentos', 'POST', cabecalho(ana.id))
    expect(recusado.status).toBe(400)
    expect((await recusado.json() as { mensagem: string }).mensagem).toBe('Selecione um cliente ativo')
    expect(await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}`), 200)).toMatchObject({ clienteNome: 'ANA FICTÍCIA SOUZA' })
    // Manter o mesmo cliente (já inativo) ao editar o rascunho é permitido.
    expect(await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}`, 'PUT', { ...cabecalho(ana.id), descricaoProjeto: 'Balcão grande' }), 200))
      .toMatchObject({ clienteId: ana.id, descricaoProjeto: 'Balcão grande' })
    // Trocar para outro ativo funciona; voltar para o inativo, não.
    expect(await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}`, 'PUT', cabecalho(beto.id)), 200)).toMatchObject({ clienteNome: 'BETO FICTÍCIO' })
    expect((await chamar(token, `/orcamentos/${o.id}`, 'PUT', cabecalho(ana.id))).status).toBe(400)
    expect((await chamar(token, '/orcamentos', 'POST', { ...cabecalho(beto.id), clienteId: undefined })).status).toBe(400)
  })
})
