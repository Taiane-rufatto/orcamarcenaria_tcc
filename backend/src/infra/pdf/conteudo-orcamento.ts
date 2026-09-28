import { valorPorExtenso } from './extenso'

// Conteúdo do PDF do orçamento (RF41, RF42, D022, D023): função pura, testável sem abrir o PDF.
// Recebe apenas o que pode aparecer para o cliente. Custos, valores por item, subtotais, lucro e
// percentual nem entram aqui, então não há como vazarem no documento (RF42).

export interface DadosPdf {
  numero: number
  descricaoProjeto: string
  dataEmissao: string // AAAA-MM-DD
  dataValidade: string
  observacoes: string
  precoFinal: string // texto decimal gravado pelo domínio (D019), ex.: "2760.00"
  itens: { descricao: string; quantidade: string; unidade: string }[]
  cliente: { nome: string; telefone: string | null; email: string | null; endereco: string | null }
  marcenaria: { nome: string; responsavel: string }
}

export interface ConteudoPdf {
  nomeArquivo: string
  titulo: string
  marcenaria: string[]
  cliente: string[]
  datas: { rotulo: string; valor: string }[]
  projeto: string
  itens: { descricao: string; quantidade: string }[] | null // nulo em "apenas o preço final"
  precoFinal: string
  precoPorExtenso: string
  observacoes: string | null
  rodape: string
}

// Formatação só sobre o texto (AGENTS §8), como no frontend.
const data = (valor: string) => valor.split('-').reverse().join('/')
const quantidade = (valor: string) => (valor.includes('.') ? valor.replace(/\.?0+$/, '') : valor).replace('.', ',')
function moeda(valor: string): string {
  const [inteiro, decimal] = valor.split('.')
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimal}`
}

export function montarConteudoPdf(dados: DadosPdf, mostrarItens: boolean): ConteudoPdf {
  const { cliente } = dados
  return {
    nomeArquivo: `orcamento-${dados.numero}.pdf`,
    titulo: `Orçamento nº ${dados.numero}`,
    marcenaria: [dados.marcenaria.nome, `Responsável: ${dados.marcenaria.responsavel}`],
    cliente: [
      cliente.nome,
      ...(cliente.telefone ? [`Telefone: ${cliente.telefone}`] : []),
      ...(cliente.email ? [`E-mail: ${cliente.email}`] : []),
      ...(cliente.endereco ? [`Endereço: ${cliente.endereco}`] : []),
    ],
    datas: [
      { rotulo: 'Emissão', valor: data(dados.dataEmissao) },
      { rotulo: 'Válido até', valor: data(dados.dataValidade) },
    ],
    projeto: dados.descricaoProjeto,
    itens: mostrarItens
      ? dados.itens.map((item) => ({ descricao: item.descricao, quantidade: `${quantidade(item.quantidade)} ${item.unidade}` }))
      : null,
    precoFinal: moeda(dados.precoFinal),
    precoPorExtenso: valorPorExtenso(dados.precoFinal),
    observacoes: dados.observacoes.trim() || null,
    rodape: `Proposta válida até ${data(dados.dataValidade)}.`,
  }
}
