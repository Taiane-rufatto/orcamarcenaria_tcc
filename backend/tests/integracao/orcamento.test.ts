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
  const { token } = await resposta.json() as { token: string }
  // Toda conta de teste nasce com um cliente fictício padrão: o orçamento exige cliente cadastrado (D021).
  clientePadrao.set(token, await novoCliente(token, 'Cliente Fictício'))
  return token
}

const clientePadrao = new Map<string, string>()

async function novoCliente(token: string, nome: string): Promise<string> {
  const resposta = await chamar(token, '/clientes', 'POST', { nome })
  expect(resposta.status).toBe(201)
  return (await resposta.json() as { id: string }).id
}

const chamar = (token: string, rota: string, metodo = 'GET', corpo?: unknown) => fetch(`${baseUrl}${rota}`, {
  method: metodo,
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: corpo === undefined ? undefined : JSON.stringify(corpo),
})

async function esperar(resposta: Promise<Response>, status: number): Promise<Orcamento> {
  const r = await resposta
  const corpo = await r.json()
  expect(r.status, JSON.stringify(corpo)).toBe(status)
  return corpo as Orcamento
}

async function cadastrar(token: string, rota: 'materiais' | 'servicos', corpo: object): Promise<string> {
  const resposta = await chamar(token, `/${rota}`, 'POST', corpo)
  expect(resposta.status).toBe(201)
  return (await resposta.json() as { id: string }).id
}

// Dados fictícios (AGENTS §5.3).
const cabecalho = (token: string) => ({
  clienteId: clientePadrao.get(token)!, descricaoProjeto: 'Armário de cozinha', dataEmissao: '2026-10-01', dataValidade: '2026-10-31',
})

