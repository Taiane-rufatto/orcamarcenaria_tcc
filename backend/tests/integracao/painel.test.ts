import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import type { Orcamento } from '../../src/aplicacao/orcamento/orcamento'

// Specs 019 e 024: painel do mês, situações em produção e entregue, meta, cobrança e preços.
// Valores fictícios, os mesmos do teste de unidade quando possível.

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
  const corpo = await r.json()
  expect(r.status, JSON.stringify(corpo)).toBe(status)
  return corpo as T
}

type Variacao = { percentual: string; tendencia: 'subindo' | 'estavel' | 'caindo' } | null
type Painel = {
  mes: string; rascunhos: number; enviados: number; aguardando: number; recusados: number; vencidos: number
  aprovados: { quantidade: number; valor: string; lucro: string; percentualDoPreco: string | null; emProducao: number; entregues: number }
  taxaDeAprovacao: string | null
  meta: { meta: string; aprovado: string; percentual: string; falta: string; atingida: boolean } | null
  cobranca: { maoDeObra: string; percentualDoPreco: string | null; valorMedioDaHora: string | null; valorMedioDaHoraNoMesAnterior: string | null; variacaoDaHora: Variacao }
  precos: { nome: string; usos: number; custoAtual: string; custoAnterior: string | null; variacao: Variacao }[]
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
const responder = (token: string, o: Orcamento, situacao: 'aprovado' | 'recusado' | 'em_producao' | 'entregue') =>
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
    expect(await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)).toMatchObject({
      mes: '2026-10', rascunhos: 0, enviados: 0, aguardando: 0, recusados: 0, vencidos: 0,
      aprovados: { quantidade: 0, valor: '0.00', lucro: '0.00', percentualDoPreco: null, emProducao: 0, entregues: 0 }, taxaDeAprovacao: null,
      meta: null, cobranca: { maoDeObra: '0.00', percentualDoPreco: null, valorMedioDaHora: null, variacaoDaHora: null },
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

    expect(await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)).toMatchObject({
      mes: '2026-10', rascunhos: 1, enviados: 2, aguardando: 0, recusados: 1, vencidos: 0,
      aprovados: { quantidade: 1, valor: '4200.00', lucro: '2100.00', percentualDoPreco: '50.00', emProducao: 0, entregues: 0 },
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

describe('em produção e entregue (spec 024)', () => {
  it('aprovado segue para em produção e depois entregue; pode pular direto para entregue; o resto dá 409', async () => {
    const { token, clienteId } = await conta('prod.fluxo')
    const novo = async () => enviar(token, await criar(token, clienteId, '2026-10-05', '1000', '100'))
    const tentar = (o: Orcamento, situacao: string) => chamar(token, `/orcamentos/${o.id}/situacao`, 'POST', { situacao })

    const a = await novo()
    expect((await tentar(a, 'em_producao')).status).toBe(409) // enviado ainda não foi aprovado
    expect((await tentar(a, 'entregue')).status).toBe(409)
    await responder(token, a, 'aprovado')
    expect(await responder(token, a, 'em_producao')).toMatchObject({ situacao: 'em_producao' })
    expect(await responder(token, a, 'entregue')).toMatchObject({ situacao: 'entregue' })
    for (const situacao of ['aprovado', 'em_producao', 'recusado']) expect((await tentar(a, situacao)).status, situacao).toBe(409)

    const b = await novo()
    await responder(token, b, 'aprovado')
    expect(await responder(token, b, 'entregue')).toMatchObject({ situacao: 'entregue' }) // pulou a produção

    const c = await novo()
    await responder(token, c, 'recusado')
    expect((await tentar(c, 'em_producao')).status).toBe(409)
  })

  it('a mensagem de erro usa "em produção" com acento e espaço', async () => {
    const { token, clienteId } = await conta('prod.mensagem')
    const o = await enviar(token, await criar(token, clienteId, '2026-10-05', '1000', '100'))
    const erro = await esperar<{ mensagem: string }>(chamar(token, `/orcamentos/${o.id}/situacao`, 'POST', { situacao: 'em_producao' }), 409)
    expect(erro.mensagem).toBe('Não é possível passar um orçamento enviado para em produção')
  })

  it('o painel conta em produção e entregue dentro dos aprovados, e a lista filtra por elas', async () => {
    const { token, clienteId } = await conta('prod.painel')
    const a = await enviar(token, await criar(token, clienteId, '2026-10-05', '2100', '100')) // preço 4.200,00
    const b = await enviar(token, await criar(token, clienteId, '2026-10-06', '1000', '100')) // preço 2.000,00
    const c = await enviar(token, await criar(token, clienteId, '2026-10-07', '500', '100')) // preço 1.000,00
    await responder(token, a, 'aprovado')
    await responder(token, await responder(token, b, 'aprovado'), 'em_producao')
    await responder(token, await responder(token, c, 'aprovado'), 'entregue')

    expect(await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)).toMatchObject({
      enviados: 3, taxaDeAprovacao: '100.00',
      aprovados: { quantidade: 3, valor: '7200.00', emProducao: 1, entregues: 1 },
    })
    const ids = async (situacao: string) => (await esperar<{ id: string }[]>(chamar(token, `/orcamentos?situacao=${situacao}`), 200)).map((r) => r.id)
    expect(await ids('em_producao')).toEqual([b.id])
    expect(await ids('entregue')).toEqual([c.id])
  })
})

describe('meta do mês (spec 024, RN20)', () => {
  const salvarMeta = (token: string, metaDoMes: string) => chamar(token, '/configuracoes/meta', 'PUT', { metaDoMes })

  it('exige login; grava com vírgula, devolve nas configurações e vazio limpa', async () => {
    expect((await fetch(`${baseUrl}/configuracoes/meta`, { method: 'PUT' })).status).toBe(401)
    const { token } = await conta('meta.config')
    expect((await esperar<{ meta: { metaDoMes: string | null } }>(chamar(token, '/configuracoes'), 200)).meta.metaDoMes).toBeNull()
    expect((await esperar<{ meta: { metaDoMes: string | null } }>(salvarMeta(token, '10000,50'), 200)).meta.metaDoMes).toBe('10000.50')
    expect((await esperar<{ meta: { metaDoMes: string | null } }>(salvarMeta(token, ''), 200)).meta.metaDoMes).toBeNull()
  })

  it.each(['0', '-5', 'abc', '10,001'])('recusa com 400: %s', async (valor) => {
    const { token } = await conta('meta.invalida')
    await esperar(salvarMeta(token, valor), 400)
  })

  it('o painel compara o aprovado do mês com a meta; sem meta, vem nulo', async () => {
    const { token, clienteId } = await conta('meta.painel')
    await responder(token, await enviar(token, await criar(token, clienteId, '2026-10-05', '2100', '100')), 'aprovado') // 4.200,00
    expect((await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)).meta).toBeNull()

    await esperar(salvarMeta(token, '10000'), 200)
    expect((await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)).meta)
      .toEqual({ meta: '10000.00', aprovado: '4200.00', percentual: '42.00', falta: '5800.00', atingida: false })

    await esperar(salvarMeta(token, '4000'), 200)
    expect((await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)).meta).toMatchObject({ percentual: '105.00', falta: '0.00', atingida: true })
  })

  it('a meta de uma marcenaria não vale para outra', async () => {
    const a = await conta('meta.iso.a')
    const b = await conta('meta.iso.b')
    await esperar(salvarMeta(a.token, '10000'), 200)
    expect((await esperar<Painel>(chamar(b.token, '/painel?mes=2026-10'), 200)).meta).toBeNull()
  })
})

