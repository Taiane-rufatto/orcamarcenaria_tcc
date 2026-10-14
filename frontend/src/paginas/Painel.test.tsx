import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Painel } from './Painel'
import type { PainelDoMes } from '../servicos/painel'

// Valores fictícios da spec 019, exatamente como a API devolve: nada é calculado na tela.
const consultar = vi.hoisted(() => vi.fn())
vi.mock('../servicos/painel', () => ({ consultarPainel: consultar }))

const outubro: PainelDoMes = {
  mes: '2026-10', rascunhos: 1, enviados: 5, aguardando: 1, recusados: 1, vencidos: 1,
  aprovados: { quantidade: 2, valor: '6960.00', lucro: '2928.90', percentualDoPreco: '42.08' },
  taxaDeAprovacao: '40.00',
}

describe('Painel do mês (RF47, RF48)', () => {
  afterEach(() => { cleanup(); consultar.mockReset() })

  it('mostra a aprovação e o que entrou em frases simples, com os valores da API', async () => {
    consultar.mockResolvedValue(outubro)
    render(<Painel />)
    await waitFor(() => expect(screen.getByText(/orçamentos enviados foram aprovados/)).toBeTruthy())

    expect(screen.getByText(/orçamentos enviados foram aprovados/).textContent).toBe('2 de 5 orçamentos enviados foram aprovados (40,00%).')
    expect(screen.getByText(/Você aprovou/).textContent).toBe('Você aprovou R$ 6.960,00 em orçamentos, com R$ 2.928,90 de lucro (42,08% do preço).')
    const linhas = screen.getAllByRole('term').map((t) => `${t.textContent} ${t.nextElementSibling?.textContent}`)
    expect(linhas).toEqual([
      'Aprovados 2', 'Recusados 1', 'Vencidos, sem resposta 1', 'Esperando resposta 1', 'Rascunhos (ainda não enviados) 1',
    ])
    expect(screen.getByText(/outubro de 2026/)).toBeTruthy()
  })

  it('mês sem envios: avisa que não há orçamento enviado e cita os rascunhos', async () => {
    consultar.mockResolvedValue({ ...outubro, enviados: 0, aguardando: 0, recusados: 0, vencidos: 0, rascunhos: 2, taxaDeAprovacao: null,
      aprovados: { quantidade: 0, valor: '0.00', lucro: '0.00', percentualDoPreco: null } })
    render(<Painel />)
    await waitFor(() => expect(screen.getByText(/Nenhum orçamento enviado neste mês/)).toBeTruthy())
    expect(screen.getByText(/Você tem 2 em rascunho/)).toBeTruthy()
    expect(screen.queryByText(/foram aprovados/)).toBeNull()
  })

  it('mostra o erro da API em vez de números', async () => {
    consultar.mockRejectedValue(new Error('Informe o mês no formato AAAA-MM'))
    render(<Painel />)
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Informe o mês no formato AAAA-MM'))
  })
})
