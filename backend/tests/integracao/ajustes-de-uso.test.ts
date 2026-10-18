import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import type { Orcamento } from '../../src/aplicacao/orcamento/orcamento'

// Spec 022: CPF/CNPJ do cliente, busca de orçamento por número e mensagem de quantidade negativa.

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

type Cliente = { id: string; nome: string; documento: string | null }
type Resumo = { id: string; numero: number | null; clienteNome: string }

async function conta(rotulo: string) {
  const r = await fetch(`${baseUrl}/auth/cadastro`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeMarcenaria: 'Marcenaria Exemplo', nomeResponsavel: 'Responsável Fictício', email: `${rotulo}.${Date.now()}@example.test`, senha: 'teste1234' }),
  })
  return (await r.json() as { token: string }).token
}

const novoCliente = (token: string, corpo: object) => esperar<Cliente>(chamar(token, '/clientes', 'POST', corpo), 201)

describe('CPF ou CNPJ do cliente (RF54)', () => {
  it('é opcional: o cliente só com o nome continua valendo', async () => {
    const token = await conta('doc.opcional')
    expect(await novoCliente(token, { nome: 'Ana Fictícia' })).toMatchObject({ nome: 'ANA FICTÍCIA', documento: null })
    expect(await novoCliente(token, { nome: 'Bia Fictícia', documento: '' })).toMatchObject({ documento: null })
  })

  it('aceita CPF e CNPJ com ou sem pontuação e guarda só os dígitos', async () => {
    const token = await conta('doc.valido')
    expect((await novoCliente(token, { nome: 'Ana', documento: '529.982.247-25' })).documento).toBe('52998224725')
    expect((await novoCliente(token, { nome: 'Bia', documento: '11222333000181' })).documento).toBe('11222333000181')
  })

  it.each([
    ['dígito verificador errado', '529.982.247-26'],
    ['sequência repetida', '111.111.111-11'],
    ['tamanho errado', '1234567'],
    ['letras', 'abcdefghijk'],
  ])('recusa com 400 e mensagem clara: %s', async (_nome, documento) => {
    const token = await conta('doc.invalido')
    const erro = await esperar<{ mensagem: string }>(chamar(token, '/clientes', 'POST', { nome: 'Ana', documento }), 400)
    expect(erro.mensagem).toBe('CPF ou CNPJ inválido: confira os números')
  })

  it('edita para trocar e para limpar o documento', async () => {
    const token = await conta('doc.editar')
    const ana = await novoCliente(token, { nome: 'Ana', documento: '52998224725' })
    expect((await esperar<Cliente>(chamar(token, `/clientes/${ana.id}`, 'PUT', { nome: 'Ana', documento: '11.222.333/0001-81' }), 200)).documento).toBe('11222333000181')
    expect((await esperar<Cliente>(chamar(token, `/clientes/${ana.id}`, 'PUT', { nome: 'Ana', documento: '' }), 200)).documento).toBeNull()
  })

  it('o documento não é único: dois clientes podem repetir (homônimos e cadastros duplicados)', async () => {
    const token = await conta('doc.repetido')
    await novoCliente(token, { nome: 'Ana', documento: '52998224725' })
    await novoCliente(token, { nome: 'Ana Maria', documento: '52998224725' })
  })
})

// Orçamento registrado recebe número; o rascunho não tem.
async function orcamentoRegistrado(token: string, clienteId: string) {
  const o = await esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', {
    clienteId, descricaoProjeto: 'Armário', dataEmissao: '2026-10-01', dataValidade: '2099-12-31',
  }), 201)
  await esperar(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'avulso', tipo: 'material', descricao: 'MDF', unidade: 'un', quantidade: '1', valorUnitario: '100' }), 201)
  return esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/registrar`, 'POST'), 200)
}

describe('busca de orçamento por número (RF55)', () => {
  it('"2", "#2" e "nº 2" acham o orçamento de número 2; o nome do cliente continua funcionando', async () => {
    const token = await conta('busca.numero')
    const ana = await novoCliente(token, { nome: 'Ana Fictícia' })
    const bia = await novoCliente(token, { nome: 'Bia Fictícia' })
    const um = await orcamentoRegistrado(token, ana.id)
    const dois = await orcamentoRegistrado(token, bia.id)
    expect([um.numero, dois.numero]).toEqual([1, 2])
    const ids = async (busca: string) => (await esperar<Resumo[]>(chamar(token, `/orcamentos?busca=${encodeURIComponent(busca)}`), 200)).map((r) => r.id)

    for (const termo of ['2', '#2', 'nº 2', 'N° 2', 'no 2']) expect(await ids(termo), termo).toEqual([dois.id])
    expect(await ids('1')).toEqual([um.id])
    expect(await ids('999')).toEqual([])
    expect(await ids('ana')).toEqual([um.id])
    expect(await ids('FICT')).toHaveLength(2)
  })

  it('número que também aparece no nome do cliente traz os dois resultados', async () => {
    const token = await conta('busca.nome')
    const cliente2 = await novoCliente(token, { nome: 'Cliente 2' })
    const outro = await novoCliente(token, { nome: 'Outro' })
    const um = await orcamentoRegistrado(token, cliente2.id) // número 1, cliente "CLIENTE 2"
    const dois = await orcamentoRegistrado(token, outro.id) // número 2
    const achados = (await esperar<Resumo[]>(chamar(token, '/orcamentos?busca=2'), 200)).map((r) => r.id).sort()
    expect(achados).toEqual([um.id, dois.id].sort())
  })

  it('só encontra orçamentos da própria marcenaria', async () => {
    const a = await conta('busca.iso.a')
    const b = await conta('busca.iso.b')
    await orcamentoRegistrado(a, (await novoCliente(a, { nome: 'Ana' })).id)
    expect(await esperar<Resumo[]>(chamar(b, '/orcamentos?busca=1'), 200)).toEqual([])
  })
})

describe('mensagens de quantidade (achado do 008)', () => {
  const incluir = async (quantidade: string) => {
    const token = await conta('qtd')
    const cliente = await novoCliente(token, { nome: 'Ana' })
    const o = await esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', { clienteId: cliente.id, descricaoProjeto: 'X', dataEmissao: '2026-10-01' }), 201)
    const r = await chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'avulso', tipo: 'material', descricao: 'MDF', unidade: 'un', quantidade, valorUnitario: '10' })
    return { status: r.status, mensagem: ((await r.json()) as { mensagem: string }).mensagem }
  }

  it.each([
    ['-1', 'A quantidade não pode ser negativa'],
    ['-0,5', 'A quantidade não pode ser negativa'],
    ['0', 'A quantidade deve ser maior que zero'],
    ['1,5555', 'Informe a quantidade com até 3 casas decimais'],
    ['abc', 'Informe a quantidade com até 3 casas decimais'],
  ])('quantidade %s → "%s"', async (quantidade, mensagem) => {
    expect(await incluir(quantidade)).toEqual({ status: 400, mensagem })
  })
})
