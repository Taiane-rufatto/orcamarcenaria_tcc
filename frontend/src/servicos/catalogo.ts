import { tokenAtual } from './autenticacao'

const api = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export type Situacao = 'ativos' | 'inativos' | 'todos'
export type Material = { id: string; nome: string; descricao: string | null; unidade: string; custo_unitario: string; ativo: boolean }
export type Servico = { id: string; nome: string; descricao: string | null; tipo_cobranca: 'hora' | 'unidade'; valor_unitario: string; ativo: boolean }
export type DadosMaterial = { nome: string; descricao?: string; unidade: string; custoUnitario: string }
export type DadosServico = { nome: string; descricao?: string; tipoCobranca: string; valorUnitario: string }

async function requisitar<T>(rota: string, metodo = 'GET', corpo?: unknown): Promise<T> {
  const resposta = await fetch(`${api}${rota}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenAtual()}` },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  })
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => null) as { mensagem?: string } | null
    throw new Error(erro?.mensagem ?? `A API respondeu ${resposta.status}`)
  }
  return resposta.status === 204 ? undefined as T : resposta.json() as Promise<T>
}

const consulta = (busca: string, situacao: Situacao) => `?${new URLSearchParams({ busca, situacao })}`

export const listarMateriais = (busca: string, situacao: Situacao) => requisitar<Material[]>(`/materiais${consulta(busca, situacao)}`)
export const criarMaterial = (dados: DadosMaterial) => requisitar<Material>('/materiais', 'POST', dados)
export const editarMaterial = (id: string, dados: DadosMaterial) => requisitar<Material>(`/materiais/${id}`, 'PUT', dados)
export const inativarMaterial = (id: string) => requisitar<void>(`/materiais/${id}`, 'DELETE')

export const listarServicos = (busca: string, situacao: Situacao) => requisitar<Servico[]>(`/servicos${consulta(busca, situacao)}`)
export const criarServico = (dados: DadosServico) => requisitar<Servico>('/servicos', 'POST', dados)
export const editarServico = (id: string, dados: DadosServico) => requisitar<Servico>(`/servicos/${id}`, 'PUT', dados)
export const inativarServico = (id: string) => requisitar<void>(`/servicos/${id}`, 'DELETE')

// Apenas exibição: o valor chega da API como texto decimal ("1.2350") e só troca o separador.
// Nenhum cálculo é feito aqui (AGENTS §4.1).
export const exibirValor = (valor: string) => `R$ ${valor.replace('.', ',')}`
