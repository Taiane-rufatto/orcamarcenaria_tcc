import { describe, expect, it } from 'vitest'
import { calcularOrcamento, type EntradaCalculo } from '../../src/dominio/orcamento/calculo'

// Monta uma entrada com um único item de material. Cada caso muda só o que interessa.
function entrada(mudar: Partial<EntradaCalculo> & { quantidade?: string; valor?: string }): EntradaCalculo {
  return {
    itens: [{ tipo: 'material', quantidade: mudar.quantidade ?? '1', valorUnitario: mudar.valor ?? '100.00' }],
    custosAdicionais: [],
    modoLucro: mudar.modoLucro ?? 'margem',
    percentualLucro: mudar.percentualLucro ?? '0',
    regraArredondamento: mudar.regraArredondamento ?? 'duas_casas',
  }
}

const preco = (mudar: Parameters<typeof entrada>[0]) => calcularOrcamento(entrada(mudar)).precoFinal

describe('RN10 — margem: 0 ≤ m < 100 (valores-limite)', () => {
  it('VL01: margem -0,01 é recusada', () => {
    expect(() => calcularOrcamento(entrada({ percentualLucro: '-0.01' }))).toThrow('A margem não pode ser negativa')
  })
  it('VL02: margem 0 é aceita', () => {
    expect(preco({ percentualLucro: '0' })).toBe('100.00')
  })
  it('VL03: margem 99,99 é aceita', () => {
    expect(preco({ percentualLucro: '99.99' })).toBe('1000000.00')
  })
  it('VL04: margem 100 é recusada', () => {
    expect(() => calcularOrcamento(entrada({ percentualLucro: '100' }))).toThrow('A margem deve ser menor que 100%')
  })
})

describe('RN10 — quantidade: > 0 (valores-limite)', () => {
  it('VL05: quantidade 0 é recusada', () => {
    expect(() => calcularOrcamento(entrada({ quantidade: '0', valor: '10.00' }))).toThrow('A quantidade deve ser maior que zero')
  })
  it('VL06: quantidade 0,001 é aceita', () => {
    expect(preco({ quantidade: '0.001', valor: '10.00' })).toBe('0.01')
  })
})

describe('RN07 — arredondamento (valores-limite)', () => {
  it('VL07: dezena, 2749,99 sobe para 2750,00', () => {
    expect(preco({ valor: '2749.99', regraArredondamento: 'dezena' })).toBe('2750.00')
  })
  it('VL08: dezena, 2750,00 já é dezena e não muda', () => {
    expect(preco({ valor: '2750.00', regraArredondamento: 'dezena' })).toBe('2750.00')
  })
  it('VL09: dezena, 2750,01 sobe para 2760,00', () => {
    expect(preco({ valor: '2750.01', regraArredondamento: 'dezena' })).toBe('2760.00')
  })
  it('VL10: real inteiro, 933,00 não muda', () => {
    expect(preco({ valor: '933.00', regraArredondamento: 'real_inteiro' })).toBe('933.00')
  })
  it('VL11: real inteiro, 933,01 sobe para 934,00', () => {
    expect(preco({ valor: '933.01', regraArredondamento: 'real_inteiro' })).toBe('934.00')
  })
})

describe('RN07 — partição de equivalência: o mesmo valor 2758,71 nas três regras', () => {
  it('PE01: duas casas mantém 2758,71', () => {
    expect(preco({ valor: '2758.71', regraArredondamento: 'duas_casas' })).toBe('2758.71')
  })
  it('PE02: real inteiro leva a 2759,00', () => {
    expect(preco({ valor: '2758.71', regraArredondamento: 'real_inteiro' })).toBe('2759.00')
  })
  it('PE03: dezena leva a 2760,00', () => {
    expect(preco({ valor: '2758.71', regraArredondamento: 'dezena' })).toBe('2760.00')
  })
})
