import { describe, expect, it } from 'vitest'
import { cadastroSchema, entrarSchema } from '../../src/api/validacoes/autenticacao'

describe('validações de autenticação', () => {
  it('normaliza o e-mail do cadastro e exige senha com oito caracteres', () => {
    const resultado = cadastroSchema.parse({
      nomeMarcenaria: 'Marcenaria Exemplo', nomeResponsavel: 'Ana Teste',
      email: 'ANA@EXAMPLE.TEST', senha: 'senha123',
    })
    expect(resultado.email).toBe('ana@example.test')
    expect(cadastroSchema.safeParse({ ...resultado, senha: 'curta' }).success).toBe(false)
  })

  it('não aceita entrada sem senha ou e-mail válido', () => {
    expect(entrarSchema.safeParse({ email: 'invalido', senha: '' }).success).toBe(false)
  })
})
