import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Memorial } from './Memorial'
import { exibirMoeda, exibirNumero } from '../servicos/orcamentos'

// Memorial do CT03 exatamente como a API devolve (regras-de-calculo.md §4).
const ct03 = {
  subtotalMateriais: '1075.60', subtotalServicos: '690.00', totalAdicionais: '165.50', custoDiretoTotal: '1931.10',
  valorLucro: '827.61', multiplicadorEquivalente: null, ajusteArredondamento: '1.29', precoFinal: '2760.00',
}

describe('exibição de valores (só texto, AGENTS §8)', () => {
  it.each([
    ['2760.00', 'R$ 2.760,00'], ['1931.10', 'R$ 1.931,10'], ['0.00', 'R$ 0,00'], ['1234567.89', 'R$ 1.234.567,89'],
    ['289.9000', 'R$ 289,9000'], ['-1.29', '-R$ 1,29'],
  ])('%s → %s', (valor, esperado) => expect(exibirMoeda(valor)).toBe(esperado))

  it.each([['2.500', '2,5'], ['30.000', '30'], ['0.125', '0,125'], ['12', '12']])('quantidade %s → %s', (valor, esperado) => {
    expect(exibirNumero(valor)).toBe(esperado)
  })
})

describe('Memorial (RF31)', () => {
  it('exibe o CT03 na ordem de regras-de-calculo.md §5, com os valores da API', () => {
    render(<Memorial memorial={ct03} modoLucro="margem" percentualLucro="30.00" />)
    const linhas = screen.getAllByRole('term').map((termo) => `${termo.textContent} ${termo.nextElementSibling?.textContent}`)
    expect(linhas).toEqual([
      'Materiais R$ 1.075,60',
      'Serviços e mão de obra R$ 690,00',
      'Custos adicionais R$ 165,50',
      'Custo direto total R$ 1.931,10',
      'Lucro (margem 30,00% sobre o preço) R$ 827,61',
      'Ajuste de arredondamento R$ 1,29',
      'Preço final R$ 2.760,00',
    ])
  })

  it('no markup, mostra o multiplicador recebido da API (D018)', () => {
    render(<Memorial memorial={{ ...ct03, multiplicadorEquivalente: '2.50' }} modoLucro="markup" percentualLucro="150.00" />)
    expect(screen.getByText('Lucro (markup 150,00% · 2,50× o custo)')).toBeTruthy()
  })
})
