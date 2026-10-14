import { describe, expect, it } from 'vitest'
import { avaliarEquilibrio, type EntradaEquilibrio } from '../../src/dominio/equilibrio/equilibrio'

// Valores fictícios, conferíveis à mão (spec 018):
// preço final 4.200,00 e custo direto 2.100,00 → lucro 2.100,00 → 50,00% do preço.
const base: EntradaEquilibrio = { lucroMinimo: '40', precoFinal: '4200.00', custoDiretoTotal: '2100.00' }

describe('RN12 e RN13 — lucro real e percentual do preço', () => {
  it('acima do mínimo: lucro 2.100,00 = 50,00% do preço (mínimo 40%) → não avisa', () => {
    expect(avaliarEquilibrio(base)).toEqual({ lucro: '2100.00', percentualDoPreco: '50.00', lucroMinimo: '40.00', abaixoDoMinimo: false })
  })

  it('abaixo do mínimo: 50,00% com mínimo de 60% → avisa', () => {
    expect(avaliarEquilibrio({ ...base, lucroMinimo: '60' })).toMatchObject({ percentualDoPreco: '50.00', lucroMinimo: '60.00', abaixoDoMinimo: true })
  })

  it('exatamente no mínimo: 1.000,00 de preço com custo 700,00 = 30,00% (mínimo 30%) → não avisa', () => {
    const resultado = avaliarEquilibrio({ lucroMinimo: '30', precoFinal: '1000.00', custoDiretoTotal: '700.00' })
    expect(resultado).toMatchObject({ lucro: '300.00', percentualDoPreco: '30.00', abaixoDoMinimo: false })
  })

  it('compara o percentual já arredondado, o mesmo que a tela mostra: 1/3 = 33,33% → mínimo 33,34 avisa, 33,33 não', () => {
    const entrada = { precoFinal: '3.00', custoDiretoTotal: '2.00' }
    expect(avaliarEquilibrio({ ...entrada, lucroMinimo: '33.34' })).toMatchObject({ percentualDoPreco: '33.33', abaixoDoMinimo: true })
    expect(avaliarEquilibrio({ ...entrada, lucroMinimo: '33.33' })).toMatchObject({ percentualDoPreco: '33.33', abaixoDoMinimo: false })
  })

  it('arredonda meio para cima: lucro 0,01 em preço de 8,00 = 0,125% → 0,13%', () => {
    expect(avaliarEquilibrio({ lucroMinimo: null, precoFinal: '8.00', custoDiretoTotal: '7.99' })?.percentualDoPreco).toBe('0.13')
    expect(avaliarEquilibrio({ lucroMinimo: null, precoFinal: '8.00', custoDiretoTotal: '7.00' })?.percentualDoPreco).toBe('12.50')
  })

  it('CT03 (preço 2.760,00, custo 1.931,10): lucro 828,90 (827,61 + ajuste 1,29) = 30,03% do preço', () => {
    expect(avaliarEquilibrio({ lucroMinimo: '30', precoFinal: '2760.00', custoDiretoTotal: '1931.10' }))
      .toEqual({ lucro: '828.90', percentualDoPreco: '30.03', lucroMinimo: '30.00', abaixoDoMinimo: false })
  })

  it('sem mínimo informado: mostra o lucro e nunca avisa', () => {
    expect(avaliarEquilibrio({ ...base, lucroMinimo: null })).toEqual({ lucro: '2100.00', percentualDoPreco: '50.00', lucroMinimo: null, abaixoDoMinimo: false })
  })

  it.each(['0', '100', '150', '-5', 'abc', '1e1', '', '10.123'])('mínimo inválido (%s) vale como não informado', (minimo) => {
    expect(avaliarEquilibrio({ ...base, lucroMinimo: minimo })).toMatchObject({ lucroMinimo: null, abaixoDoMinimo: false })
  })

  it('lucro negativo (custo acima do preço) é calculado e avisa', () => {
    expect(avaliarEquilibrio({ lucroMinimo: '10', precoFinal: '100.00', custoDiretoTotal: '150.00' }))
      .toEqual({ lucro: '-50.00', percentualDoPreco: '-50.00', lucroMinimo: '10.00', abaixoDoMinimo: true })
  })

  it('preço zero (orçamento sem itens): não calcula', () => {
    expect(avaliarEquilibrio({ lucroMinimo: '30', precoFinal: '0.00', custoDiretoTotal: '0.00' })).toBeNull()
  })

  it('não devolve nem altera o preço final', () => {
    expect(Object.keys(avaliarEquilibrio(base)!)).not.toContain('precoFinal')
  })
})
