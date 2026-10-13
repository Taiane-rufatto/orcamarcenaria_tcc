import { describe, expect, it } from 'vitest'
import { avaliarEquilibrio, necessarioPorHora, type EntradaEquilibrio } from '../../src/dominio/equilibrio/equilibrio'

// Valores fictícios, conferíveis à mão (spec 018):
// meta R$ 8.000,00 por mês ÷ 160 h = R$ 50,00 por hora necessários.
// Orçamento: preço final 2.760,00 − materiais 1.200,00 − adicionais 100,00 = contribuição 1.460,00.
const base: EntradaEquilibrio = {
  metaMensal: '8000.00',
  horasProdutivasMes: '160',
  horasEstimadas: '40',
  precoFinal: '2760.00',
  subtotalMateriais: '1200.00',
  totalAdicionais: '100.00',
}

describe('RN12 — valor necessário por hora', () => {
  it('divide a meta mensal pelas horas produtivas', () => {
    expect(necessarioPorHora(base)).toBe('50.00')
  })

  it('arredonda para cima na terceira casa (10000,00 ÷ 176 = 56,8181…)', () => {
    expect(necessarioPorHora({ metaMensal: '10000.00', horasProdutivasMes: '176' })).toBe('56.82')
  })

  it.each([
    ['sem meta', { metaMensal: null, horasProdutivasMes: '160' }],
    ['sem horas produtivas', { metaMensal: '8000.00', horasProdutivasMes: null }],
    ['meta zero', { metaMensal: '0', horasProdutivasMes: '160' }],
    ['horas produtivas zero', { metaMensal: '8000.00', horasProdutivasMes: '0' }],
    ['texto inválido', { metaMensal: '1e3', horasProdutivasMes: 'abc' }],
  ])('devolve nulo quando falta dado: %s', (_nome, config) => {
    expect(necessarioPorHora(config)).toBeNull()
  })
})

describe('RN13 — valor do orçamento por hora e aviso', () => {
  it('abaixo do necessário: 1.460,00 ÷ 40 h = R$ 36,50 por hora (< 50,00) → avisa', () => {
    expect(avaliarEquilibrio(base)).toEqual({
      contribuicao: '1460.00',
      valorPorHora: '36.50',
      necessarioPorHora: '50.00',
      abaixoDoNecessario: true,
    })
  })

  it('acima do necessário: 1.460,00 ÷ 25 h = R$ 58,40 por hora (≥ 50,00) → não avisa', () => {
    expect(avaliarEquilibrio({ ...base, horasEstimadas: '25' })).toEqual({
      contribuicao: '1460.00',
      valorPorHora: '58.40',
      necessarioPorHora: '50.00',
      abaixoDoNecessario: false,
    })
  })

  it('exatamente igual à meta: 1.460,00 ÷ 29,2 h = R$ 50,00 por hora → não avisa', () => {
    const resultado = avaliarEquilibrio({ ...base, horasEstimadas: '29.2' })
    expect(resultado?.valorPorHora).toBe('50.00')
    expect(resultado?.abaixoDoNecessario).toBe(false)
  })

  it('compara os valores já arredondados: 1.459,88 ÷ 29,2 = 49,9958… vira 50,00 e não avisa', () => {
    const resultado = avaliarEquilibrio({ ...base, precoFinal: '2759.88', horasEstimadas: '29.2' })
    expect(resultado?.valorPorHora).toBe('50.00')
    expect(resultado?.abaixoDoNecessario).toBe(false)
  })

  it('arredonda meio para cima: 1,00 ÷ 8 h = 0,125 → R$ 0,13', () => {
    const resultado = avaliarEquilibrio({
      ...base, precoFinal: '1.00', subtotalMateriais: '0.00', totalAdicionais: '0.00', horasEstimadas: '8',
    })
    expect(resultado?.valorPorHora).toBe('0.13')
  })

  it('serviços não são descontados: só materiais e custos adicionais saem do preço', () => {
    // O preço 2.760,00 inclui serviços; eles não aparecem na entrada e a contribuição continua 1.460,00.
    expect(avaliarEquilibrio(base)?.contribuicao).toBe('1460.00')
  })

  it('contribuição negativa (materiais acima do preço) é calculada e avisa', () => {
    const resultado = avaliarEquilibrio({
      ...base, precoFinal: '100.00', subtotalMateriais: '150.00', totalAdicionais: '0.00', horasEstimadas: '10',
    })
    expect(resultado).toMatchObject({ contribuicao: '-50.00', valorPorHora: '-5.00', abaixoDoNecessario: true })
  })

  it.each([
    ['sem horas estimadas', { horasEstimadas: null }],
    ['horas estimadas zero', { horasEstimadas: '0' }],
    ['sem meta', { metaMensal: null }],
    ['sem horas produtivas', { horasProdutivasMes: null }],
  ])('não calcula e não avisa: %s', (_nome, mudanca) => {
    expect(avaliarEquilibrio({ ...base, ...mudanca })).toBeNull()
  })

  it('não devolve nem altera o preço final', () => {
    expect(Object.keys(avaliarEquilibrio(base)!)).not.toContain('precoFinal')
  })
})
