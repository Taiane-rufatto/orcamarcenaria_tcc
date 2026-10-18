import { describe, expect, it } from 'vitest'
import { lerDocumento } from '../../src/dominio/cliente/documento'

// Números de exemplo públicos, usados em material didático: não pertencem a pessoa ou empresa conhecida.
describe('CPF e CNPJ do cliente (RF54)', () => {
  it.each([
    ['529.982.247-25', 'cpf', '52998224725'],
    ['52998224725', 'cpf', '52998224725'],
    ['11.222.333/0001-81', 'cnpj', '11222333000181'],
    ['11222333000181', 'cnpj', '11222333000181'],
    [' 529 982 247 25 ', 'cpf', '52998224725'],
  ])('aceita %s', (texto, tipo, digitos) => {
    expect(lerDocumento(texto)).toEqual({ tipo, digitos })
  })

  it.each([
    ['dígito verificador errado no CPF', '529.982.247-26'],
    ['dígito verificador errado no CNPJ', '11.222.333/0001-80'],
    ['CPF com sequência repetida', '111.111.111-11'],
    ['CNPJ com sequência repetida', '00.000.000/0000-00'],
    ['poucos dígitos', '1234567'],
    ['12 dígitos', '123456789012'],
    ['letras', 'abc'],
    ['vazio', ''],
  ])('recusa: %s', (_nome, texto) => {
    expect(lerDocumento(texto)).toBeNull()
  })
})
