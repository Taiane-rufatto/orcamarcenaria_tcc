import { describe, expect, it } from 'vitest'
import { resumirMes, type LinhaPainel } from '../../src/dominio/painel/painel'

// Valores fictícios, conferíveis à mão (spec 019). Aprovados: 4.200,00 (custo 2.100,00) e o CT03
// (2.760,00, custo 1.931,10). Valor aprovado = 6.960,00. Lucro = 2.100,00 + 828,90 = 2.928,90.
// 2.928,90 ÷ 6.960,00 = 42,08% do preço. 2 aprovados de 5 enviados = 40,00%.
const mes: LinhaPainel[] = [
  { situacao: 'aprovado', precoFinal: '4200.00', custoDiretoTotal: '2100.00' },
  { situacao: 'aprovado', precoFinal: '2760.00', custoDiretoTotal: '1931.10' },
  { situacao: 'recusado', precoFinal: '1000.00', custoDiretoTotal: '700.00' },
  { situacao: 'vencido', precoFinal: '500.00', custoDiretoTotal: '400.00' },
  { situacao: 'enviado', precoFinal: '3000.00', custoDiretoTotal: '2000.00' },
  { situacao: 'rascunho', precoFinal: '0.00', custoDiretoTotal: '0.00' },
]

describe('RN14 — resumo do mês', () => {
  it('conta por situação, soma só os aprovados e calcula a taxa de aprovação', () => {
    expect(resumirMes(mes)).toEqual({
      rascunhos: 1,
      enviados: 5,
      aguardando: 1,
      aprovados: { quantidade: 2, valor: '6960.00', lucro: '2928.90', percentualDoPreco: '42.08' },
      recusados: 1,
      vencidos: 1,
      taxaDeAprovacao: '40.00',
    })
  })

  it('rascunho não conta como enviado e não entra em nenhuma soma', () => {
    const resumo = resumirMes([{ situacao: 'rascunho', precoFinal: '999.00', custoDiretoTotal: '1.00' }])
    expect(resumo).toMatchObject({ rascunhos: 1, enviados: 0, taxaDeAprovacao: null })
    expect(resumo.aprovados).toEqual({ quantidade: 0, valor: '0.00', lucro: '0.00', percentualDoPreco: null })
  })

  it('mês sem orçamentos: tudo zerado e sem taxa', () => {
    expect(resumirMes([])).toEqual({
      rascunhos: 0, enviados: 0, aguardando: 0,
      aprovados: { quantidade: 0, valor: '0.00', lucro: '0.00', percentualDoPreco: null },
      recusados: 0, vencidos: 0, taxaDeAprovacao: null,
    })
  })

  it('arredonda meio para cima: 1 aprovado de 8 enviados = 12,50%; 1 de 3 = 33,33%', () => {
    const umAprovado: LinhaPainel = { situacao: 'aprovado', precoFinal: '100.00', custoDiretoTotal: '60.00' }
    const recusado: LinhaPainel = { situacao: 'recusado', precoFinal: '10.00', custoDiretoTotal: '5.00' }
    expect(resumirMes([umAprovado, ...Array(7).fill(recusado)]).taxaDeAprovacao).toBe('12.50')
    expect(resumirMes([umAprovado, recusado, recusado]).taxaDeAprovacao).toBe('33.33')
  })

  it('só aprovados valem como valor: orçamento enviado e recusado não somam', () => {
    const resumo = resumirMes([
      { situacao: 'enviado', precoFinal: '5000.00', custoDiretoTotal: '1.00' },
      { situacao: 'recusado', precoFinal: '7000.00', custoDiretoTotal: '1.00' },
    ])
    expect(resumo.aprovados.valor).toBe('0.00')
  })
})
