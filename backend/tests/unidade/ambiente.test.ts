import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'

describe('ambiente de desenvolvimento', () => {
  it('demonstra por que o projeto não usa ponto flutuante', () => {
    expect(0.1 + 0.2).not.toBe(0.3)
  })

  it('soma valores monetários com precisão exata', () => {
    const total = new Decimal('724.75').plus('37.05').plus('207.00').plus('106.80')
    expect(total.toFixed(2)).toBe('1075.60')
  })
})
