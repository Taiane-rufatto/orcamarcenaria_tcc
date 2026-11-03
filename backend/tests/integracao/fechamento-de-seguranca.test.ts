import 'dotenv/config'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { Server } from 'node:http'

// Spec 028: fechamento dos achados F-05, F-06, F-07, F-09 e F-10 da auditoria de segurança.

let servidor: Server
let baseUrl: string
let pool: typeof import('../../src/infra/banco/pool').pool

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
  pool = (await import('../../src/infra/banco/pool')).pool
  servidor = app.listen(0)
  await new Promise<void>((resolver) => servidor.once('listening', resolver))
  const endereco = servidor.address()
  if (!endereco || typeof endereco === 'string') throw new Error('Não foi possível iniciar a API de teste')
  baseUrl = `http://127.0.0.1:${endereco.port}`
})

afterEach(() => { process.env.LIMITE_TENTATIVAS = 'desligado'; vi.unstubAllEnvs(); vi.restoreAllMocks() })

afterAll(async () => {
  if (!servidor) return
  await new Promise<void>((resolver, rejeitar) => servidor.close((erro) => erro ? rejeitar(erro) : resolver()))
})

const enviar = (rota: string, metodo: string, corpo?: unknown, token?: string) => fetch(`${baseUrl}${rota}`, {
  method: metodo,
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: corpo === undefined ? undefined : JSON.stringify(corpo),
})

async function conta(rotulo: string) {
  const email = `${rotulo}.${Date.now()}@example.test`
  const r = await enviar('/auth/cadastro', 'POST', { nomeMarcenaria: 'Marcenaria Exemplo', nomeResponsavel: 'Responsável Fictício', email, senha: 'teste1234' })
  const { token } = await r.json() as { token: string }
  return { email, token }
}

describe('troca de senha (F-05)', () => {
  it('na 11ª tentativa em 15 minutos responde 429 com Retry-After', async () => {
    const { token } = await conta('troca-limite')
    process.env.LIMITE_TENTATIVAS = 'ligado'
    for (let i = 1; i <= 10; i += 1) {
      expect((await enviar('/auth/senha', 'PUT', { senhaAtual: 'errada-123', novaSenha: 'nova-senha-123' }, token)).status, `tentativa ${i}`).not.toBe(429)
    }
    const bloqueada = await enviar('/auth/senha', 'PUT', { senhaAtual: 'errada-123', novaSenha: 'nova-senha-123' }, token)
    expect(bloqueada.status).toBe(429)
    expect(Number(bloqueada.headers.get('retry-after'))).toBeGreaterThan(0)
  })

  it('recusa senha com mais de 128 caracteres no cadastro, na troca, na redefinição e no login', async () => {
    const longa = 'a'.repeat(129)
    const cadastro = await enviar('/auth/cadastro', 'POST', { nomeMarcenaria: 'X', nomeResponsavel: 'Y', email: `longa.${Date.now()}@example.test`, senha: longa })
    expect(cadastro.status).toBe(400)

    const { token } = await conta('senha-longa')
    expect((await enviar('/auth/senha', 'PUT', { senhaAtual: 'teste1234', novaSenha: longa }, token)).status).toBe(400)
    expect((await enviar('/auth/senha', 'PUT', { senhaAtual: longa, novaSenha: 'nova-senha-123' }, token)).status).toBe(400)
    expect((await enviar('/auth/redefinir-senha', 'POST', { token: 'qualquer', novaSenha: longa })).status).toBe(400)
    expect((await enviar('/auth/entrar', 'POST', { email: 'a@example.test', senha: longa })).status).toBe(400)
  })

  it('aceita senha de exatamente 128 caracteres', async () => {
    const { token } = await conta('senha-128')
    expect((await enviar('/auth/senha', 'PUT', { senhaAtual: 'teste1234', novaSenha: 'b'.repeat(128) }, token)).status).toBe(200)
  })
})

describe('limite que não desliga em produção (F-09)', () => {
  it('LIMITE_TENTATIVAS=desligado é ignorado quando NODE_ENV=production', async () => {
    process.env.LIMITE_TENTATIVAS = 'desligado'
    vi.stubEnv('NODE_ENV', 'production')
    const email = `prod-fixo.${Date.now()}@example.test`
    for (let i = 1; i <= 10; i += 1) await enviar('/auth/entrar', 'POST', { email, senha: 'qualquer-123' })
    expect((await enviar('/auth/entrar', 'POST', { email, senha: 'qualquer-123' })).status).toBe(429)
  })
})

describe('sessão de usuário desativado (F-10)', () => {
  it('o token emitido antes da desativação passa a receber 401', async () => {
    const { email, token } = await conta('desativado')
    expect((await enviar('/orcamentos', 'GET', undefined, token)).status).toBe(200)
    await pool.query('UPDATE usuario SET ativo = false WHERE email = $1', [email])
    expect((await enviar('/orcamentos', 'GET', undefined, token)).status).toBe(401)
  })
})

describe('e-mail de recuperação sem SMTP em produção (F-06)', () => {
  it('não escreve o link nem o token no log; fora de produção continua escrevendo', async () => {
    const { email } = await conta('log-token')
    const registro = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    vi.stubEnv('NODE_ENV', 'production')
    await enviar('/auth/esqueci-senha', 'POST', { email })
    const emProducao = registro.mock.calls.flat().join('\n')
    expect(emProducao).not.toContain('redefinir-senha')
    expect(emProducao).not.toContain('token=')

    // O pedido anterior bloqueia um novo por 1 minuto; apaga para o segundo envio.
    await pool.query('DELETE FROM redefinicao_senha WHERE usuario_id = (SELECT id FROM usuario WHERE email = $1)', [email])
    registro.mockClear()
    vi.stubEnv('NODE_ENV', 'test')
    await enviar('/auth/esqueci-senha', 'POST', { email })
    expect(registro.mock.calls.flat().join('\n')).toContain('redefinir-senha#token=')
  })
})

describe('JOINs com fornecedor de outra marcenaria (F-07)', () => {
  it('mesmo com um vínculo gravado à força no banco, o nome do fornecedor de outra marcenaria não aparece', async () => {
    const a = await conta('join-a')
    const b = await conta('join-b')
    const fornecedor = await (await enviar('/fornecedores', 'POST', { nome: 'Fornecedor Sigiloso', telefone: '11999990000' }, a.token)).json() as { id: string }
    const material = await (await enviar('/materiais', 'POST', { nome: 'Material B', unidade: 'un', custoUnitario: '10' }, b.token)).json() as { id: string }

    // Estado que nenhuma rota produz (as rotas conferem o dono antes de gravar): só o banco permite criá-lo.
    await pool.query('UPDATE material SET fornecedor_id = $1 WHERE id = $2', [fornecedor.id, material.id])

    const lista = await (await enviar('/materiais', 'GET', undefined, b.token)).json() as { id: string; fornecedor_nome: string | null }[]
    expect(lista.find((m) => m.id === material.id)?.fornecedor_nome).toBeNull()
    expect(JSON.stringify(lista)).not.toContain('Fornecedor Sigiloso')
  })
})
