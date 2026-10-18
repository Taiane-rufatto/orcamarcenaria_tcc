import { describe, expect, it } from 'vitest'
import { exibirDocumento } from './clientes'

// Só exibição (spec 022): a API guarda e valida só os dígitos.
describe('exibirDocumento (RF54)', () => {
  it.each([
    ['52998224725', '529.982.247-25'],
    ['11222333000181', '11.222.333/0001-81'],
    ['123', '123'],
  ])('%s → %s', (digitos, exibido) => {
    expect(exibirDocumento(digitos)).toBe(exibido)
  })
})
