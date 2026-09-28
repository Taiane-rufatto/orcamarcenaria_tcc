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

type Configuracao = {
  marcenaria: { nome: string; responsavel: string; telefone: string | null; email: string | null; cnpj: string | null; endereco: string | null }
  padroes: { modoLucro: string; percentualLucro: string; regraArredondamento: string; validadeDias: number; multiplicadorEquivalente: string | null }
}

// Conta nova com um cliente fictício (RNF15).
async function conta(rotulo: string) {
  const r = await fetch(`${baseUrl}/auth/cadastro`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeMarcenaria: 'Marcenaria Exemplo', nomeResponsavel: 'Responsável Fictício', email: `${rotulo}.${Date.now()}@example.test`, senha: 'teste1234' }),
  })
  const { token } = await r.json() as { token: string }
  const cliente = await esperar<{ id: string }>(chamar(token, '/clientes', 'POST', { nome: 'Cliente Fictício' }), 201)
  return { token, clienteId: cliente.id }
}

// Cria o orçamento só com o obrigatório: lucro, arredondamento e validade vêm da configuração.
const novoOrcamento = (token: string, clienteId: string, dataEmissao = '2026-10-01') =>
  esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', { clienteId, descricaoProjeto: 'Armário de cozinha', dataEmissao }), 201)

