import { describe, expect, it } from 'vitest'
import { montarConteudoPdf, type DadosPdf } from '../../src/infra/pdf/conteudo-orcamento'

// CT03 (regras-de-calculo.md §4) registrado como nº 7, com dados fictícios.
const ct03: DadosPdf = {
  numero: 7,
  descricaoProjeto: 'Armário de cozinha',
  dataEmissao: '2026-10-01',
  dataValidade: '2026-10-31',
  observacoes: 'Entrega em 20 dias úteis.',
  precoFinal: '2760.00',
  itens: [
    { descricao: 'MDF branco 18 mm', quantidade: '2.500', unidade: 'ch' },
    { descricao: 'Fita de borda 22 mm', quantidade: '30.000', unidade: 'm' },
    { descricao: 'Corrediça telescópica 450 mm', quantidade: '6.000', unidade: 'un' },
    { descricao: 'Dobradiça com amortecedor', quantidade: '12.000', unidade: 'un' },
    { descricao: 'Corte e usinagem', quantidade: '8.000', unidade: 'h' },
    { descricao: 'Montagem e instalação', quantidade: '6.000', unidade: 'h' },
  ],
  cliente: { nome: 'Cliente Fictício', telefone: '(45) 90000-0000', email: null, endereco: 'Rua Fictícia, 10' },
  marcenaria: { nome: 'Marcenaria Exemplo', responsavel: 'Responsável Fictício' },
}

// Tudo o que o CT03 tem de interno: valores unitários, de linha, subtotais, custo, lucro, ajuste e percentual.
const PROIBIDOS = [
  '289,90', '1,2350', '34,50', '8,90', '45,00', '55,00',
  '724,75', '37,05', '207,00', '106,80', '360,00', '330,00',
  '1.075,60', '690,00', '165,50', '1.931,10', '2.758,71', '827,61', '1,29', '30,00',
  '%', 'markup', 'margem', 'lucro', 'custo', 'multiplic', 'subtotal',
]
const textoCompleto = (mostrarItens: boolean) => JSON.stringify(montarConteudoPdf(ct03, mostrarItens)).toLowerCase()

describe('conteúdo do PDF (RF41, RF42, D022)', () => {
  it('traz tudo o que o RF41 pede', () => {
    expect(montarConteudoPdf(ct03, true)).toEqual({
      nomeArquivo: 'orcamento-7.pdf',
      titulo: 'Orçamento nº 7',
      marcenaria: ['Marcenaria Exemplo', 'Responsável: Responsável Fictício'],
      cliente: ['Cliente Fictício', 'Telefone: (45) 90000-0000', 'Endereço: Rua Fictícia, 10'],
      datas: [{ rotulo: 'Emissão', valor: '01/10/2026' }, { rotulo: 'Válido até', valor: '31/10/2026' }],
      projeto: 'Armário de cozinha',
      itens: [
        { descricao: 'MDF branco 18 mm', quantidade: '2,5 ch' },
        { descricao: 'Fita de borda 22 mm', quantidade: '30 m' },
        { descricao: 'Corrediça telescópica 450 mm', quantidade: '6 un' },
        { descricao: 'Dobradiça com amortecedor', quantidade: '12 un' },
        { descricao: 'Corte e usinagem', quantidade: '8 h' },
        { descricao: 'Montagem e instalação', quantidade: '6 h' },
      ],
      precoFinal: 'R$ 2.760,00',
      precoPorExtenso: 'dois mil, setecentos e sessenta reais',
      observacoes: 'Entrega em 20 dias úteis.',
      rodape: 'Proposta válida até 31/10/2026.',
    })
  })

  it('"apenas o preço final" omite a lista de itens', () => {
    const conteudo = montarConteudoPdf(ct03, false)
    expect(conteudo.itens).toBeNull()
    expect(conteudo.precoFinal).toBe('R$ 2.760,00')
  })

  it.each([true, false])('com itens = %s, não revela custo, lucro nem percentual', (mostrarItens) => {
    const texto = textoCompleto(mostrarItens)
    for (const proibido of PROIBIDOS) expect(texto, proibido).not.toContain(proibido.toLowerCase())
  })

  it('omite observações vazias e contatos ausentes', () => {
    const conteudo = montarConteudoPdf({ ...ct03, observacoes: '  ', cliente: { nome: 'Só Nome', telefone: null, email: null, endereco: null } }, true)
    expect(conteudo.observacoes).toBeNull()
    expect(conteudo.cliente).toEqual(['Só Nome'])
  })
})
