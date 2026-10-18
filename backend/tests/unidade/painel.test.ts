import { describe, expect, it } from 'vitest'
import {
  progressoDaMeta, resumirCobranca, resumirMes, variacaoDePreco, type LinhaCobranca, type LinhaPainel,
} from '../../src/dominio/painel/painel'

// Valores fictícios, conferíveis à mão (specs 019 e 024). Aprovados: 4.200,00 (custo 2.100,00) e o CT03
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
      aprovados: { quantidade: 2, valor: '6960.00', lucro: '2928.90', percentualDoPreco: '42.08', emProducao: 0, entregues: 0 },
      recusados: 1,
      vencidos: 1,
      taxaDeAprovacao: '40.00',
    })
  })

  it('aprovado inclui o que está em produção e o que foi entregue; os dois são contados à parte', () => {
    const resumo = resumirMes([
      { situacao: 'aprovado', precoFinal: '4200.00', custoDiretoTotal: '2100.00' },
      { situacao: 'em_producao', precoFinal: '2760.00', custoDiretoTotal: '1931.10' },
      { situacao: 'entregue', precoFinal: '1000.00', custoDiretoTotal: '700.00' },
      { situacao: 'recusado', precoFinal: '500.00', custoDiretoTotal: '400.00' },
    ])
    expect(resumo.aprovados).toEqual({ quantidade: 3, valor: '7960.00', lucro: '3228.90', percentualDoPreco: '40.56', emProducao: 1, entregues: 1 })
    expect(resumo).toMatchObject({ enviados: 4, taxaDeAprovacao: '75.00', aguardando: 0 })
  })

  it('rascunho não conta como enviado e não entra em nenhuma soma', () => {
    const resumo = resumirMes([{ situacao: 'rascunho', precoFinal: '999.00', custoDiretoTotal: '1.00' }])
    expect(resumo).toMatchObject({ rascunhos: 1, enviados: 0, taxaDeAprovacao: null })
    expect(resumo.aprovados).toEqual({ quantidade: 0, valor: '0.00', lucro: '0.00', percentualDoPreco: null, emProducao: 0, entregues: 0 })
  })

  it('mês sem orçamentos: tudo zerado e sem taxa', () => {
    expect(resumirMes([])).toEqual({
      rascunhos: 0, enviados: 0, aguardando: 0,
      aprovados: { quantidade: 0, valor: '0.00', lucro: '0.00', percentualDoPreco: null, emProducao: 0, entregues: 0 },
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

describe('RN18 — cobrança de mão de obra', () => {
  // Orçamento A: preço 4.200,00; serviços 800,00 (8 h a 50,00 = 400,00 e 8 h a 50,00 = 400,00).
  // Orçamento B: preço 2.760,00; serviços 690,00, sendo 6 h a 55,00 = 330,00 por hora e 360,00 por unidade (fora da conta da hora).
  const linhas: LinhaCobranca[] = [
    { situacao: 'aprovado', precoFinal: '4200.00', subtotalServicos: '800.00', horas: '16', valorDasHoras: '800.00' },
    { situacao: 'enviado', precoFinal: '2760.00', subtotalServicos: '690.00', horas: '6', valorDasHoras: '330.00' },
    { situacao: 'rascunho', precoFinal: '9999.00', subtotalServicos: '9999.00', horas: '99', valorDasHoras: '9999.00' },
  ]

  it('soma a mão de obra, a participação no preço e a média ponderada da hora, sem o rascunho', () => {
    // mão de obra 1.490,00 de 6.960,00 = 21,41%; horas 22; valor das horas 1.130,00 ÷ 22 = 51,3636… = 51,36
    expect(resumirCobranca(linhas)).toEqual({ maoDeObra: '1490.00', percentualDoPreco: '21.41', valorMedioDaHora: '51.36' })
  })

  it('sem serviço por hora não há valor da hora; sem orçamentos enviados não há percentual', () => {
    expect(resumirCobranca([{ situacao: 'enviado', precoFinal: '1000.00', subtotalServicos: '200.00', horas: '0', valorDasHoras: '0' }]))
      .toEqual({ maoDeObra: '200.00', percentualDoPreco: '20.00', valorMedioDaHora: null })
    expect(resumirCobranca([])).toEqual({ maoDeObra: '0.00', percentualDoPreco: null, valorMedioDaHora: null })
  })
})

describe('RN19 — variação de preço', () => {
  it.each([
    ['289.90', '313.09', '8.00', 'subindo'],
    ['313.09', '289.90', '-7.41', 'caindo'],
    ['50.00', '50.00', '0.00', 'estavel'],
    ['50.00', '50.001', '0.00', 'estavel'],
    ['50.00', '55.00', '10.00', 'subindo'],
  ])('de %s para %s: %s%% (%s)', (anterior, atual, percentual, tendencia) => {
    expect(variacaoDePreco(anterior, atual)).toEqual({ percentual, tendencia })
  })

  it('sem valor anterior (nulo ou zero) ou sem valor atual, não compara', () => {
    expect(variacaoDePreco(null, '10.00')).toBeNull()
    expect(variacaoDePreco('10.00', null)).toBeNull()
    expect(variacaoDePreco('0', '10.00')).toBeNull()
  })

  it('serve também para o valor médio da hora: de 50,00 para 55,00 é +10,00%', () => {
    expect(variacaoDePreco('50.00', '55.00')?.tendencia).toBe('subindo')
  })
})

describe('RN20 — meta do mês', () => {
  it('aprovado abaixo da meta: 6.960,00 de 10.000,00 = 69,60%, faltam 3.040,00', () => {
    expect(progressoDaMeta('6960.00', '10000.00')).toEqual({ meta: '10000.00', aprovado: '6960.00', percentual: '69.60', falta: '3040.00', atingida: false })
  })

  it('meta batida (ou superada): falta zero e atingida', () => {
    expect(progressoDaMeta('10000.00', '10000.00')).toMatchObject({ percentual: '100.00', falta: '0.00', atingida: true })
    expect(progressoDaMeta('12500.00', '10000.00')).toMatchObject({ percentual: '125.00', falta: '0.00', atingida: true })
  })

  it('nada aprovado ainda: 0,00% e falta a meta inteira', () => {
    expect(progressoDaMeta('0.00', '8000.00')).toEqual({ meta: '8000.00', aprovado: '0.00', percentual: '0.00', falta: '8000.00', atingida: false })
  })

  it.each([[null], ['0'], ['0.00']])('sem meta (%s): não há progresso', (meta) => {
    expect(progressoDaMeta('6960.00', meta)).toBeNull()
  })
})
