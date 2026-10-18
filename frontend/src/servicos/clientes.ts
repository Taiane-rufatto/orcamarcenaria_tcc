import { requisitar } from './api'
import type { Situacao } from './catalogo'

// `documento` (spec 022, RF54): CPF ou CNPJ opcional, guardado só com os dígitos.
export type Cliente = { id: string; nome: string; telefone: string | null; email: string | null; endereco: string | null; documento: string | null; ativo: boolean }
export type DadosCliente = { nome: string; telefone?: string; email?: string; endereco?: string; documento?: string }

// Só exibição: 11 dígitos viram 000.000.000-00 (CPF) e 14 viram 00.000.000/0000-00 (CNPJ). Nenhuma validação aqui; ela é da API.
export function exibirDocumento(digitos: string): string {
  if (digitos.length === 11) return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  if (digitos.length === 14) return digitos.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return digitos
}

const consulta = (busca: string, situacao: Situacao) => `?${new URLSearchParams({ busca, situacao })}`

export const listarClientes = (busca: string, situacao: Situacao) => requisitar<Cliente[]>(`/clientes${consulta(busca, situacao)}`)
export const criarCliente = (dados: DadosCliente) => requisitar<Cliente>('/clientes', 'POST', dados)
export const editarCliente = (id: string, dados: DadosCliente) => requisitar<Cliente>(`/clientes/${id}`, 'PUT', dados)
export const inativarCliente = (id: string) => requisitar<void>(`/clientes/${id}`, 'DELETE')
export const reativarCliente = (id: string) => requisitar<void>(`/clientes/${id}/reativar`, 'POST')
