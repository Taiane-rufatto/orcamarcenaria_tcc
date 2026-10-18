import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import type { Orcamento } from '../../src/aplicacao/orcamento/orcamento'

// Spec 025: duplicar orçamento para ajustar (RF40). Valores fictícios.

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
  const texto = await r.text()
  const corpo = texto ? JSON.parse(texto) : null
  expect(r.status, texto).toBe(status)
  return corpo as T
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

// Orçamento completo: material do catálogo com valor ajustado, material avulso, serviço, custo adicional, textos,
// margem 30% e arredondamento à dezena. Fica registrado (enviado), com número.
async function orcamentoEnviado(token: string, clienteId: string) {
  const material = await esperar<{ id: string }>(chamar(token, '/materiais', 'POST', { nome: `MDF ${Date.now()}`, unidade: 'ch', custoUnitario: '289,90' }), 201)
  let o = await esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', {
    clienteId, descricaoProjeto: 'Armário de cozinha', dataEmissao: '2026-01-05', dataValidade: '2099-12-31', // validade longe: senão o orçamento antigo viraria "vencido" ao ser lido
    modoLucro: 'margem', percentualLucro: '30', regraArredondamento: 'dezena',
    especificacoes: 'Armário com cinco portas', observacoes: '50% na aprovação e 50% na entrega',
  }), 201)
  o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'catalogo', tipo: 'material', catalogoId: material.id, quantidade: '2,5' }), 201)
  // valor ajustado neste orçamento (o catálogo continua 289,90)
  o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens/${o.itens[0].id}`, 'PUT', { quantidade: '2.500', valorUnitario: '300' }), 200)
  o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'avulso', tipo: 'material', descricao: 'FITA DE BORDA', unidade: 'm', quantidade: '30', valorUnitario: '1,2350' }), 201)
  o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'avulso', tipo: 'servico', descricao: 'MONTAGEM', unidade: 'h', quantidade: '6', valorUnitario: '55' }), 201)
  o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/custos-adicionais`, 'POST', { descricao: 'Frete', valor: '120,00' }), 201)
  return esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/registrar`, 'POST'), 200)
}

const duplicar = (token: string, o: { id: string }) => chamar(token, `/orcamentos/${o.id}/duplicar`, 'POST')
const diasEntre = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000)

describe('duplicar orçamento para ajustar (RF40)', () => {
  it('cria um rascunho novo, sem número, com tudo copiado e o mesmo preço; o original não muda', async () => {
    const { token, clienteId } = await conta('dup.completo')
    const original = await orcamentoEnviado(token, clienteId)
    expect(original.numero).toBe(1)

    const copia = await esperar<Orcamento>(duplicar(token, original), 201)
    expect(copia.id).not.toBe(original.id)
    expect(copia).toMatchObject({
      situacao: 'rascunho', numero: null, origemNumero: 1, clienteId, clienteNome: original.clienteNome,
      descricaoProjeto: 'Armário de cozinha', modoLucro: 'margem', percentualLucro: '30.00', regraArredondamento: 'dezena',
      especificacoes: 'Armário com cinco portas', observacoes: '50% na aprovação e 50% na entrega',
    })
    expect(copia.itens.map((i) => [i.tipo, i.descricao, i.quantidade, i.unidade, i.valorUnitario]))
      .toEqual(original.itens.map((i) => [i.tipo, i.descricao, i.quantidade, i.unidade, i.valorUnitario]))
    expect(copia.custosAdicionais.map((c) => [c.descricao, c.valor])).toEqual([['Frete', '120.00']])
    // O mesmo domínio recalcula com a mesma entrada: o preço e o memorial saem iguais.
    expect(copia.memorial).toEqual(original.memorial)

    // O original continua exatamente como estava.
    expect(await esperar<Orcamento>(chamar(token, `/orcamentos/${original.id}`), 200)).toMatchObject({ numero: 1, situacao: 'enviado' })
  })

  it('a emissão é hoje e a validade segue a configuração (10 dias por padrão)', async () => {
    const { token, clienteId } = await conta('dup.datas')
    const copia = await esperar<Orcamento>(duplicar(token, await orcamentoEnviado(token, clienteId)), 201)
    expect(copia.dataEmissao).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(copia.dataEmissao).not.toBe('2026-01-05') // não herda a emissão antiga
    expect(diasEntre(copia.dataEmissao, copia.dataValidade)).toBe(10)

    await esperar(chamar(token, '/configuracoes/padroes', 'PUT', { modoLucro: 'markup', percentualLucro: '150', regraArredondamento: 'duas_casas', validadeDias: 30 }), 200)
    const outra = await esperar<Orcamento>(duplicar(token, await orcamentoEnviado(token, clienteId)), 201)
    expect(diasEntre(outra.dataEmissao, outra.dataValidade)).toBe(30)
  })

  it('o valor ajustado do item continua marcado como ajustado (o valor do catálogo vem junto)', async () => {
    const { token, clienteId } = await conta('dup.ajustado')
    const original = await orcamentoEnviado(token, clienteId)
    expect(original.itens[0].valorAjustadoManualmente).toBe(true)
    const copia = await esperar<Orcamento>(duplicar(token, original), 201)
    expect(copia.itens[0]).toMatchObject({ valorUnitario: '300.0000', valorAjustadoManualmente: true })
  })

  it('o rascunho novo pode ser ajustado e só ele muda; depois pode ser registrado com número próprio', async () => {
    const { token, clienteId } = await conta('dup.ajustar')
    const original = await orcamentoEnviado(token, clienteId)
    const copia = await esperar<Orcamento>(duplicar(token, original), 201)

    const ajustado = await esperar<Orcamento>(chamar(token, `/orcamentos/${copia.id}/itens/${copia.itens[1].id}`, 'DELETE'), 200) // tira a fita de borda
    expect(ajustado.itens).toHaveLength(2)
    expect(ajustado.memorial.precoFinal).not.toBe(original.memorial.precoFinal)
    expect((await esperar<Orcamento>(chamar(token, `/orcamentos/${original.id}`), 200)).itens).toHaveLength(3)

    const registrada = await esperar<Orcamento>(chamar(token, `/orcamentos/${copia.id}/registrar`, 'POST'), 200)
    expect(registrada).toMatchObject({ numero: 2, origemNumero: 1 })
  })

  it('duplicar uma cópia aponta para a cópia, não para o primeiro', async () => {
    const { token, clienteId } = await conta('dup.cadeia')
    const primeiro = await orcamentoEnviado(token, clienteId)
    const segundo = await esperar<Orcamento>(chamar(token, `/orcamentos/${(await esperar<Orcamento>(duplicar(token, primeiro), 201)).id}/registrar`, 'POST'), 200)
    expect(segundo.numero).toBe(2)
    expect((await esperar<Orcamento>(duplicar(token, segundo), 201)).origemNumero).toBe(2)
  })

  it.each(['aprovado', 'recusado', 'em_producao', 'entregue'])('também duplica um orçamento %s', async (situacao) => {
    const { token, clienteId } = await conta(`dup.${situacao}`)
    const original = await orcamentoEnviado(token, clienteId)
    const caminho = situacao === 'recusado' ? ['recusado'] : situacao === 'aprovado' ? ['aprovado'] : situacao === 'em_producao' ? ['aprovado', 'em_producao'] : ['aprovado', 'entregue']
    for (const passo of caminho) await esperar(chamar(token, `/orcamentos/${original.id}/situacao`, 'POST', { situacao: passo }), 200)
    expect((await esperar<Orcamento>(duplicar(token, original), 201)).situacao).toBe('rascunho')
  })

  it('rascunho não precisa duplicar (409); inexistente e de outra marcenaria dão 404; exige login', async () => {
    const a = await conta('dup.erros.a')
    const b = await conta('dup.erros.b')
    const rascunho = await esperar<Orcamento>(chamar(a.token, '/orcamentos', 'POST', { clienteId: a.clienteId, descricaoProjeto: 'X', dataEmissao: '2026-10-01' }), 201)
    await esperar(duplicar(a.token, rascunho), 409)

    const enviado = await orcamentoEnviado(a.token, a.clienteId)
    await esperar(duplicar(b.token, enviado), 404)
    await esperar(chamar(a.token, '/orcamentos/nao-e-uuid/duplicar', 'POST'), 404)
    expect((await fetch(`${baseUrl}/orcamentos/${enviado.id}/duplicar`, { method: 'POST' })).status).toBe(401)
  })

  it('o orçamento comum não tem origem', async () => {
    const { token, clienteId } = await conta('dup.semorigem')
    expect((await orcamentoEnviado(token, clienteId)).origemNumero).toBeNull()
  })
})
