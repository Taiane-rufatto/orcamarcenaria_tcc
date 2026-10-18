import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'

// Spec 020: fornecedor, fornecedor do material, histórico de custo e alerta de preço antigo.

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

type Fornecedor = { id: string; nome: string; telefone: string | null; ativo: boolean; padrao: boolean }
type Material = {
  id: string; nome: string; custo_unitario: string; fornecedor_id: string | null; fornecedor_nome: string | null
  dias_desde_atualizacao: number; preco_antigo: boolean
}
type Linha = { custo_unitario: string; fornecedor_nome: string | null }

async function conta(rotulo: string) {
  const r = await fetch(`${baseUrl}/auth/cadastro`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeMarcenaria: 'Marcenaria Exemplo', nomeResponsavel: 'Responsável Fictício', email: `${rotulo}.${Date.now()}@example.test`, senha: 'teste1234' }),
  })
  return (await r.json() as { token: string }).token
}

const novoFornecedor = (token: string, nome: string, telefone?: string) => esperar<Fornecedor>(chamar(token, '/fornecedores', 'POST', { nome, telefone }), 201)
const novoMaterial = (token: string, corpo: object) =>
  esperar<{ id: string }>(chamar(token, '/materiais', 'POST', { nome: 'MDF BRANCO 18MM', unidade: 'ch', custoUnitario: '289,90', ...corpo }), 201)
const material = async (token: string, id: string) =>
  (await esperar<Material[]>(chamar(token, '/materiais'), 200)).find((m) => m.id === id)!
const historico = (token: string, id: string) => esperar<Linha[]>(chamar(token, `/materiais/${id}/historico`), 200)

describe('cadastro de fornecedores (RF49)', () => {
  it('exige autenticação', async () => {
    expect((await fetch(`${baseUrl}/fornecedores`)).status).toBe(401)
  })

  it('cadastra em maiúsculas, edita, busca, inativa e reativa', async () => {
    const token = await conta('forn.crud')
    const f = await novoFornecedor(token, 'madeireira central', '(45) 90000-0000')
    expect(f).toMatchObject({ nome: 'MADEIREIRA CENTRAL', telefone: '(45) 90000-0000', ativo: true })

    const editado = await esperar<Fornecedor>(chamar(token, `/fornecedores/${f.id}`, 'PUT', { nome: 'Madeireira Central Ltda' }), 200)
    expect(editado).toMatchObject({ nome: 'MADEIREIRA CENTRAL LTDA', telefone: null })
    expect((await esperar<Fornecedor[]>(chamar(token, '/fornecedores?busca=central'), 200)).map((x) => x.id)).toEqual([f.id])

    await esperar(chamar(token, `/fornecedores/${f.id}`, 'DELETE'), 204)
    expect(await esperar<Fornecedor[]>(chamar(token, '/fornecedores'), 200)).toEqual([])
    expect((await esperar<Fornecedor[]>(chamar(token, '/fornecedores?situacao=inativos'), 200))[0]).toMatchObject({ id: f.id, ativo: false })
    await esperar(chamar(token, `/fornecedores/${f.id}/reativar`, 'POST'), 204)
    expect((await esperar<Fornecedor[]>(chamar(token, '/fornecedores'), 200))).toHaveLength(1)
  })

  it('nome repetido (mesmo com outra caixa) dá 409; nome vazio dá 400', async () => {
    const token = await conta('forn.dup')
    await novoFornecedor(token, 'Ferragens Sul')
    await esperar(chamar(token, '/fornecedores', 'POST', { nome: 'ferragens sul' }), 409)
    await esperar(chamar(token, '/fornecedores', 'POST', { nome: '  ' }), 400)
  })

  it('uma marcenaria não vê, edita nem usa fornecedor de outra', async () => {
    const a = await conta('forn.iso.a')
    const b = await conta('forn.iso.b')
    const f = await novoFornecedor(a, 'Fornecedor da A')
    expect(await esperar<Fornecedor[]>(chamar(b, '/fornecedores'), 200)).toEqual([])
    await esperar(chamar(b, `/fornecedores/${f.id}`, 'PUT', { nome: 'X' }), 404)
    await esperar(chamar(b, `/fornecedores/${f.id}`, 'DELETE'), 404)
    await esperar(chamar(b, '/materiais', 'POST', { nome: 'MDF', unidade: 'ch', custoUnitario: '1', fornecedorId: f.id }), 400)
  })
})

