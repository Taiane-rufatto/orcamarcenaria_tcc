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

// Conta com um cliente fictício e um orçamento com `quantidadeItens` itens avulsos (dados fictícios, RNF15).
async function prepararOrcamento(rotulo: string, quantidadeItens: number) {
  const cadastro = await fetch(`${baseUrl}/auth/cadastro`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeMarcenaria: 'Marcenaria Exemplo', nomeResponsavel: 'Responsável Fictício', email: `${rotulo}.${Date.now()}@example.test`, senha: 'teste1234' }),
  })
  const { token } = await cadastro.json() as { token: string }
  const cliente = await esperar<{ id: string }>(chamar(token, '/clientes', 'POST', { nome: 'Cliente Fictício', telefone: '(45) 90000-0000' }), 201)
  let orcamento = await esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', {
    clienteId: cliente.id, descricaoProjeto: 'Armário de cozinha', dataEmissao: '2026-10-01', dataValidade: '2099-12-31',
    modoLucro: 'margem', percentualLucro: '30', regraArredondamento: 'dezena', observacoes: 'Entrega em 20 dias úteis.', especificacoes: 'Armário com cinco portas\n- Canto em 45°',
  }), 201)
  for (let i = 1; i <= quantidadeItens; i++) {
    orcamento = await esperar<Orcamento>(chamar(token, `/orcamentos/${orcamento.id}/itens`, 'POST', {
      origem: 'avulso', tipo: 'material', descricao: `Item fictício ${i}`, unidade: 'un', quantidade: '1', valorUnitario: '100',
    }), 201)
  }
  return { token, orcamento }
}

describe('PDF do orçamento (US14)', () => {
  it('só gera para orçamento registrado; rascunho recebe 409 (D022)', async () => {
    const { token, orcamento } = await prepararOrcamento('pdf.rascunho', 1)
    const resposta = await chamar(token, `/orcamentos/${orcamento.id}/pdf`)
    expect(resposta.status).toBe(409)
    expect((await resposta.json() as { mensagem: string }).mensagem).toBe('Registre o orçamento antes de gerar o PDF')
  })

  it('baixa o PDF nas duas opções, com nome do arquivo pelo número (RF41–RF43)', async () => {
    const { token, orcamento } = await prepararOrcamento('pdf.download', 2)
    await esperar(chamar(token, `/orcamentos/${orcamento.id}/registrar`, 'POST'), 200)

    for (const consulta of ['', '?itens=sim', '?itens=nao']) {
      const resposta = await chamar(token, `/orcamentos/${orcamento.id}/pdf${consulta}`)
      expect(resposta.status, consulta).toBe(200)
      expect(resposta.headers.get('content-type')).toBe('application/pdf')
      expect(resposta.headers.get('content-disposition')).toBe('attachment; filename="orcamento-1.pdf"')
      const bytes = Buffer.from(await resposta.arrayBuffer())
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
    }
    expect((await chamar(token, `/orcamentos/${orcamento.id}/pdf?itens=talvez`)).status).toBe(400)
  })

  it('gera o PDF de um orçamento com dez itens em menos de 5 segundos (RNF19)', async () => {
    const { token, orcamento } = await prepararOrcamento('pdf.tempo', 10)
    await esperar(chamar(token, `/orcamentos/${orcamento.id}/registrar`, 'POST'), 200)
    const inicio = performance.now()
    const resposta = await chamar(token, `/orcamentos/${orcamento.id}/pdf`)
    await resposta.arrayBuffer()
    const milissegundos = performance.now() - inicio
    expect(resposta.status).toBe(200)
    expect(milissegundos).toBeLessThan(5000)
  })

  it('isola o PDF entre marcenarias (TI02)', async () => {
    const a = await prepararOrcamento('pdf.isolamento.a', 1)
    const b = await prepararOrcamento('pdf.isolamento.b', 1)
    await esperar(chamar(a.token, `/orcamentos/${a.orcamento.id}/registrar`, 'POST'), 200)
    expect((await chamar(b.token, `/orcamentos/${a.orcamento.id}/pdf`)).status).toBe(404)
  })

  it('especificações e observações: editáveis no rascunho, travadas depois do registro (RF39)', async () => {
    const { token, orcamento } = await prepararOrcamento('pdf.observacoes', 1)
    expect(orcamento.observacoes).toBe('Entrega em 20 dias úteis.')
    expect(orcamento.especificacoes).toBe('Armário com cinco portas\n- Canto em 45°')
    const cabecalho = {
      clienteId: orcamento.clienteId, descricaoProjeto: orcamento.descricaoProjeto, dataEmissao: orcamento.dataEmissao,
      dataValidade: orcamento.dataValidade, modoLucro: orcamento.modoLucro, percentualLucro: orcamento.percentualLucro,
      regraArredondamento: orcamento.regraArredondamento,
    }
    const alterado = await esperar<Orcamento>(chamar(token, `/orcamentos/${orcamento.id}`, 'PUT', { ...cabecalho, observacoes: 'Pagamento em duas vezes.' }), 200)
    expect(alterado.observacoes).toBe('Pagamento em duas vezes.')
    expect((await chamar(token, `/orcamentos/${orcamento.id}`, 'PUT', { ...cabecalho, observacoes: 'x'.repeat(1001) })).status).toBe(400)
    expect((await chamar(token, `/orcamentos/${orcamento.id}`, 'PUT', { ...cabecalho, especificacoes: 'x'.repeat(4001) })).status).toBe(400)

    await esperar(chamar(token, `/orcamentos/${orcamento.id}/registrar`, 'POST'), 200)
    expect((await chamar(token, `/orcamentos/${orcamento.id}`, 'PUT', { ...cabecalho, observacoes: 'Outra.' })).status).toBe(409)
  })
})
