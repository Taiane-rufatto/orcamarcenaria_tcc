import { requisitar } from './api'
import type { Situacao } from './catalogo'

export type Cliente = { id: string; nome: string; telefone: string | null; email: string | null; endereco: string | null; ativo: boolean }
export type DadosCliente = { nome: string; telefone?: string; email?: string; endereco?: string }

const consulta = (busca: string, situacao: Situacao) => `?${new URLSearchParams({ busca, situacao })}`

export const listarClientes = (busca: string, situacao: Situacao) => requisitar<Cliente[]>(`/clientes${consulta(busca, situacao)}`)
export const criarCliente = (dados: DadosCliente) => requisitar<Cliente>('/clientes', 'POST', dados)
export const editarCliente = (id: string, dados: DadosCliente) => requisitar<Cliente>(`/clientes/${id}`, 'PUT', dados)
export const inativarCliente = (id: string) => requisitar<void>(`/clientes/${id}`, 'DELETE')
export const reativarCliente = (id: string) => requisitar<void>(`/clientes/${id}/reativar`, 'POST')
