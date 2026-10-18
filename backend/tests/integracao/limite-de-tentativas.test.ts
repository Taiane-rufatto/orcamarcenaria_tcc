import 'dotenv/config'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'

// Achados A1 e A6 do diagnóstico de segurança. Aqui o limitador é LIGADO (nos outros testes fica desligado).

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

beforeEach(() => { process.env.LIMITE_TENTATIVAS = 'ligado' })
afterEach(() => { process.env.LIMITE_TENTATIVAS = 'desligado' })

const post = (rota: string, corpo: unknown) => fetch(`${baseUrl}${rota}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo),
})
const entrar = (email: string) => post('/auth/entrar', { email, senha: 'senha-errada-123' })

describe('limite de tentativas no login (A1)', () => {
  it('na 11ª tentativa para o mesmo e-mail responde 429 com Retry-After; outro e-mail continua livre', async () => {
    const email = `limite.${Date.now()}@example.test`
    for (let i = 1; i <= 10; i += 1) expect((await entrar(email)).status, `tentativa ${i}`).toBe(401)

    const bloqueada = await entrar(email)
    expect(bloqueada.status).toBe(429)
    expect(Number(bloqueada.headers.get('retry-after'))).toBeGreaterThan(0)
    expect((await bloqueada.json() as { mensagem: string }).mensagem).toBe('Muitas tentativas. Aguarde alguns minutos e tente de novo.')

    expect((await entrar(`outro.${Date.now()}@example.test`)).status).toBe(401)
  })

  it('e-mail inexistente e senha errada continuam com a mesma mensagem (nada revela quem tem conta)', async () => {
    const resposta = await entrar(`ninguem.${Date.now()}@example.test`)
    expect(resposta.status).toBe(401)
    expect((await resposta.json() as { mensagem: string }).mensagem).toBe('E-mail ou senha inválidos')
  })
})

describe('limite de tentativas no cadastro (A1)', () => {
  it('na 11ª criação de conta do mesmo endereço responde 429', async () => {
    const corpo = (i: number) => ({ nomeMarcenaria: 'Marcenaria Exemplo', nomeResponsavel: 'Responsável Fictício', email: `cad.${Date.now()}.${i}@example.test`, senha: 'teste1234' })
    for (let i = 1; i <= 10; i += 1) expect((await post('/auth/cadastro', corpo(i))).status, `cadastro ${i}`).toBe(201)
    expect((await post('/auth/cadastro', corpo(11))).status).toBe(429)
  })
})

describe('/saude (A6)', () => {
  it('responde só api, banco e hora; sem detalhe interno', async () => {
    const resposta = await fetch(`${baseUrl}/saude`)
    expect(resposta.status).toBe(200)
    expect(Object.keys(await resposta.json() as object).sort()).toEqual(['api', 'banco', 'horaDoBanco'])
  })
})