describe('fornecedor e histórico de preço do material (RF50–RF52)', () => {
  it('o material guarda o fornecedor; criar já registra a primeira linha do histórico', async () => {
    const token = await conta('mat.criar')
    const f = await novoFornecedor(token, 'Madeireira Central')
    const { id } = await novoMaterial(token, { fornecedorId: f.id })

    expect(await material(token, id)).toMatchObject({ fornecedor_id: f.id, fornecedor_nome: 'MADEIREIRA CENTRAL', dias_desde_atualizacao: 0, preco_antigo: false })
    expect(await historico(token, id)).toEqual([{ custo_unitario: '289.9000', fornecedor_nome: 'MADEIREIRA CENTRAL', registrado_em: expect.any(String) }])
  })

  it('sem fornecedor ("" ou ausente) fica sem fornecedor', async () => {
    const token = await conta('mat.sem')
    const { id } = await novoMaterial(token, { fornecedorId: '' })
    expect(await material(token, id)).toMatchObject({ fornecedor_id: null, fornecedor_nome: null })
  })

  it('trocar o custo ou o fornecedor grava no histórico; mudar só o nome não grava', async () => {
    const token = await conta('mat.historico')
    const a = await novoFornecedor(token, 'Loja A')
    const b = await novoFornecedor(token, 'Loja B')
    const { id } = await novoMaterial(token, { fornecedorId: a.id })
    const corpo = { nome: 'MDF BRANCO 18MM', unidade: 'ch', custoUnitario: '289,90', fornecedorId: a.id }

    await esperar(chamar(token, `/materiais/${id}`, 'PUT', { ...corpo, nome: 'MDF BRANCO 18 MM' }), 200)
    expect(await historico(token, id)).toHaveLength(1) // só o nome mudou

    await esperar(chamar(token, `/materiais/${id}`, 'PUT', { ...corpo, custoUnitario: '310,00' }), 200)
    await esperar(chamar(token, `/materiais/${id}`, 'PUT', { ...corpo, custoUnitario: '310,00', fornecedorId: b.id }), 200)
    expect((await historico(token, id)).map((l) => [l.custo_unitario, l.fornecedor_nome])).toEqual([
      ['310.0000', 'LOJA B'], ['310.0000', 'LOJA A'], ['289.9000', 'LOJA A'],
    ])
  })

  it('fornecedor inativo ou inexistente não pode ser escolhido (400)', async () => {
    const token = await conta('mat.inativo')
    const f = await novoFornecedor(token, 'Loja Fechada')
    await esperar(chamar(token, `/fornecedores/${f.id}`, 'DELETE'), 204)
    await esperar(chamar(token, '/materiais', 'POST', { nome: 'MDF', unidade: 'ch', custoUnitario: '1', fornecedorId: f.id }), 400)
    await esperar(chamar(token, '/materiais', 'POST', { nome: 'MDF', unidade: 'ch', custoUnitario: '1', fornecedorId: 'nao-e-uuid' }), 400)
  })

  it('preço com mais de 30 dias fica antigo; confirmar renova a data e registra no histórico sem mudar o custo', async () => {
    const token = await conta('mat.antigo')
    const { id } = await novoMaterial(token, {})
    expect((await material(token, id)).preco_antigo).toBe(false)

    await consultar("UPDATE material SET custo_atualizado_em = now() - interval '31 days' WHERE id=$1", [id])
    expect(await material(token, id)).toMatchObject({ dias_desde_atualizacao: 31, preco_antigo: true })
    await consultar("UPDATE material SET custo_atualizado_em = now() - interval '30 days' WHERE id=$1", [id])
    expect((await material(token, id)).preco_antigo).toBe(false) // 30 dias ainda não é "mais de 30"

    await consultar("UPDATE material SET custo_atualizado_em = now() - interval '45 days' WHERE id=$1", [id])
    await esperar(chamar(token, `/materiais/${id}/confirmar-preco`, 'POST'), 200)
    expect(await material(token, id)).toMatchObject({ custo_unitario: '289.9000', dias_desde_atualizacao: 0, preco_antigo: false })
    expect(await historico(token, id)).toHaveLength(2)
  })

  it('confirmar preço e ver histórico de material de outra marcenaria dão 404', async () => {
    const a = await conta('mat.iso.a')
    const b = await conta('mat.iso.b')
    const { id } = await novoMaterial(a, {})
    await esperar(chamar(b, `/materiais/${id}/confirmar-preco`, 'POST'), 404)
    await esperar(chamar(b, `/materiais/${id}/historico`), 404)
  })
})

