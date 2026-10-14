import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AvisoEquilibrio } from './AvisoEquilibrio'

// Valores fictícios da spec 018, exatamente como a API devolve: nada é calculado na tela.
const acima = { lucro: '2100.00', percentualDoPreco: '50.00', lucroMinimo: '40.00', abaixoDoMinimo: false }
const abaixo = { lucro: '420.00', percentualDoPreco: '16.67', lucroMinimo: '30.00', abaixoDoMinimo: true }
const semMinimo = { lucro: '2100.00', percentualDoPreco: '50.00', lucroMinimo: null, abaixoDoMinimo: false }

const mostrar = (equilibrio: Parameters<typeof AvisoEquilibrio>[0]['equilibrio']) =>
  render(<MemoryRouter><AvisoEquilibrio equilibrio={equilibrio} /></MemoryRouter>)

const linhas = () => screen.getAllByRole('term').map((t) => `${t.textContent} ${t.nextElementSibling?.textContent}`)

describe('AvisoEquilibrio (RF46)', () => {
  afterEach(cleanup)

  it('abaixo do mínimo: mostra lucro, percentual e mínimo da API e avisa, sem bloquear', () => {
    mostrar(abaixo)
    expect(linhas()).toEqual([
      'Lucro depois de pagar tudo R$ 420,00',
      'Isso é do preço de venda 16,67%',
      'Seu lucro mínimo 30,00%',
    ])
    expect(screen.getByRole('status').textContent).toContain('abaixo do mínimo')
    expect(screen.getByRole('status').className).toContain('alerta')
  })

  it('dentro do mínimo: confirma sem alarme', () => {
    mostrar(acima)
    expect(screen.getByRole('status').textContent).toContain('dentro do mínimo')
    expect(screen.getByRole('status').className).not.toContain('alerta')
  })

  it('sem mínimo definido: mostra o lucro, não avisa e convida a definir em Minha marcenaria', () => {
    mostrar(semMinimo)
    expect(linhas()).toEqual(['Lucro depois de pagar tudo R$ 2.100,00', 'Isso é do preço de venda 50,00%'])
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByRole('link', { name: 'Minha marcenaria' }).getAttribute('href')).toBe('/minha-marcenaria')
  })

  it('orçamento sem itens: pede os itens, sem aviso', () => {
    mostrar(null)
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText(/Inclua os itens/)).toBeTruthy()
  })
})
