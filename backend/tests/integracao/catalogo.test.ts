import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'

let servidor: Server
let baseUrl: string

type Item = { id: string; nome: string; ativo: boolean; custo_unitario?: string; valor_unitario?: string; unidade?: string }

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

describe('catálogo', () => {
  it('exige autenticação', async () => {
    expect((await fetch(`${baseUrl}/materiais`)).status).toBe(401)
    expect((await fetch(`${baseUrl}/servicos`)).status).toBe(401)
  })

  it('material: cadastra, busca, edita, inativa e não exclui fisicamente', async () => {
    const token = await criarConta('material')
    const criado = await chamar(token, '/materiais', 'POST', { nome: 'MDF 18 mm', unidade: 'ch', custoUnitario: '1,2350' })
    expect(criado.status).toBe(201)
    const material = await criado.json() as Item
    expect(material.custo_unitario).toBe('1.2350')
    expect(material.ativo).toBe(true)

    const invalido = await chamar(token, '/materiais', 'POST', { nome: 'Sem custo', unidade: 'un', custoUnitario: '0' })
    expect(invalido.status).toBe(400)

    const duplicado = await chamar(token, '/materiais', 'POST', { nome: 'MDF 18 mm', unidade: 'ch', custoUnitario: '2' })
    expect(duplicado.status).toBe(409)

    const busca = await (await chamar(token, '/materiais?busca=mdf')).json() as Item[]
    expect(busca.map((i) => i.nome)).toEqual(['MDF 18 mm'])
    expect(await (await chamar(token, '/materiais?busca=parafuso')).json()).toEqual([])

    const editado = await chamar(token, `/materiais/${material.id}`, 'PUT', { nome: 'MDF 18 mm cru', unidade: 'm²', custoUnitario: '99,9999' })
    expect(editado.status).toBe(200)
    expect(await editado.json()).toMatchObject({ nome: 'MDF 18 mm cru', unidade: 'm²', custo_unitario: '99.9999' })

    expect((await chamar(token, `/materiais/${material.id}`, 'DELETE')).status).toBe(204)
    expect(await (await chamar(token, '/materiais')).json()).toEqual([])
    const inativos = await (await chamar(token, '/materiais?situacao=inativos')).json() as Item[]
    expect(inativos).toHaveLength(1)
    expect(inativos[0]).toMatchObject({ id: material.id, ativo: false })
    expect(await (await chamar(token, '/materiais?situacao=todos')).json()).toHaveLength(1)
  })

  it('serviço: cadastra, edita e inativa', async () => {
    const token = await criarConta('servico')
    const criado = await chamar(token, '/servicos', 'POST', { nome: 'Montagem', tipoCobranca: 'hora', valorUnitario: '80,50' })
    expect(criado.status).toBe(201)
    const servico = await criado.json() as Item

    expect((await chamar(token, '/servicos', 'POST', { nome: 'Frete', tipoCobranca: 'dia', valorUnitario: '10' })).status).toBe(400)

    const editado = await chamar(token, `/servicos/${servico.id}`, 'PUT', { nome: 'Montagem no local', tipoCobranca: 'unidade', valorUnitario: '300' })
    expect(await editado.json()).toMatchObject({ nome: 'Montagem no local', tipo_cobranca: 'unidade', valor_unitario: '300.0000' })

    expect((await chamar(token, `/servicos/${servico.id}`, 'DELETE')).status).toBe(204)
    expect(await (await chamar(token, '/servicos')).json()).toEqual([])
    expect(await (await chamar(token, '/servicos?situacao=inativos')).json()).toHaveLength(1)
  })

  it('TI01: uma marcenaria não vê, edita nem inativa registros de outra', async () => {
    const tokenA = await criarConta('isolamentoa')
    const tokenB = await criarConta('isolamentob')
    const material = await (await chamar(tokenA, '/materiais', 'POST', { nome: 'Cola PVA', unidade: 'kg', custoUnitario: '12' })).json() as Item
    const servico = await (await chamar(tokenA, '/servicos', 'POST', { nome: 'Corte', tipoCobranca: 'hora', valorUnitario: '50' })).json() as Item

    expect(await (await chamar(tokenB, '/materiais?situacao=todos')).json()).toEqual([])
    expect(await (await chamar(tokenB, '/servicos?situacao=todos')).json()).toEqual([])
    expect((await chamar(tokenB, `/materiais/${material.id}`, 'PUT', { nome: 'Invadido', unidade: 'kg', custoUnitario: '1' })).status).toBe(404)
    expect((await chamar(tokenB, `/materiais/${material.id}`, 'DELETE')).status).toBe(404)
    expect((await chamar(tokenB, `/servicos/${servico.id}`, 'DELETE')).status).toBe(404)
    expect((await chamar(tokenB, '/materiais/nao-e-uuid', 'DELETE')).status).toBe(404)

    // O registro da marcenaria A permanece intacto e ativo.
    const restante = await (await chamar(tokenA, '/materiais')).json() as Item[]
    expect(restante).toHaveLength(1)
    expect(restante[0]).toMatchObject({ nome: 'Cola PVA', ativo: true })

    // Mesmo nome é permitido em marcenarias diferentes.
    expect((await chamar(tokenB, '/materiais', 'POST', { nome: 'Cola PVA', unidade: 'kg', custoUnitario: '12' })).status).toBe(201)
  })
})
