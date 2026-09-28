import { describe, expect, it } from 'vitest'
import { valorPorExtenso } from '../../src/infra/pdf/extenso'

// Casos conferidos à mão, cobrindo as regras de ligação ("e" ou vírgula), singular e plural,
// "mil" sem "um", "de reais" depois de milhão redondo e centavos.
describe('valor por extenso (RF41)', () => {
  it.each([
    ['0.00', 'zero reais'],
    ['0.01', 'um centavo'],
    ['0.50', 'cinquenta centavos'],
    ['1.00', 'um real'],
    ['2.00', 'dois reais'],
    ['14.00', 'catorze reais'],
    ['21.01', 'vinte e um reais e um centavo'],
    ['100.00', 'cem reais'],
    ['101.00', 'cento e um reais'],
    ['110.10', 'cento e dez reais e dez centavos'],
    ['999.99', 'novecentos e noventa e nove reais e noventa e nove centavos'],
    ['1000.00', 'mil reais'],
    ['1001.00', 'mil e um reais'],
    ['1100.00', 'mil e cem reais'],
    ['1250.00', 'mil, duzentos e cinquenta reais'],
    ['2760.00', 'dois mil, setecentos e sessenta reais'],
    ['5023.25', 'cinco mil e vinte e três reais e vinte e cinco centavos'],
    ['5110.09', 'cinco mil, cento e dez reais e nove centavos'],
    ['100000.00', 'cem mil reais'],
    ['1000000.00', 'um milhão de reais'],
    ['2500000.00', 'dois milhões e quinhentos mil reais'],
    ['1234567.89', 'um milhão, duzentos e trinta e quatro mil, quinhentos e sessenta e sete reais e oitenta e nove centavos'],
    ['3000000000.00', 'três bilhões de reais'],
  ])('%s → %s', (valor, esperado) => expect(valorPorExtenso(valor)).toBe(esperado))

  it.each(['2760', '2760,00', '-1.00', 'NaN', '1e3.00'])('recusa %j', (valor) => {
    expect(() => valorPorExtenso(valor)).toThrow()
  })
})