// Itens do exemplo de regras-de-calculo.md §4 (custo direto R$ 1.931,10).
async function comItensDoExemplo(token: string, orcamento: Orcamento): Promise<Orcamento> {
  let o = orcamento
  for (const [descricao, unidade, quantidade, valorUnitario, tipo] of [
    ['MDF branco 18 mm', 'ch', '2,5', '289,90', 'material'], ['Fita de borda 22 mm', 'm', '30', '1,2350', 'material'],
    ['Corrediça telescópica 450 mm', 'un', '6', '34,50', 'material'], ['Dobradiça com amortecedor', 'un', '12', '8,90', 'material'],
    ['Corte e usinagem', 'h', '8', '45', 'servico'], ['Montagem e instalação', 'h', '6', '55', 'servico'],
  ]) o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'avulso', tipo, descricao, unidade, quantidade, valorUnitario }), 201)
  await esperar(chamar(token, `/orcamentos/${o.id}/custos-adicionais`, 'POST', { descricao: 'Frete de entrega', valor: '120,00' }), 201)
  return esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/custos-adicionais`, 'POST', { descricao: 'Ferragens diversas', valor: '45,50' }), 201)
}

const padroes = (modoLucro: string, percentualLucro: string, regraArredondamento: string, validadeDias = 10) =>
  ({ modoLucro, percentualLucro, regraArredondamento, validadeDias })

describe('configurações da marcenaria (RF05, RF19–RF22, D024)', () => {
  it('exige autenticação', async () => {
    expect((await fetch(`${baseUrl}/configuracoes`)).status).toBe(401)
  })

  it('conta nova começa com markup 150% (2,50×), sem arredondamento e 10 dias; o orçamento novo usa isso', async () => {
    const { token, clienteId } = await conta('config.padroes')
    const config = await esperar<Configuracao>(chamar(token, '/configuracoes'), 200)
    expect(config.padroes).toEqual({ modoLucro: 'markup', percentualLucro: '150.00', regraArredondamento: 'duas_casas', validadeDias: 10, multiplicadorEquivalente: '2.50' })
    expect(config.marcenaria).toEqual({ nome: 'Marcenaria Exemplo', responsavel: 'Responsável Fictício', telefone: null, email: null, cnpj: null, endereco: null })

    const o = await novoOrcamento(token, clienteId)
    expect(o).toMatchObject({ modoLucro: 'markup', percentualLucro: '150.00', regraArredondamento: 'duas_casas', dataEmissao: '2026-10-01', dataValidade: '2026-10-11' })
  })

  it.each([
    ['CT03', padroes('margem', '30', 'dezena'), { valorLucro: '827.61', ajusteArredondamento: '1.29', precoFinal: '2760.00' }],
    ['CT04', padroes('markup', '30', 'dezena'), { valorLucro: '579.33', ajusteArredondamento: '9.57', precoFinal: '2520.00' }],
  ] as const)('%s reproduzido partindo só da configuração', async (_caso, configuracao, esperado) => {
    const { token, clienteId } = await conta(`config.${_caso}`)
    await esperar(chamar(token, '/configuracoes/padroes', 'PUT', configuracao), 200)
    const o = await comItensDoExemplo(token, await novoOrcamento(token, clienteId))
    expect(o.memorial).toMatchObject({ custoDiretoTotal: '1931.10', ...esperado })
  })

  it('CT06 (só serviços, markup 50%, real inteiro) partindo da configuração', async () => {
    const { token, clienteId } = await conta('config.ct06')
    await esperar(chamar(token, '/configuracoes/padroes', 'PUT', padroes('markup', '50', 'real_inteiro')), 200)
    let o = await novoOrcamento(token, clienteId)
    for (const [descricao, quantidade, valorUnitario] of [['Projeto 3D', '4', '80'], ['Instalação', '5,5', '55']]) {
      o = await esperar<Orcamento>(chamar(token, `/orcamentos/${o.id}/itens`, 'POST', { origem: 'avulso', tipo: 'servico', descricao, unidade: 'h', quantidade, valorUnitario }), 201)
    }
    expect(o.memorial).toMatchObject({ custoDiretoTotal: '622.50', valorLucro: '311.25', ajusteArredondamento: '0.25', precoFinal: '934.00' })
  })

  it('mudar a configuração não altera orçamento existente, e o rascunho pode mudar o próprio lucro (RF30)', async () => {
    const { token, clienteId } = await conta('config.retroativo')
    const antigo = await comItensDoExemplo(token, await novoOrcamento(token, clienteId))
    await esperar(chamar(token, '/configuracoes/padroes', 'PUT', padroes('margem', '30', 'dezena', 30)), 200)

    expect(await esperar<Orcamento>(chamar(token, `/orcamentos/${antigo.id}`), 200)).toEqual(antigo)
    const novo = await novoOrcamento(token, clienteId, '2026-10-05')
    expect(novo).toMatchObject({ modoLucro: 'margem', percentualLucro: '30.00', regraArredondamento: 'dezena', dataValidade: '2026-11-04' })

    // Editar o rascunho sem informar o lucro mantém o do orçamento, não o da configuração.
    const editado = await esperar<Orcamento>(chamar(token, `/orcamentos/${antigo.id}`, 'PUT', { clienteId, descricaoProjeto: 'Armário grande', dataEmissao: '2026-10-01' }), 200)
    expect(editado).toMatchObject({ descricaoProjeto: 'Armário grande', modoLucro: 'markup', percentualLucro: '150.00', dataValidade: antigo.dataValidade })
    expect(editado.memorial).toEqual(antigo.memorial)
  })

  it('validade informada vale mais que o padrão, e não pode ser anterior à emissão', async () => {
    const { token, clienteId } = await conta('config.validade')
    const o = await esperar<Orcamento>(chamar(token, '/orcamentos', 'POST', { clienteId, descricaoProjeto: 'Mesa', dataEmissao: '2026-10-01', dataValidade: '2026-12-01' }), 201)
    expect(o.dataValidade).toBe('2026-12-01')
    expect((await chamar(token, '/orcamentos', 'POST', { clienteId, descricaoProjeto: 'Mesa', dataEmissao: '2026-10-01', dataValidade: '2026-09-30' })).status).toBe(400)
  })

  it('recusa padrões inválidos, com a margem conferida pela regra do domínio (D024)', async () => {
    const { token } = await conta('config.invalidos')
    for (const corpo of [
      padroes('margem', '100', 'duas_casas'), padroes('markup', '-1', 'duas_casas'), padroes('markup', '1e3', 'duas_casas'),
      padroes('markup', '10', 'centena'), padroes('markup', '10', 'duas_casas', 0), padroes('markup', '10', 'duas_casas', 366),
      { ...padroes('markup', '10', 'duas_casas'), validadeDias: 1.5 },
    ]) {
      const resposta = await chamar(token, '/configuracoes/padroes', 'PUT', corpo)
      expect(resposta.status, JSON.stringify(corpo)).toBe(400)
    }
    const margem = await chamar(token, '/configuracoes/padroes', 'PUT', padroes('margem', '100', 'duas_casas'))
    expect((await margem.json() as { mensagem: string }).mensagem).toBe('A margem deve ser menor que 100%')
    expect((await esperar<Configuracao>(chamar(token, '/configuracoes'), 200)).padroes.percentualLucro).toBe('150.00')
  })

  it('edita os dados da marcenaria; CNPJ opcional com 14 dígitos (RF05)', async () => {
    const { token } = await conta('config.dados')
    const dados = { nome: 'Marcenaria Exemplo Ltda', responsavel: 'Responsável Fictício', telefone: '(45) 3000-0000', email: 'contato@example.test', cnpj: '00.000.000/0001-00', endereco: 'Rua Fictícia, 100 — Centro' }
    const config = await esperar<Configuracao>(chamar(token, '/configuracoes/marcenaria', 'PUT', dados), 200)
    expect(config.marcenaria).toEqual(dados)

    const semOpcionais = await esperar<Configuracao>(chamar(token, '/configuracoes/marcenaria', 'PUT', { nome: 'Só Nome', responsavel: 'Alguém', telefone: '', cnpj: '' }), 200)
    expect(semOpcionais.marcenaria).toEqual({ nome: 'Só Nome', responsavel: 'Alguém', telefone: null, email: null, cnpj: null, endereco: null })

    for (const corpo of [{ ...dados, nome: '' }, { ...dados, responsavel: ' ' }, { ...dados, cnpj: '123' }, { ...dados, email: 'nao-e-email' }]) {
      expect((await chamar(token, '/configuracoes/marcenaria', 'PUT', corpo)).status, JSON.stringify(corpo)).toBe(400)
    }
  })

  it('a configuração de uma marcenaria não afeta a de outra', async () => {
    const a = await conta('config.isolamento.a')
    const b = await conta('config.isolamento.b')
    await esperar(chamar(a.token, '/configuracoes/padroes', 'PUT', padroes('margem', '40', 'dezena', 20)), 200)
    await esperar(chamar(a.token, '/configuracoes/marcenaria', 'PUT', { nome: 'Nome da A', responsavel: 'Responsável A' }), 200)
    const configB = await esperar<Configuracao>(chamar(b.token, '/configuracoes'), 200)
    expect(configB.padroes).toMatchObject({ modoLucro: 'markup', percentualLucro: '150.00', validadeDias: 10 })
    expect(configB.marcenaria.nome).toBe('Marcenaria Exemplo')
  })
})