// Um serviço por hora de `horas` h a `valorHora`: valor de linha = horas × valorHora.
async function comServicoPorHora(token: string, o: Orcamento, horas: string, valorHora: string) {
  return esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', {
    origem: 'avulso', tipo: 'servico', descricao: 'MONTAGEM', unidade: 'h', quantidade: horas, valorUnitario: valorHora,
  }), 201)
}

describe('cobrança da mão de obra (spec 024, RN18 e RN19)', () => {
  it('média ponderada da hora de serviço, participação no preço e variação contra o mês anterior', async () => {
    const { token, clienteId } = await conta('cobranca.hora')
    // Setembro: 8 h a 40,00 = 320,00 (valor médio da hora 40,00).
    await enviar(token, await comServicoPorHora(token, await criar(token, clienteId, '2026-09-10', '100', '100'), '8', '40'))
    // Outubro: 8 h a 50,00 = 400,00 e 2 h a 100,00 = 200,00 → 600,00 ÷ 10 h = 60,00 por hora.
    const outubro = await criar(token, clienteId, '2026-10-05', '100', '100')
    await enviar(token, await comServicoPorHora(token, await comServicoPorHora(token, outubro, '8', '50'), '2', '100'))

    const painel = await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)
    expect(painel.cobranca).toMatchObject({
      maoDeObra: '600.00', valorMedioDaHora: '60.00', valorMedioDaHoraNoMesAnterior: '40.00',
      variacaoDaHora: { percentual: '50.00', tendencia: 'subindo' },
    })
    // preço do orçamento de outubro: (100 + 600) × 2 = 1.400,00; mão de obra 600,00 = 42,86%
    expect(painel.cobranca.percentualDoPreco).toBe('42.86')
  })

  it('rascunho não entra; sem serviço por hora não há valor da hora; sem mês anterior não há variação', async () => {
    const { token, clienteId } = await conta('cobranca.vazia')
    await comServicoPorHora(token, await criar(token, clienteId, '2026-10-05', '100', '100'), '8', '50') // rascunho
    expect(await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)).toMatchObject({
      cobranca: { maoDeObra: '0.00', valorMedioDaHora: null, variacaoDaHora: null },
    })
    await enviar(token, await criar(token, clienteId, '2026-10-06', '100', '100')) // só material
    expect((await esperar<Painel>(chamar(token, '/painel?mes=2026-10'), 200)).cobranca.valorMedioDaHora).toBeNull()
  })
})

