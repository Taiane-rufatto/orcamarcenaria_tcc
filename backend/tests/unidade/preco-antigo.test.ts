import { describe, expect, it } from 'vitest'
import { PRAZO_PRECO_ANTIGO_DIAS, precoEstaAntigo } from '../../src/dominio/catalogo/preco-antigo'

describe('RN15 — alerta de preço antigo', () => {
  it('o prazo é de 30 dias', () => {
    expect(PRAZO_PRECO_ANTIGO_DIAS).toBe(30)
  })

  it.each([[0, false], [1, false], [29, false], [30, false], [31, true], [90, true]])('%i dias desde a atualização → antigo: %s', (dias, antigo) => {
    expect(precoEstaAntigo(dias)).toBe(antigo)
  })
})
