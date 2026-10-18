import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import type { Orcamento } from '../../src/aplicacao/orcamento/orcamento'

// Spec 023: endereço do fornecedor, aviso de preço do material dentro do orçamento e lista de compras.

let servidor: Server
let baseUrl: string
let consultar: (sql: string, valores: unknown[]) => Promise<unknown>

beforeAll(async () => {
  if (!process.env.DATABASE_URL_TESTE) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL é obrigatória para integração')
    const urlTeste = new URL(process.env.DATABASE_URL)
    urlTeste.pathname = `/${decodeURIComponent(urlTeste.pathname.slice(1))}_teste`
    process.env.DATABASE_URL_TESTE = urlTeste.toString()
  }
  process.env.DATABASE_URL = process.env.DATABASE_URL_TESTE
  const { app } = await import('../../src/servidor')
  const { pool } = await import('../../src/infra/banco/pool')
  consultar = (sql, valores) => pool.query(sql, valores)
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
  const texto = await r.text()
  const corpo = texto ? JSON.parse(texto) : null
  expect(r.status, texto).toBe(status)
  return corpo as T
}

type Grupo = {
  fornecedor: { id: string; nome: string; telefone: string | null; endereco: string | null } | null
  itens: { descricao: string; quantidade: string; unidade: string }[]
}

async function conta(rotulo: string) {
  const r = await fetch(`${baseUrl}/auth/cadastro`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeMarcenaria: 'Marcenaria Exemplo', nomeResponsavel: 'Responsável Fictício', email: `${rotulo}.${Date.now()}@example.test`, senha: 'teste1234' }),
  })
  const token = (await r.json() as { token: string }).token
  const cliente = await esperar<{ id: string }>(chamar(token, '/clientes', 'POST', { nome: 'Cliente Fictício' }), 201)
  return { token, clienteId: cliente.id }
}

const novoFornecedor = (token: string, corpo: object) => esperar<{ id: string; nome: string; endereco: string | null }>(chamar(token, '/fornecedores', 'POST', corpo), 201)
const novoMaterial = (token: string, corpo: object) => esperar<{ id: string }>(chamar(token, '/materiais', 'POST', { unidade: 'ch', custoUnitario: '289,90', ...corpo }), 201)
const novoOrcamento = (token: string, clienteId: string) =>
  esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', { clienteId, descricaoProjeto: 'Armário', dataEmissao: '2026-10-01', dataValidade: '2099-12-31' }), 201)
const comMaterial = (token: string, o: Orcamento, catalogoId: string, quantidade = '2,5') =>
  esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'catalogo', tipo: 'material', catalogoId, quantidade }), 201)

describe('endereço do fornecedor', () => {
  it('é opcional, editável e aparece na lista', async () => {
    const { token } = await conta('end.forn')
    const f = await novoFornecedor(token, { nome: 'Madeireira Central', endereco: 'Rua Fictícia, 100' })
    expect(f.endereco).toBe('Rua Fictícia, 100')
    const editado = await esperar<{ endereco: string | null }>(chamar(token, `/fornecedores/${f.id}`, 'PUT', { nome: 'Madeireira Central', endereco: '' }), 200)
    expect(editado.endereco).toBeNull()
    expect((await novoFornecedor(token, { nome: 'Sem Endereço' })).endereco).toBeNull()
  })
})

describe('aviso de preço do material dentro do orçamento (RF58)', () => {
  it('item do catálogo traz custo atual e dias; item avulso vem sem aviso', async () => {
    const { token, clienteId } = await conta('aviso.item')
    const { id } = await novoMaterial(token, { nome: 'MDF' })
    let o = await comMaterial(token, await novoOrcamento(token, clienteId), id)
    o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'avulso', tipo: 'material', descricao: 'PARAFUSO', unidade: 'un', quantidade: '10', valorUnitario: '0,5' }), 201)

    const [catalogo, avulso] = o.itens
    expect(catalogo).toMatchObject({ materialCustoAtual: '289.9000', materialDias: 0, precoDoMaterialAntigo: false, custoDoCatalogoMudou: false })
    expect(avulso).toMatchObject({ materialCustoAtual: null, materialDias: null, precoDoMaterialAntigo: false, custoDoCatalogoMudou: false })
  })

  it('preço do material com mais de 30 dias é sinalizado; "continua o mesmo" tira o aviso sem mudar o item', async () => {
    const { token, clienteId } = await conta('aviso.antigo')
    const { id } = await novoMaterial(token, { nome: 'MDF' })
    const o = await comMaterial(token, await novoOrcamento(token, clienteId), id)
    await consultar("UPDATE material SET custo_atualizado_em = now() - interval '45 days' WHERE id=$1", [id])

    const antigo = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}`), 200)
    expect(antigo.itens[0]).toMatchObject({ materialDias: 45, precoDoMaterialAntigo: true })

    await esperar(chamar(token, `/materiais/${id}/confirmar-preco`, 'POST'), 200)
    const confirmado = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}`), 200)
    expect(confirmado.itens[0]).toMatchObject({ materialDias: 0, precoDoMaterialAntigo: false, valorUnitario: '289.9000' })
    expect(confirmado.memorial).toEqual(antigo.memorial)
  })

  it('custo do catálogo que mudou depois do item é sinalizado; "usar o novo custo" atualiza o item e o preço', async () => {
    const { token, clienteId } = await conta('aviso.mudou')
    const { id } = await novoMaterial(token, { nome: 'MDF' })
    const o = await comMaterial(token, await novoOrcamento(token, clienteId), id, '2')
    await esperar(chamar(token, `/materiais/${id}`, 'PUT', { nome: 'MDF', unidade: 'ch', custoUnitario: '310,00' }), 200)

    const aviso = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}`), 200)
    expect(aviso.itens[0]).toMatchObject({ valorUnitario: '289.9000', materialCustoAtual: '310.0000', custoDoCatalogoMudou: true })

    const item = aviso.itens[0]
    const novo = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens/${item.id}`, 'PUT', { quantidade: item.quantidade, valorUnitario: item.materialCustoAtual }), 200)
    expect(novo.itens[0]).toMatchObject({ valorUnitario: '310.0000', custoDoCatalogoMudou: false })
    expect(novo.memorial.subtotalMateriais).toBe('620.00')
  })
})