// Data de hoje menos `dias`, no formato AAAA-MM-DD (a janela de preços é dos últimos 90 dias).
const haDias = (dias: number) => new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10)

describe('preços dos materiais (spec 024, RN19)', () => {
  const novoMaterial = (token: string, nome: string, custoUnitario: string) =>
    esperar<{ id: string }>(chamar(token, '/materiais', 'POST', { nome, unidade: 'ch', custoUnitario }), 201)
  async function usar(token: string, clienteId: string, materiaisIds: string[], rascunho = false) {
    let o = await esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', { clienteId, descricaoProjeto: 'Armário', dataEmissao: haDias(1), dataValidade: '2099-12-31' }), 201)
    for (const catalogoId of materiaisIds) {
      o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'catalogo', tipo: 'material', catalogoId, quantidade: '1' }), 201)
    }
    return rascunho ? o : enviar(token, o)
  }

  it('mostra os mais usados com a variação em 90 dias: subindo, estável e caindo; rascunho e avulso não contam', async () => {
    const { token, clienteId } = await conta('precos.tendencia')
    const sobe = await novoMaterial(token, 'MDF BRANCO', '100,00')
    const estavel = await novoMaterial(token, 'FITA', '10,00')
    const cai = await novoMaterial(token, 'COLA', '50,00')
    const rascunho = await novoMaterial(token, 'SO NO RASCUNHO', '5,00')
    // Envelhece o primeiro registro do histórico para 100 dias atrás e troca o custo agora: MDF 100,00 → 110,00 (+10,00%); COLA 50,00 → 45,00 (−10,00%).
    for (const id of [sobe.id, cai.id]) await consultar("UPDATE material_custo_historico SET registrado_em = now() - interval '100 days' WHERE material_id=$1", [id])
    await esperar(chamar(token, `/materiais/${sobe.id}`, 'PUT', { nome: 'MDF BRANCO', unidade: 'ch', custoUnitario: '110,00' }), 200)
    await esperar(chamar(token, `/materiais/${cai.id}`, 'PUT', { nome: 'COLA', unidade: 'ch', custoUnitario: '45,00' }), 200)

    await usar(token, clienteId, [sobe.id, estavel.id, cai.id])
    await usar(token, clienteId, [sobe.id, estavel.id])
    await usar(token, clienteId, [sobe.id])
    await usar(token, clienteId, [rascunho.id], true)

    const { precos } = await esperar<Painel>(chamar(token, '/painel'), 200)
    expect(precos.map((p) => [p.nome, p.usos])).toEqual([['MDF BRANCO', 3], ['FITA', 2], ['COLA', 1]]) // mais usados primeiro; rascunho fora
    expect(precos[0]).toMatchObject({ custoAnterior: '100.0000', custoAtual: '110.0000', variacao: { percentual: '10.00', tendencia: 'subindo' } })
    expect(precos[1]).toMatchObject({ variacao: { percentual: '0.00', tendencia: 'estavel' } })
    expect(precos[2]).toMatchObject({ custoAnterior: '50.0000', custoAtual: '45.0000', variacao: { percentual: '-10.00', tendencia: 'caindo' } })
  })

  it('sem orçamentos enviados, a lista vem vazia; outra marcenaria não vê os materiais', async () => {
    const a = await conta('precos.iso.a')
    const b = await conta('precos.iso.b')
    expect((await esperar<Painel>(chamar(a.token, '/painel'), 200)).precos).toEqual([])
    await usar(a.token, a.clienteId, [(await novoMaterial(a.token, 'MDF', '100,00')).id])
    expect((await esperar<Painel>(chamar(b.token, '/painel'), 200)).precos).toEqual([])
  })
})
