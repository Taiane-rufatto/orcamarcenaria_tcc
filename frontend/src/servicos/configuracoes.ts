import { requisitar } from './api'
import type { ModoLucro, RegraArredondamento } from './orcamentos'

// Configuração da marcenaria (RF05, RF19–RF22, D024). Vale só para orçamentos novos.
export type DadosMarcenaria = {
  nome: string; responsavel: string; telefone: string | null; email: string | null; cnpj: string | null; endereco: string | null
}
export type Padroes = {
  modoLucro: ModoLucro; percentualLucro: string; regraArredondamento: RegraArredondamento; validadeDias: number
}
export type Configuracao = {
  marcenaria: DadosMarcenaria
  padroes: Padroes & { multiplicadorEquivalente: string | null } // calculado pelo servidor (D018)
}

export const obterConfiguracao = () => requisitar<Configuracao>('/configuracoes')
export const salvarDadosMarcenaria = (dados: Record<string, string>) => requisitar<Configuracao>('/configuracoes/marcenaria', 'PUT', dados)
export const salvarPadroes = (padroes: Padroes) => requisitar<Configuracao>('/configuracoes/padroes', 'PUT', padroes)
