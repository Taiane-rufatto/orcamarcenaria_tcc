import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'

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

describe('autenticação', () => {
  const email = `integracao.${Date.now()}@example.test`
  const cadastro = { nomeMarcenaria: 'Marcenaria Integração', nomeResponsavel: 'Ana Teste', email, senha: 'teste123' }

  it('cadastra, impede e-mail duplicado, entra e encerra a sessão', async () => {
    const criada = await fetch(`${baseUrl}/auth/cadastro`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cadastro) })
    expect(criada.status).toBe(201)
    const sessao = await criada.json() as { token: string }

    const duplicada = await fetch(`${baseUrl}/auth/cadastro`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cadastro) })
    expect(duplicada.status).toBe(409)
    expect((await duplicada.json() as { mensagem: string }).mensagem).toBe('Este e-mail já está em uso')

    const invalida = await fetch(`${baseUrl}/auth/entrar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha: 'invalida' }) })
    expect(invalida.status).toBe(401)
    expect((await invalida.json() as { mensagem: string }).mensagem).toBe('E-mail ou senha inválidos')

    const entrada = await fetch(`${baseUrl}/auth/entrar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha: cadastro.senha }) })
    expect(entrada.status).toBe(200)

    const saida = await fetch(`${baseUrl}/auth/sair`, { method: 'POST', headers: { Authorization: `Bearer ${sessao.token}` } })
    expect(saida.status).toBe(204)
  })
})
