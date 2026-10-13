import { requisitar } from './api'
import type { ModoLucro, RegraArredondamento } from './orcamentos'

// Configuração da marcenaria (RF05, RF19–RF22, D024). Vale só para orçamentos novos.
export type DadosMarcenaria = {
  nome: string; responsavel: string; telefone: string | null; email: string | null; cnpj: string | null; endereco: string | null
}
export type Padroes = {
  modoLucro: ModoLucro; percentualLucro: string; regraArredondamento: RegraArredondamento; validadeDias: number
}
// Spec 018: meta e horas do aviso de equilíbrio. O valor necessário por hora vem da API.
export type Equilibrio = { metaMensal: string | null; horasProdutivasMes: string | null; necessarioPorHora: string | null }
export type Configuracao = {
  marcenaria: DadosMarcenaria
  equilibrio: Equilibrio
  padroes: Padroes & { multiplicadorEquivalente: string | null } // calculado pelo servidor (D018)
}

export const obterConfiguracao = () => requisitar<Configuracao>('/configuracoes')
export const salvarDadosMarcenaria = (dados: Record<string, string>) => requisitar<Configuracao>('/configuracoes/marcenaria', 'PUT', dados)
export const salvarPadroes = (padroes: Padroes) => requisitar<Configuracao>('/configuracoes/padroes', 'PUT', padroes)
export const salvarEquilibrio = (dados: { metaMensal: string; horasProdutivasMes: string }) =>
  requisitar<Configuracao>('/configuracoes/equilibrio', 'PUT', dados)