describe('lista de compras (RF58)', () => {
  it('agrupa os materiais por fornecedor, deixa quem não tem fornecedor no fim e ignora serviço', async () => {
    const { token, clienteId } = await conta('compras.grupos')
    const b = await novoFornecedor(token, { nome: 'Ferragens Sul', telefone: '(45) 90000-0001' })
    const a = await novoFornecedor(token, { nome: 'Madeireira Central', telefone: '(45) 90000-0002', endereco: 'Rua Fictícia, 100' })
    const mdf = await novoMaterial(token, { nome: 'MDF BRANCO', fornecedorId: a.id })
    const fita = await novoMaterial(token, { nome: 'FITA DE BORDA', unidade: 'm', fornecedorId: a.id })
    const dobradica = await novoMaterial(token, { nome: 'DOBRADIÇA', unidade: 'un', fornecedorId: b.id })
    const solto = await novoMaterial(token, { nome: 'COLA' })

    let o = await novoOrcamento(token, clienteId)
    for (const [catalogoId, qtd] of [[solto.id, '1'], [dobradica.id, '12'], [mdf.id, '2,5'], [fita.id, '30']]) o = await comMaterial(token, o, catalogoId, qtd)
    o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'avulso', tipo: 'material', descricao: 'PARAFUSO', unidade: 'un', quantidade: '50', valorUnitario: '0,1' }), 201)
    o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'avulso', tipo: 'servico', descricao: 'MONTAGEM', unidade: 'h', quantidade: '8', valorUnitario: '50' }), 201)

    const { grupos } = await esperar<{ grupos: Grupo[] }>(chamar(token, `/orcamentos/${o.id}/lista-de-compras`), 200)
    expect(grupos.map((g) => g.fornecedor?.nome ?? null)).toEqual(['FERRAGENS SUL', 'MADEIREIRA CENTRAL', null])
    expect(grupos[1]).toMatchObject({ fornecedor: { telefone: '(45) 90000-0002', endereco: 'Rua Fictícia, 100' } })
    expect(grupos[1].itens.map((i) => [i.descricao, i.quantidade, i.unidade])).toEqual([['MDF BRANCO', '2.500', 'ch'], ['FITA DE BORDA', '30.000', 'm']])
    expect(grupos[0].itens.map((i) => i.descricao)).toEqual(['DOBRADIÇA'])
    expect(grupos[2].itens.map((i) => i.descricao).sort()).toEqual(['COLA', 'PARAFUSO'])
    // serviço (MONTAGEM) fica de fora
    expect(grupos.flatMap((g) => g.itens.map((i) => i.descricao))).not.toContain('MONTAGEM')
  })

  it('usa o fornecedor atual do material e nunca mostra valores', async () => {
    const { token, clienteId } = await conta('compras.atual')
    const a = await novoFornecedor(token, { nome: 'Loja A' })
    const b = await novoFornecedor(token, { nome: 'Loja B' })
    const { id } = await novoMaterial(token, { nome: 'MDF', fornecedorId: a.id })
    const o = await comMaterial(token, await novoOrcamento(token, clienteId), id)
    await esperar(chamar(token, `/materiais/${id}`, 'PUT', { nome: 'MDF', unidade: 'ch', custoUnitario: '289,90', fornecedorId: b.id }), 200)

    const { grupos } = await esperar<{ grupos: Grupo[] }>(chamar(token, `/orcamentos/${o.id}/lista-de-compras`), 200)
    expect(grupos.map((g) => g.fornecedor?.nome)).toEqual(['LOJA B'])
    expect(Object.keys(grupos[0].itens[0]).sort()).toEqual(['descricao', 'quantidade', 'unidade'])
  })

  it('orçamento sem materiais dá lista vazia; orçamento de outra marcenaria ou inexistente dá 404; exige login', async () => {
    const a = await conta('compras.iso.a')
    const b = await conta('compras.iso.b')
    const o = await novoOrcamento(a.token, a.clienteId)
    expect((await esperar<{ grupos: Grupo[] }>(chamar(a.token, `/orcamentos/${o.id}/lista-de-compras`), 200)).grupos).toEqual([])
    await esperar(chamar(b.token, `/orcamentos/${o.id}/lista-de-compras`), 404)
    await esperar(chamar(a.token, '/orcamentos/nao-e-uuid/lista-de-compras'), 404)
    expect((await fetch(`${baseUrl}/orcamentos/${o.id}/lista-de-compras`)).status).toBe(401)
  })
})
