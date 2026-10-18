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

describe('AvisoEquilibrio (RF46)', () => {
  afterEach(cleanup)

  it('abaixo do mínimo: diz quanto sobra em frase simples e avisa, sem bloquear', () => {
    mostrar(abaixo)
    expect(screen.getByText(/Neste orçamento sobram/).textContent).toBe('Neste orçamento sobram R$ 420,00 de lucro, que é 16,67% do preço.')
    expect(screen.getByRole('status').textContent).toBe('Atenção: você quer pelo menos 30,00% de lucro e aqui sobra só 16,67%. O preço continua o mesmo.')
    expect(screen.getByRole('status').className).toContain('alerta')
  })

  it('dentro do mínimo: confirma sem alarme', () => {
    mostrar(acima)
    expect(screen.getByText(/Neste orçamento sobram/).textContent).toBe('Neste orçamento sobram R$ 2.100,00 de lucro, que é 50,00% do preço.')
    expect(screen.getByRole('status').textContent).toBe('Está bom: você quer pelo menos 40,00% de lucro.')
    expect(screen.getByRole('status').className).not.toContain('alerta')
  })

  it('sem mínimo definido: mostra o lucro, não avisa e convida a definir em Minha marcenaria', () => {
    mostrar(semMinimo)
    expect(screen.getByText(/Neste orçamento sobram/).textContent).toContain('R$ 2.100,00')
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByRole('link', { name: 'Minha marcenaria' }).getAttribute('href')).toBe('/minha-marcenaria')
  })

  it('orçamento sem itens: pede os itens, sem aviso', () => {
    mostrar(null)
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText(/Inclua os itens/)).toBeTruthy()
  })
})
