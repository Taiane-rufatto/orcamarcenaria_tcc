import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Painel } from './Painel'
import type { PainelDoMes } from '../servicos/painel'

// Valores fictícios das specs 019 e 024, exatamente como a API devolve: nada é calculado na tela.
const consultar = vi.hoisted(() => vi.fn())
vi.mock('../servicos/painel', () => ({ consultarPainel: consultar }))

const outubro: PainelDoMes = {
  mes: '2026-10', rascunhos: 1, enviados: 5, aguardando: 1, recusados: 1, vencidos: 1,
  aprovados: { quantidade: 2, valor: '6960.00', lucro: '2928.90', percentualDoPreco: '42.08', emProducao: 1, entregues: 0 },
  taxaDeAprovacao: '40.00',
  meta: { meta: '10000.00', aprovado: '6960.00', percentual: '69.60', falta: '3040.00', atingida: false },
  cobranca: {
    maoDeObra: '1490.00', percentualDoPreco: '21.41', valorMedioDaHora: '55.00', valorMedioDaHoraNoMesAnterior: '50.00',
    variacaoDaHora: { percentual: '10.00', tendencia: 'subindo' },
  },
  precos: [
    { materialId: 'a', nome: 'MDF BRANCO', usos: 5, custoAtual: '313.0900', custoAnterior: '289.9000', variacao: { percentual: '8.00', tendencia: 'subindo' } },
    { materialId: 'b', nome: 'FITA DE BORDA', usos: 1, custoAtual: '10.0000', custoAnterior: '10.0000', variacao: { percentual: '0.00', tendencia: 'estavel' } },
    { materialId: 'c', nome: 'COLA', usos: 2, custoAtual: '45.0000', custoAnterior: '50.0000', variacao: { percentual: '-10.00', tendencia: 'caindo' } },
  ],
}

const mostrar = () => render(<MemoryRouter><Painel /></MemoryRouter>)

describe('Painel do mês (RF47, RF48 e RF60 a RF63)', () => {
  afterEach(() => { cleanup(); consultar.mockReset() })

  it('mostra aprovação, o que entrou e as linhas por situação, com os valores da API', async () => {
    consultar.mockResolvedValue(outubro)
    mostrar()
    await waitFor(() => expect(screen.getByText(/orçamentos enviados foram aprovados/)).toBeTruthy())

    expect(screen.getByText(/orçamentos enviados foram aprovados/).textContent).toBe('2 de 5 orçamentos enviados foram aprovados (40,00%).')
    expect(screen.getByText(/em orçamentos, com/).textContent).toBe('Você aprovou R$ 6.960,00 em orçamentos, com R$ 2.928,90 de lucro (42,08% do preço).')
    const linhas = screen.getAllByRole('term').map((t) => `${t.textContent} ${t.nextElementSibling?.textContent}`)
    expect(linhas).toEqual([
      'Aprovados (com os em produção e entregues) 2', 'Em produção 1', 'Entregues 0', 'Recusados 1',
      'Vencidos, sem resposta 1', 'Esperando resposta 1', 'Rascunhos (ainda não enviados) 1',
    ])
    expect(screen.getByText(/outubro de 2026/)).toBeTruthy()
  })

  it('meta: mostra o quanto foi aprovado e quanto falta; batida, diz que bateu; sem meta, convida a definir', async () => {
    consultar.mockResolvedValue(outubro)
    mostrar()
    await waitFor(() => expect(screen.getByText(/Sua meta é/)).toBeTruthy())
    expect(screen.getByText(/Sua meta é/).textContent).toBe('Sua meta é R$ 10.000,00. Você aprovou R$ 6.960,00 (69,60%). Faltam R$ 3.040,00.')
    cleanup()

    consultar.mockResolvedValue({ ...outubro, meta: { meta: '4000.00', aprovado: '6960.00', percentual: '174.00', falta: '0.00', atingida: true } })
    mostrar()
    await waitFor(() => expect(screen.getByText(/Meta batida!/)).toBeTruthy())
    cleanup()

    consultar.mockResolvedValue({ ...outubro, meta: null })
    mostrar()
    await waitFor(() => expect(screen.getByRole('link', { name: 'Minha marcenaria' }).getAttribute('href')).toBe('/minha-marcenaria'))
  })

  it('mão de obra: soma, participação no preço e variação da hora contra o mês anterior', async () => {
    consultar.mockResolvedValue(outubro)
    mostrar()
    await waitFor(() => expect(screen.getByText(/A mão de obra somou/)).toBeTruthy())
    expect(screen.getByText(/A mão de obra somou/).textContent).toBe('A mão de obra somou R$ 1.490,00, que é 21,41% do preço dos orçamentos enviados.')
    expect(screen.getByText(/valor médio da sua hora de serviço/).textContent)
      .toBe('O valor médio da sua hora de serviço foi R$ 55,00 (no mês anterior foi R$ 50,00: subiu 10,00%).')
  })

  it('sem serviço por hora no mês, avisa em vez de mostrar valor da hora', async () => {
    consultar.mockResolvedValue({ ...outubro, cobranca: { ...outubro.cobranca, valorMedioDaHora: null, variacaoDaHora: null } })
    mostrar()
    await waitFor(() => expect(screen.getByText(/Nenhum serviço cobrado por hora/)).toBeTruthy())
  })

  it('preços dos materiais: subindo, estável e caindo, com os valores de antes e de agora', async () => {
    consultar.mockResolvedValue(outubro)
    mostrar()
    await waitFor(() => expect(screen.getByText('MDF BRANCO')).toBeTruthy())
    const itens = screen.getAllByRole('listitem').map((li) => li.textContent)
    expect(itens).toEqual([
      'MDF BRANCO · usado em 5 orçamentos · subindo 8,00% (de R$ 289,90 para R$ 313,09)',
      'FITA DE BORDA · usado em 1 orçamento · estável',
      'COLA · usado em 2 orçamentos · caindo 10,00% (de R$ 50,00 para R$ 45,00)',
    ])
  })

  it('mês sem envios: avisa que não há orçamento enviado e cita os rascunhos', async () => {
    consultar.mockResolvedValue({
      ...outubro, enviados: 0, aguardando: 0, recusados: 0, vencidos: 0, rascunhos: 2, taxaDeAprovacao: null, precos: [],
      aprovados: { quantidade: 0, valor: '0.00', lucro: '0.00', percentualDoPreco: null, emProducao: 0, entregues: 0 },
    })
    mostrar()
    await waitFor(() => expect(screen.getByText(/Nenhum orçamento enviado neste mês/)).toBeTruthy())
    expect(screen.getByText(/Você tem 2 em rascunho/)).toBeTruthy()
    expect(screen.queryByText(/foram aprovados/)).toBeNull()
  })

  it('mostra o erro da API em vez de números', async () => {
    consultar.mockRejectedValue(new Error('Informe o mês no formato AAAA-MM'))
    mostrar()
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Informe o mês no formato AAAA-MM'))
  })
})
