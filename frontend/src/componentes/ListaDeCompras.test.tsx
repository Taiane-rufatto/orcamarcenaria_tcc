import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ListaDeCompras } from './ListaDeCompras'
import { textoDaLista, type GrupoDeCompra } from '../servicos/orcamentos'

// Valores fictícios da spec 023, exatamente como a API devolve. Só quantidades: nenhum valor aparece.
const consultar = vi.hoisted(() => vi.fn())
vi.mock('../servicos/orcamentos', async (original) => ({ ...(await original<object>()), listaDeCompras: consultar }))

const grupos: GrupoDeCompra[] = [
  { fornecedor: { id: 'a', nome: 'MADEIREIRA CENTRAL', telefone: '(45) 90000-0002', endereco: 'Rua Fictícia, 100' },
    itens: [{ descricao: 'MDF BRANCO', quantidade: '2.500', unidade: 'ch' }, { descricao: 'FITA DE BORDA', quantidade: '30.000', unidade: 'm' }] },
  { fornecedor: null, itens: [{ descricao: 'COLA', quantidade: '1.000', unidade: 'un' }] },
]

describe('textoDaLista (RF58)', () => {
  it('um bloco por fornecedor e uma linha por material, pronto para colar no WhatsApp', () => {
    expect(textoDaLista(grupos)).toBe([
      'MADEIREIRA CENTRAL · (45) 90000-0002',
      '- 2,5 ch MDF BRANCO',
      '- 30 m FITA DE BORDA',
      '',
      'Sem fornecedor cadastrado',
      '- 1 un COLA',
    ].join('\n'))
  })
})

describe('ListaDeCompras (RF58)', () => {
  afterEach(() => { cleanup(); consultar.mockReset() })

  it('mostra os grupos com telefone e endereço e o botão de copiar', async () => {
    consultar.mockResolvedValue({ orcamentoId: 'o', grupos })
    render(<ListaDeCompras id="o" versao="1" />)
    await waitFor(() => expect(screen.getByText('MADEIREIRA CENTRAL')).toBeTruthy())
    expect(screen.getByText('(45) 90000-0002 · Rua Fictícia, 100')).toBeTruthy()
    expect(screen.getByText('2,5 ch · MDF BRANCO')).toBeTruthy()
    expect(screen.getByText('Sem fornecedor cadastrado')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Copiar lista' })).toBeTruthy()
  })

  it('sem materiais não mostra a seção', async () => {
    consultar.mockResolvedValue({ orcamentoId: 'o', grupos: [] })
    const { container } = render(<ListaDeCompras id="o" versao="1" />)
    await waitFor(() => expect(consultar).toHaveBeenCalled())
    expect(container.textContent).toBe('')
  })
})
