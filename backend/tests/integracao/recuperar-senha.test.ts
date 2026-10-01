import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'

// Sem SMTP no ambiente de teste, o e-mail fica em memória (D028): o teste lê o link de lá.
let servidor: Server
let baseUrl: string
let emails: { para: string; texto: string }[]

beforeAll(async () => {
  if (!process.env.DATABASE_URL_TESTE) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL é obrigatória para integração')
    const urlTeste = new URL(process.env.DATABASE_URL)
    urlTeste.pathname = `/${decodeURIComponent(urlTeste.pathname.slice(1))}_teste`
    process.env.DATABASE_URL_TESTE = urlTeste.toString()
  }
  process.env.DATABASE_URL = process.env.DATABASE_URL_TESTE
  for (const nome of ['SMTP_HOST', 'SMTP_USUARIO', 'SMTP_SENHA']) delete process.env[nome]
  const { app } = await import('../../src/servidor')
  emails = (await import('../../src/infra/email/enviar-email')).emailsNaoEnviados
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

const postar = (rota: string, corpo: unknown, token?: string) => fetch(`${baseUrl}${rota}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(corpo),
})
const linkPara = (email: string) => {
  const mensagem = emails.filter((e) => e.para === email).at(-1)
  return mensagem?.texto.match(/redefinir-senha\?token=([\w-]+)/)?.[1]
}

describe('recuperação de senha (RF07, D028)', () => {
  it('troca a senha pelo link do e-mail, uma vez só, e encerra as sessões abertas', async () => {
    const email = `recuperar.${Date.now()}@example.test`
    const criada = await postar('/auth/cadastro', { nomeMarcenaria: 'Marcenaria Recuperação', nomeResponsavel: 'Bia Teste', email, senha: 'senha-antiga' })
    const { token: sessaoAntiga } = await criada.json() as { token: string }

    const pedido = await postar('/auth/esqueci-senha', { email: email.toUpperCase() })
    expect(pedido.status).toBe(202)
    const token = linkPara(email)
    expect(token).toBeTruthy()

    const curta = await postar('/auth/redefinir-senha', { token, novaSenha: '123' })
    expect(curta.status).toBe(400)

    expect((await postar('/auth/redefinir-senha', { token, novaSenha: 'senha-nova-123' })).status).toBe(204)
    expect((await postar('/auth/entrar', { email, senha: 'senha-antiga' })).status).toBe(401)
    expect((await postar('/auth/entrar', { email, senha: 'senha-nova-123' })).status).toBe(200)
    // a sessão aberta antes da troca deixa de valer
    expect((await postar('/auth/sair', {}, sessaoAntiga)).status).toBe(401)

    const deNovo = await postar('/auth/redefinir-senha', { token, novaSenha: 'outra-senha-123' })
    expect(deNovo.status).toBe(400)
    expect((await deNovo.json() as { mensagem: string }).mensagem).toContain('inválido ou expirou')
  })

  it('responde igual para e-mail sem conta e não envia nada', async () => {
    const antes = emails.length
    const resposta = await postar('/auth/esqueci-senha', { email: `ninguem.${Date.now()}@example.test` })
    expect(resposta.status).toBe(202)
    expect((await resposta.json() as { mensagem: string }).mensagem).toBe('Se este e-mail tiver conta, enviamos um link para criar uma nova senha.')
    expect(emails.length).toBe(antes)
  })

  it('não reenvia em menos de 1 minuto e recusa link inventado', async () => {
    const email = `repetido.${Date.now()}@example.test`
    await postar('/auth/cadastro', { nomeMarcenaria: 'Marcenaria Repetida', nomeResponsavel: 'Caio Teste', email, senha: 'senha-antiga' })
    await postar('/auth/esqueci-senha', { email })
    await postar('/auth/esqueci-senha', { email })
    expect(emails.filter((e) => e.para === email)).toHaveLength(1)

    expect((await postar('/auth/redefinir-senha', { token: 'link-inventado', novaSenha: 'senha-nova-123' })).status).toBe(400)
  })
})
