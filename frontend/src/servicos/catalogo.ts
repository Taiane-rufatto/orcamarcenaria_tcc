import { requisitar } from './api'

export type Situacao = 'ativos' | 'inativos' | 'todos'
// Spec 020: fornecedor do preço e há quantos dias o preço foi atualizado; `preco_antigo` vem decidido pela API (mais de 30 dias).
export type Material = {
  id: string; nome: string; descricao: string | null; unidade: string; custo_unitario: string; ativo: boolean
  fornecedor_id: string | null; fornecedor_nome: string | null; dias_desde_atualizacao: number; preco_antigo: boolean
}
export type LinhaHistorico = { custo_unitario: string; fornecedor_nome: string | null; registrado_em: string }
export type Servico = { id: string; nome: string; descricao: string | null; tipo_cobranca: 'hora' | 'unidade'; valor_unitario: string; ativo: boolean }
export type DadosMaterial = { nome: string; descricao?: string; unidade: string; custoUnitario: string; fornecedorId?: string }
export type DadosServico = { nome: string; descricao?: string; tipoCobranca: string; valorUnitario: string }

const consulta = (busca: string, situacao: Situacao) => `?${new URLSearchParams({ busca, situacao })}`

export const listarMateriais = (busca: string, situacao: Situacao) => requisitar<Material[]>(`/materiais${consulta(busca, situacao)}`)
export const criarMaterial = (dados: DadosMaterial) => requisitar<Material>('/materiais', 'POST', dados)
export const editarMaterial = (id: string, dados: DadosMaterial) => requisitar<Material>(`/materiais/${id}`, 'PUT', dados)
export const inativarMaterial = (id: string) => requisitar<void>(`/materiais/${id}`, 'DELETE')
export const reativarMaterial = (id: string) => requisitar<void>(`/materiais/${id}/reativar`, 'POST')
export const confirmarPrecoMaterial = (id: string) => requisitar<Material>(`/materiais/${id}/confirmar-preco`, 'POST')
export const historicoMaterial = (id: string) => requisitar<LinhaHistorico[]>(`/materiais/${id}/historico`)

export const listarServicos = (busca: string, situacao: Situacao) => requisitar<Servico[]>(`/servicos${consulta(busca, situacao)}`)
export const criarServico = (dados: DadosServico) => requisitar<Servico>('/servicos', 'POST', dados)
export const editarServico = (id: string, dados: DadosServico) => requisitar<Servico>(`/servicos/${id}`, 'PUT', dados)
export const inativarServico = (id: string) => requisitar<void>(`/servicos/${id}`, 'DELETE')
export const reativarServico = (id: string) => requisitar<void>(`/servicos/${id}/reativar`, 'POST')

// Apenas exibição: o valor chega da API como texto decimal ("1.2350") e só troca o separador.
// Nenhum cálculo é feito aqui (AGENTS §4.1).
export const exibirValor = (valor: string) => `R$ ${valor.replace('.', ',')}`
