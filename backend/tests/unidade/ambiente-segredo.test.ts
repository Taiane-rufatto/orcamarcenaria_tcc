import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Achado A7: o JWT_SECRET precisa ser longo e não pode ser o texto de exemplo do .env.example.
const ORIGINAL = { ...process.env }

beforeEach(() => { vi.resetModules(); process.env.DATABASE_URL = 'postgresql://x:x@localhost:5432/x' })
afterEach(() => { process.env = { ...ORIGINAL } })

const carregar = () => import('../../src/config/ambiente')

describe('JWT_SECRET (A7)', () => {
  it.each([
    ['curto demais', 'abc123'],
    ['31 caracteres', 'a'.repeat(31)],
    ['o texto do exemplo', 'troque-por-um-valor-aleatorio-longo'],
  ])('recusa: %s', async (_nome, segredo) => {
    process.env.JWT_SECRET = segredo
    await expect(carregar()).rejects.toThrow('JWT_SECRET fraco')
  })

  it('aceita 32 caracteres ou mais', async () => {
    process.env.JWT_SECRET = 'a'.repeat(32)
    expect((await carregar()).ambiente.segredoJwt).toBe('a'.repeat(32))
  })
})