describe('fornecedor padrão (RF53)', () => {
  const padroes = async (token: string) =>
    (await esperar<Fornecedor[]>(chamar(token, '/fornecedores?situacao=todos'), 200)).filter((f) => f.padrao).map((f) => f.nome)

  it('ninguém é padrão no começo; escolher um marca só ele; escolher outro troca', async () => {
    const token = await conta('padrao.troca')
    const a = await novoFornecedor(token, 'Loja A')
    const b = await novoFornecedor(token, 'Loja B')
    expect(await padroes(token)).toEqual([])

    await esperar(chamar(token, `/fornecedores/${a.id}/padrao`, 'POST'), 204)
    expect(await padroes(token)).toEqual(['LOJA A'])
    await esperar(chamar(token, `/fornecedores/${b.id}/padrao`, 'POST'), 204)
    expect(await padroes(token)).toEqual(['LOJA B'])
  })

  it('tirar o padrão deixa sem nenhum', async () => {
    const token = await conta('padrao.tirar')
    const a = await novoFornecedor(token, 'Loja A')
    await esperar(chamar(token, `/fornecedores/${a.id}/padrao`, 'POST'), 204)
    await esperar(chamar(token, '/fornecedores/padrao', 'DELETE'), 204)
    expect(await padroes(token)).toEqual([])
  })

  it('inativar o fornecedor padrão tira o padrão; fornecedor inativo não pode ser escolhido (404)', async () => {
    const token = await conta('padrao.inativo')
    const a = await novoFornecedor(token, 'Loja A')
    await esperar(chamar(token, `/fornecedores/${a.id}/padrao`, 'POST'), 204)
    await esperar(chamar(token, `/fornecedores/${a.id}`, 'DELETE'), 204)
    expect(await padroes(token)).toEqual([])
    await esperar(chamar(token, `/fornecedores/${a.id}/padrao`, 'POST'), 404)
  })

  it('o padrão de uma marcenaria não vale para outra, que também não pode escolher fornecedor alheio', async () => {
    const a = await conta('padrao.iso.a')
    const b = await conta('padrao.iso.b')
    const fa = await novoFornecedor(a, 'Loja da A')
    const fb = await novoFornecedor(b, 'Loja da B')
    await esperar(chamar(a, `/fornecedores/${fa.id}/padrao`, 'POST'), 204)
    expect(await padroes(b)).toEqual([])
    await esperar(chamar(b, `/fornecedores/${fa.id}/padrao`, 'POST'), 404)
    await esperar(chamar(a, `/fornecedores/${fb.id}/padrao`, 'POST'), 404)
  })

  it('escolher o padrão não mexe na configuração de lucro nem de equilíbrio', async () => {
    const token = await conta('padrao.config')
    await esperar(chamar(token, '/configuracoes/equilibrio', 'PUT', { lucroMinimo: '30' }), 200)
    const a = await novoFornecedor(token, 'Loja A')
    await esperar(chamar(token, `/fornecedores/${a.id}/padrao`, 'POST'), 204)
    const config = await esperar<{ equilibrio: { lucroMinimo: string | null } }>(chamar(token, '/configuracoes'), 200)
    expect(config.equilibrio.lucroMinimo).toBe('30.00')
  })
})
