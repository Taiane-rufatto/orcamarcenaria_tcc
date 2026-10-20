import { describe, expect, it } from 'vitest'
import { hostDaApi } from '../../src/config/host'

// Spec 027, achado F-01: a API não pode escutar em todas as interfaces sem que alguém peça isso de propósito.
describe('hostDaApi', () => {
  it('sem HOST, escuta só no próprio computador', () => {
    expect(hostDaApi(undefined)).toBe('127.0.0.1')
    expect(hostDaApi('')).toBe('127.0.0.1')
    expect(hostDaApi('   ')).toBe('127.0.0.1')
  })

  it('com HOST informado, usa o valor (sem espaços nas pontas)', () => {
    expect(hostDaApi('0.0.0.0')).toBe('0.0.0.0')
    expect(hostDaApi(' 10.0.0.5 ')).toBe('10.0.0.5')
  })
})
