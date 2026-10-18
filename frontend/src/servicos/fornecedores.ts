import { requisitar } from './api'
import type { Situacao } from './catalogo'

// Fornecedores (RF49, spec 020): onde você compra os materiais. Só o nome é obrigatório.
// `padrao`: o fornecedor que já vem escolhido no material novo (RF53). Só um por marcenaria.
export type Fornecedor = { id: string; nome: string; telefone: string | null; endereco: string | null; ativo: boolean; padrao: boolean }
export type DadosFornecedor = { nome: string; telefone?: string; endereco?: string }

const consulta = (busca: string, situacao: Situacao) => `?${new URLSearchParams({ busca, situacao })}`

export const listarFornecedores = (busca: string, situacao: Situacao) => requisitar<Fornecedor[]>(`/fornecedores${consulta(busca, situacao)}`)
export const criarFornecedor = (dados: DadosFornecedor) => requisitar<Fornecedor>('/fornecedores', 'POST', dados)
export const editarFornecedor = (id: string, dados: DadosFornecedor) => requisitar<Fornecedor>(`/fornecedores/${id}`, 'PUT', dados)
export const inativarFornecedor = (id: string) => requisitar<void>(`/fornecedores/${id}`, 'DELETE')
export const reativarFornecedor = (id: string) => requisitar<void>(`/fornecedores/${id}/reativar`, 'POST')
export const usarComoPadrao = (id: string) => requisitar<void>(`/fornecedores/${id}/padrao`, 'POST')
export const tirarPadrao = () => requisitar<void>('/fornecedores/padrao', 'DELETE')
