import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarOrcamentos, textoDosMateriais } from './orcamentos'

const requisitar = vi.hoisted(() => vi.fn())
vi.mock('./api', () => ({ requisitar, baixarArquivo: vi.fn() }))

// Spec 029: dados fictícios, no formato em que a API devolve os itens do orçamento.
describe('textoDosMateriais', () => {
  const itens = [
    { tipo: 'material' as const, descricao: 'CORREDIÇA', quantidade: '2.000', unidade: 'pç' },
    { tipo: 'servico' as const, descricao: 'MONTAGEM', quantidade: '8.000', unidade: 'h' },
    { tipo: 'material' as const, descricao: 'FITA DE BORDA', quantidade: '3.000', unidade: 'm' },
  ]

  it('lista só os materiais, com quantidade e unidade, sem fornecedor nem valores', () => {
    expect(textoDosMateriais('Armário de cozinha', itens)).toBe(
      'Lista de compras · Armário de cozinha\n- 2 pç CORREDIÇA\n- 3 m FITA DE BORDA',
    )
  })

  it('devolve vazio quando não há material (serviço não se compra)', () => {
    expect(textoDosMateriais('Armário', [itens[1]])).toBe('')
    expect(textoDosMateriais('Armário', [])).toBe('')
  })
})

describe('listarOrcamentos — filtro de situação', () => {
  beforeEach(() => { requisitar.mockReset(); requisitar.mockResolvedValue([]) })

  it('envia as situações marcadas separadas por vírgula; nenhuma marcada vai vazia (todas)', async () => {
    await listarOrcamentos({ busca: '', situacao: ['aprovado', 'em_producao'], de: '', ate: '' })
    expect(requisitar.mock.calls[0][0]).toContain('situacao=aprovado%2Cem_producao')
    await listarOrcamentos({ busca: '', situacao: [], de: '', ate: '' })
    expect(requisitar.mock.calls[1][0]).toContain('situacao=&')
  })
})