describe('orçamento', () => {
  it('exige autenticação', async () => {
    expect((await fetch(`${baseUrl}/orcamentos`, { method: 'POST' })).status).toBe(401)
  })

  it('CT03 e CT04 pela API: exemplo de regras-de-calculo.md §4 com diferença nula', async () => {
    const token = await criarConta('ct03')
    const mdf = await cadastrar(token, 'materiais', { nome: 'MDF branco 18 mm', unidade: 'ch', custoUnitario: '289,90' })
    const fita = await cadastrar(token, 'materiais', { nome: 'Fita de borda 22 mm', unidade: 'm', custoUnitario: '1,2350' })
    const corredica = await cadastrar(token, 'materiais', { nome: 'Corrediça 450 mm', unidade: 'un', custoUnitario: '34,50' })
    const dobradica = await cadastrar(token, 'materiais', { nome: 'Dobradiça com amortecedor', unidade: 'un', custoUnitario: '8,90' })
    const corte = await cadastrar(token, 'servicos', { nome: 'Corte e usinagem', tipoCobranca: 'hora', valorUnitario: '45' })
    const montagem = await cadastrar(token, 'servicos', { nome: 'Montagem e instalação', tipoCobranca: 'hora', valorUnitario: '55' })

    let o = await esperar(chamar(token, '/orcamentos', 'POST', { ...cabecalho(token), modoLucro: 'margem', percentualLucro: '30', regraArredondamento: 'dezena' }), 201)
    const id = o.id
    for (const [tipo, catalogoId, quantidade] of [
      ['material', mdf, '2,5'], ['material', fita, '30'], ['material', corredica, '6'], ['material', dobradica, '12'],
      ['servico', corte, '8'], ['servico', montagem, '6'],
    ]) {
      o = await esperar(chamar(token, `/orcamentos/${id}/itens`, 'POST', { origem: 'catalogo', tipo, catalogoId, quantidade }), 201)
    }
    await esperar(chamar(token, `/orcamentos/${id}/custos-adicionais`, 'POST', { descricao: 'Frete de entrega', valor: '120,00' }), 201)
    o = await esperar(chamar(token, `/orcamentos/${id}/custos-adicionais`, 'POST', { descricao: 'Ferragens diversas', valor: '45,50' }), 201)

    expect(o.itens.map((i) => i.valorLinha)).toEqual(['724.75', '37.05', '207.00', '106.80', '360.00', '330.00'])
    expect(o.itens[4]).toMatchObject({ descricao: 'CORTE E USINAGEM', unidade: 'h', valorUnitario: '45.0000' })
    expect(o.memorial).toEqual({
      subtotalMateriais: '1075.60', subtotalServicos: '690.00', totalAdicionais: '165.50', custoDiretoTotal: '1931.10',
      valorLucro: '827.61', multiplicadorEquivalente: null, ajusteArredondamento: '1.29', precoFinal: '2760.00',
    })

    // CT04: só o modo muda, e o recálculo acontece na própria alteração (D019).
    o = await esperar(chamar(token, `/orcamentos/${id}`, 'PUT', { ...cabecalho(token), modoLucro: 'markup', percentualLucro: '30', regraArredondamento: 'dezena' }), 200)
    expect(o.memorial).toMatchObject({ valorLucro: '579.33', multiplicadorEquivalente: '1.30', ajusteArredondamento: '9.57', precoFinal: '2520.00' })

    // Consulta devolve exatamente o que foi gravado.
    expect(await esperar(chamar(token, `/orcamentos/${id}`), 200)).toEqual(o)
  })

  it('usa os padrões do proprietário: markup 150% (2,50×) e duas casas (D017, D018)', async () => {
    const token = await criarConta('padroes')
    const o = await esperar(chamar(token, '/orcamentos', 'POST', cabecalho(token)), 201)
    expect(o).toMatchObject({ situacao: 'rascunho', modoLucro: 'markup', percentualLucro: '150.00', regraArredondamento: 'duas_casas' })
    expect(o.memorial.precoFinal).toBe('0.00')

    const comItem = await esperar(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', {
      origem: 'avulso', tipo: 'material', descricao: 'Chapa avulsa', unidade: 'ch', quantidade: '1', valorUnitario: '100',
    }), 201)
    expect(comItem.memorial).toMatchObject({ custoDiretoTotal: '100.00', valorLucro: '150.00', multiplicadorEquivalente: '2.50', precoFinal: '250.00' })
  })

  it('altera, ajusta e remove itens sem mexer no catálogo; congela o valor copiado (RF14, RN08)', async () => {
    const token = await criarConta('itens')
    const mdf = await cadastrar(token, 'materiais', { nome: 'MDF 15 mm', unidade: 'ch', custoUnitario: '200' })
    const base = await esperar(chamar(token, '/orcamentos', 'POST', { ...cabecalho(token), percentualLucro: '0' }), 201)
    let o = await esperar(chamar(token, `/orcamentos/${base.id}/itens`, 'POST', { origem: 'catalogo', tipo: 'material', catalogoId: mdf, quantidade: '2' }), 201)
    const itemId = o.itens[0].id
    expect(o.memorial.precoFinal).toBe('400.00')

    // RF14: reajuste no catálogo não altera o item já incluído.
    await chamar(token, `/materiais/${mdf}`, 'PUT', { nome: 'MDF 15 mm', unidade: 'ch', custoUnitario: '250' })
    o = await esperar(chamar(token, `/orcamentos/${base.id}`), 200)
    expect(o.itens[0]).toMatchObject({ valorUnitario: '200.0000', valorAjustadoManualmente: false })

    // Mesma quantidade nova e mesmo valor: não é ajuste manual.
    o = await esperar(chamar(token, `/orcamentos/${base.id}/itens/${itemId}`, 'PUT', { quantidade: '3', valorUnitario: '200' }), 200)
    expect(o.itens[0]).toMatchObject({ quantidade: '3.000', valorLinha: '600.00', valorAjustadoManualmente: false })
    expect(o.memorial.precoFinal).toBe('600.00')

    // US08: valor diferente só neste orçamento.
    o = await esperar(chamar(token, `/orcamentos/${base.id}/itens/${itemId}`, 'PUT', { quantidade: '3', valorUnitario: '180,5' }), 200)
    expect(o.itens[0]).toMatchObject({ valorUnitario: '180.5000', valorLinha: '541.50', valorAjustadoManualmente: true })
    const catalogo = await (await chamar(token, '/materiais')).json() as { custo_unitario: string }[]
    expect(catalogo[0].custo_unitario).toBe('250.0000')

    // Voltar ao valor copiado na inclusão desliga a marca: ela compara com o catálogo, não com o valor anterior.
    o = await esperar(chamar(token, `/orcamentos/${base.id}/itens/${itemId}`, 'PUT', { quantidade: '3', valorUnitario: '200' }), 200)
    expect(o.itens[0].valorAjustadoManualmente).toBe(false)

    o = await esperar(chamar(token, `/orcamentos/${base.id}/itens/${itemId}`, 'DELETE'), 200)
    expect(o.itens).toEqual([])
    expect(o.memorial.precoFinal).toBe('0.00')
  })

  it('altera e remove custos adicionais', async () => {
    const token = await criarConta('adicionais')
    const base = await esperar(chamar(token, '/orcamentos', 'POST', { ...cabecalho(token), percentualLucro: '10' }), 201)
    let o = await esperar(chamar(token, `/orcamentos/${base.id}/custos-adicionais`, 'POST', { descricao: 'Frete', valor: '100' }), 201)
    expect(o.memorial).toMatchObject({ totalAdicionais: '100.00', precoFinal: '110.00' })
    const custoId = o.custosAdicionais[0].id
    o = await esperar(chamar(token, `/orcamentos/${base.id}/custos-adicionais/${custoId}`, 'PUT', { descricao: 'Frete e deslocamento', valor: '150' }), 200)
    expect(o.memorial).toMatchObject({ totalAdicionais: '150.00', precoFinal: '165.00' })
    o = await esperar(chamar(token, `/orcamentos/${base.id}/custos-adicionais/${custoId}`, 'DELETE'), 200)
    expect(o.custosAdicionais).toEqual([])
  })

  it('recusa entradas inválidas com 400 e não grava nada (RN10, CN01–CN04)', async () => {
    const token = await criarConta('invalidos')
    const base = await esperar(chamar(token, '/orcamentos', 'POST', cabecalho(token)), 201)
    const avulso = { origem: 'avulso', tipo: 'material', descricao: 'Item', unidade: 'un', quantidade: '1', valorUnitario: '10' }

    for (const [rota, metodo, corpo] of [
      ['/orcamentos', 'POST', { ...cabecalho(token), dataValidade: '2026-09-30' }], // CN04
      ['/orcamentos', 'POST', { ...cabecalho(token), clienteId: 'nao-e-uuid' }],
      [`/orcamentos/${base.id}`, 'PUT', { ...cabecalho(token), modoLucro: 'margem', percentualLucro: '100' }], // CN01, recusado pelo domínio
      [`/orcamentos/${base.id}`, 'PUT', { ...cabecalho(token), percentualLucro: '1e3' }],
      [`/orcamentos/${base.id}/itens`, 'POST', { ...avulso, quantidade: '0' }], // CN02
      [`/orcamentos/${base.id}/itens`, 'POST', { ...avulso, valorUnitario: '-5' }], // CN03
      [`/orcamentos/${base.id}/itens`, 'POST', { ...avulso, valorUnitario: 'NaN' }],
      [`/orcamentos/${base.id}/itens`, 'POST', { ...avulso, quantidade: '1,0001' }],
      [`/orcamentos/${base.id}/custos-adicionais`, 'POST', { descricao: 'Frete', valor: '0' }],
    ] as const) {
      const resposta = await chamar(token, rota, metodo, corpo)
      expect(resposta.status, `${metodo} ${rota} ${JSON.stringify(corpo)}`).toBe(400)
      expect((await resposta.json() as { mensagem: string }).mensagem).toBeTruthy()
    }

    const intacto = await esperar(chamar(token, `/orcamentos/${base.id}`), 200)
    expect(intacto).toEqual(base)
  })

  it('isola orçamentos e catálogo entre marcenarias; recusa item inativo (RNF12, TI01)', async () => {
    const tokenA = await criarConta('isolamento.a')
    const tokenB = await criarConta('isolamento.b')
    const materialA = await cadastrar(tokenA, 'materiais', { nome: 'Material da A', unidade: 'un', custoUnitario: '10' })
    const inativoB = await cadastrar(tokenB, 'materiais', { nome: 'Material inativo', unidade: 'un', custoUnitario: '10' })
    await chamar(tokenB, `/materiais/${inativoB}`, 'DELETE')
    const orcamentoA = await esperar(chamar(tokenA, '/orcamentos', 'POST', cabecalho(tokenA)), 201)
    const orcamentoB = await esperar(chamar(tokenB, '/orcamentos', 'POST', cabecalho(tokenB)), 201)
    const itemA = await esperar(chamar(tokenA, `/orcamentos/${orcamentoA.id}/itens`, 'POST', { origem: 'catalogo', tipo: 'material', catalogoId: materialA, quantidade: '1' }), 201)

    // B não enxerga nem altera o orçamento de A.
    expect((await chamar(tokenB, `/orcamentos/${orcamentoA.id}`)).status).toBe(404)
    expect((await chamar(tokenB, `/orcamentos/${orcamentoA.id}`, 'PUT', cabecalho(tokenB))).status).toBe(404)
    expect((await chamar(tokenB, `/orcamentos/${orcamentoA.id}/itens/${itemA.itens[0].id}`, 'DELETE')).status).toBe(404)
    // B não usa material de A, nem item de A no próprio orçamento, nem material inativo.
    expect((await chamar(tokenB, `/orcamentos/${orcamentoB.id}/itens`, 'POST', { origem: 'catalogo', tipo: 'material', catalogoId: materialA, quantidade: '1' })).status).toBe(404)
    expect((await chamar(tokenB, `/orcamentos/${orcamentoB.id}/itens/${itemA.itens[0].id}`, 'DELETE')).status).toBe(404)
    expect((await chamar(tokenB, `/orcamentos/${orcamentoB.id}/itens`, 'POST', { origem: 'catalogo', tipo: 'material', catalogoId: inativoB, quantidade: '1' })).status).toBe(404)
    // id malformado não vira erro interno.
    expect((await chamar(tokenA, '/orcamentos/nao-e-uuid')).status).toBe(404)

    expect(await esperar(chamar(tokenA, `/orcamentos/${orcamentoA.id}`), 200)).toEqual(itemA)
  })
})
