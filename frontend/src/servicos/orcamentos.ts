import { requisitar } from './api'

// O frontend só envia alterações e exibe o que a API devolveu (AGENTS §4.1, D005, D019).
// Todo valor chega como texto decimal ("2760.00") e continua texto: nada aqui soma, multiplica ou arredonda.

export type ModoLucro = 'margem' | 'markup'
export type RegraArredondamento = 'duas_casas' | 'real_inteiro' | 'dezena'
export type TipoItem = 'material' | 'servico'

export type Cabecalho = {
  clienteNome: string
  descricaoProjeto: string
  dataEmissao: string
  dataValidade: string
  modoLucro?: ModoLucro
  percentualLucro?: string
  regraArredondamento?: RegraArredondamento
}

export type Item = {
  id: string; tipo: TipoItem; descricao: string; unidade: string
  quantidade: string; valorUnitario: string; valorLinha: string; valorAjustadoManualmente: boolean
}

export type Memorial = {
  subtotalMateriais: string; subtotalServicos: string; totalAdicionais: string; custoDiretoTotal: string
  valorLucro: string; multiplicadorEquivalente: string | null; ajusteArredondamento: string; precoFinal: string
}

export type Orcamento = Required<Cabecalho> & {
  id: string
  situacao: string
  itens: Item[]
  custosAdicionais: { id: string; descricao: string; valor: string }[]
  memorial: Memorial
}

export type NovoItem =
  | { origem: 'catalogo'; tipo: TipoItem; catalogoId: string; quantidade: string }
  | { origem: 'avulso'; tipo: TipoItem; descricao: string; unidade: string; quantidade: string; valorUnitario: string }

const rota = (id: string, resto = '') => `/orcamentos/${id}${resto}`

export const criarOrcamento = (dados: Cabecalho) => requisitar<Orcamento>('/orcamentos', 'POST', dados)
export const consultarOrcamento = (id: string) => requisitar<Orcamento>(rota(id))
export const alterarCabecalho = (id: string, dados: Cabecalho) => requisitar<Orcamento>(rota(id), 'PUT', dados)
export const adicionarItem = (id: string, item: NovoItem) => requisitar<Orcamento>(rota(id, '/itens'), 'POST', item)
export const alterarItem = (id: string, itemId: string, quantidade: string, valorUnitario: string) =>
  requisitar<Orcamento>(rota(id, `/itens/${itemId}`), 'PUT', { quantidade, valorUnitario })
export const removerItem = (id: string, itemId: string) => requisitar<Orcamento>(rota(id, `/itens/${itemId}`), 'DELETE')
export const adicionarCustoAdicional = (id: string, descricao: string, valor: string) =>
  requisitar<Orcamento>(rota(id, '/custos-adicionais'), 'POST', { descricao, valor })
export const removerCustoAdicional = (id: string, custoId: string) =>
  requisitar<Orcamento>(rota(id, `/custos-adicionais/${custoId}`), 'DELETE')

// ---------- Exibição (só texto) ----------

// "2760.00" → "R$ 2.760,00" (AGENTS §8). Separa milhares com expressão regular sobre os dígitos.
export function exibirMoeda(valor: string): string {
  const [inteiro, decimal = '00'] = valor.split('.')
  const sinal = inteiro.startsWith('-') ? '-' : ''
  const milhares = inteiro.replace('-', '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sinal}R$ ${milhares},${decimal}`
}

// "2.500" → "2,5"; "30.000" → "30". Remove só zeros à direita do texto.
export const exibirNumero = (valor: string) => (valor.includes('.') ? valor.replace(/\.?0+$/, '') : valor).replace('.', ',')

// "150.00" → "150,00" para preencher campos de formulário.
export const paraCampo = (valor: string) => valor.replace('.', ',')

// Data de hoje no fuso do navegador, em AAAA-MM-DD (toISOString usaria UTC e poderia dar o dia seguinte à noite).
export function hojeLocal(): string {
  const agora = new Date()
  const doisDigitos = (n: number) => String(n).padStart(2, '0')
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`
}
