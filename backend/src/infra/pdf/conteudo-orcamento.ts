import { valorPorExtenso } from './extenso'

// Conteúdo do PDF do orçamento (RF41, RF42, D022, D023): função pura, testável sem abrir o PDF.
// Recebe apenas o que pode aparecer para o cliente. Custos, valores por item, subtotais, lucro e
// percentual nem entram aqui, então não há como vazarem no documento (RF42).

export interface DadosPdf {
  numero: number
  descricaoProjeto: string
  dataEmissao: string // AAAA-MM-DD
  dataValidade: string
  especificacoes: string
  observacoes: string
  precoFinal: string // texto decimal gravado pelo domínio (D019), ex.: "2760.00"
  itens: { descricao: string; quantidade: string; unidade: string }[]
  cliente: { nome: string; telefone: string | null; email: string | null; endereco: string | null }
  marcenaria: { nome: string; responsavel: string; telefone: string | null; email: string | null; cnpj: string | null; endereco: string | null }
}

export interface ConteudoPdf {
  nomeArquivo: string
  titulo: string
  marcenaria: string[]
  cliente: string[]
  datas: { rotulo: string; valor: string }[]
  projeto: string
  // Especificações no formato do modelo do proprietário: introdução + linhas do texto digitado.
  especificacoes: { introducao: string; linhas: LinhaEspecificacao[] } | null
  itens: { descricao: string; quantidade: string }[] | null // nulo em "apenas o preço final"
  precoFinal: string
  precoPorExtenso: string
  observacoes: string | null
  rodape: string
}

export type LinhaEspecificacao =
  | { tipo: 'marcador'; texto: string } // linha iniciada por "-", "*" ou "•"
  | { tipo: 'subtitulo'; texto: string } // linha terminada em ":" (ex.: "Ferragens e acabamentos:")
  | { tipo: 'texto'; texto: string }
  | { tipo: 'espaco' } // linha em branco

// Interpreta o texto digitado: marcadores, subtítulos e parágrafos, sem exigir nenhuma formatação especial.
export function lerEspecificacoes(texto: string): LinhaEspecificacao[] {
  const linhas = texto.replace(/\r/g, '').split('\n').map((linha) => linha.trim())
  while (linhas.length && !linhas[0]) linhas.shift()
  while (linhas.length && !linhas[linhas.length - 1]) linhas.pop()
  return linhas.map((linha): LinhaEspecificacao => {
    if (!linha) return { tipo: 'espaco' }
    const marcador = /^[-*•]\s*(.+)$/.exec(linha)
    if (marcador) return { tipo: 'marcador', texto: marcador[1] }
    if (linha.endsWith(':')) return { tipo: 'subtitulo', texto: linha }
    return { tipo: 'texto', texto: linha }
  })
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
    // RF05: contatos da marcenaria só quando preenchidos na configuração (D024).
    marcenaria: [
      dados.marcenaria.nome,
      `Responsável: ${dados.marcenaria.responsavel}`,
      ...(dados.marcenaria.cnpj ? [`CNPJ: ${dados.marcenaria.cnpj}`] : []),
      ...[dados.marcenaria.telefone, dados.marcenaria.email].filter(Boolean).length
        ? [[dados.marcenaria.telefone, dados.marcenaria.email].filter(Boolean).join(' · ')] : [],
      ...(dados.marcenaria.endereco ? [dados.marcenaria.endereco] : []),
    ],
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
    especificacoes: dados.especificacoes.trim()
      ? { introducao: `Orçamento referente a ${dados.descricaoProjeto}, estando incluídos os seguintes itens:`, linhas: lerEspecificacoes(dados.especificacoes) }
      : null,
    itens: mostrarItens
      ? dados.itens.map((item) => ({ descricao: item.descricao, quantidade: `${quantidade(item.quantidade)} ${item.unidade}` }))
      : null,
    precoFinal: moeda(dados.precoFinal),
    precoPorExtenso: valorPorExtenso(dados.precoFinal),
    observacoes: dados.observacoes.trim() || null,
    rodape: `Proposta válida até ${data(dados.dataValidade)}.`,
  }
}
