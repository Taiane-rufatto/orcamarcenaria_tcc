import { describe, expect, it } from 'vitest'
import { ContadorDeTentativas } from '../../src/api/middlewares/limite-de-tentativas'

// Relógio falso: o tempo é passado como número, sem esperar de verdade.
const MIN = 60 * 1000

describe('ContadorDeTentativas (A1)', () => {
  it('permite até o máximo dentro da janela e bloqueia a próxima', () => {
    const contador = new ContadorDeTentativas(15 * MIN, 3)
    expect([1, 2, 3].map(() => contador.registrar('a', 0).permitido)).toEqual([true, true, true])
    expect(contador.registrar('a', 0)).toEqual({ permitido: false, esperarSegundos: 900 })
  })

  it('informa quanto falta para a janela reabrir', () => {
    const contador = new ContadorDeTentativas(15 * MIN, 1)
    contador.registrar('a', 0)
    expect(contador.registrar('a', 5 * MIN)).toEqual({ permitido: false, esperarSegundos: 600 })
  })

  it('depois da janela, volta a permitir e zera a contagem', () => {
    const contador = new ContadorDeTentativas(15 * MIN, 2)
    contador.registrar('a', 0); contador.registrar('a', 0)
    expect(contador.registrar('a', 1000).permitido).toBe(false)
    expect(contador.registrar('a', 15 * MIN).permitido).toBe(true)
    expect(contador.registrar('a', 15 * MIN).permitido).toBe(true)
    expect(contador.registrar('a', 15 * MIN).permitido).toBe(false)
  })

  it('chaves diferentes não se misturam', () => {
    const contador = new ContadorDeTentativas(15 * MIN, 1)
    contador.registrar('a', 0)
    expect(contador.registrar('a', 0).permitido).toBe(false)
    expect(contador.registrar('b', 0).permitido).toBe(true)
  })
})
