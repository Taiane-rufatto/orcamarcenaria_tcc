import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AvisoEquilibrio } from './AvisoEquilibrio'

// Valores fictícios da spec 018, exatamente como a API devolve: nada é calculado na tela.
const abaixo = { contribuicao: '2900.00', valorPorHora: '36.25', necessarioPorHora: '50.00', abaixoDoNecessario: true }
const acima = { contribuicao: '2900.00', valorPorHora: '72.50', necessarioPorHora: '50.00', abaixoDoNecessario: false }

const mostrar = (equilibrio: Parameters<typeof AvisoEquilibrio>[0]['equilibrio'], horas: string | null) =>
  render(<MemoryRouter><AvisoEquilibrio equilibrio={equilibrio} horasEstimadas={horas} /></MemoryRouter>)

describe('AvisoEquilibrio (RF46)', () => {
  afterEach(cleanup)

  it('abaixo do necessário: mostra os três valores da API e avisa, sem bloquear', () => {
    mostrar(abaixo, '80')
    const linhas = screen.getAllByRole('term').map((t) => `${t.textContent} ${t.nextElementSibling?.textContent}`)
    expect(linhas).toEqual([
      'Sobra após materiais e custos adicionais R$ 2.900,00',
      'Este orçamento rende por hora R$ 36,25',
      'Você precisa por hora R$ 50,00',
    ])
    expect(screen.getByRole('status').textContent).toContain('abaixo do que você precisa')
    expect(screen.getByRole('status').className).toContain('alerta')
  })

  it('acima do necessário: confirma sem alarme', () => {
    mostrar(acima, '40')
    expect(screen.getByRole('status').textContent).toContain('cobre o que você precisa')
    expect(screen.getByRole('status').className).not.toContain('alerta')
  })

  it('sem horas estimadas: pede as horas e aponta para a meta, sem aviso', () => {
    mostrar(null, null)
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText(/Informe as horas estimadas/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Minha marcenaria' }).getAttribute('href')).toBe('/minha-marcenaria')
  })

  it('com horas mas sem meta: pede a meta, sem aviso', () => {
    mostrar(null, '40.00')
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText(/Falta a meta do mês/)).toBeTruthy()
  })
})
