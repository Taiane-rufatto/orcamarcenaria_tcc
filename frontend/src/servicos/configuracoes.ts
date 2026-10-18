import { requisitar } from './api'
import type { ModoLucro, RegraArredondamento } from './orcamentos'

// Configuração da marcenaria (RF05, RF19–RF22, D024). Vale só para orçamentos novos.
export type DadosMarcenaria = {
  nome: string; responsavel: string; telefone: string | null; email: string | null; cnpj: string | null; endereco: string | null
}
export type Padroes = {
  modoLucro: ModoLucro; percentualLucro: string; regraArredondamento: RegraArredondamento; validadeDias: number
}
// Spec 018: lucro mínimo (% do preço de venda) que a marcenaria aceita. Opcional.
export type Configuracao = {
  marcenaria: DadosMarcenaria
  equilibrio: { lucroMinimo: string | null }
  meta: { metaDoMes: string | null } // spec 024: meta de faturamento do mês, opcional
  padroes: Padroes & { multiplicadorEquivalente: string | null } // calculado pelo servidor (D018)
}

export const obterConfiguracao = () => requisitar<Configuracao>('/configuracoes')
export const salvarDadosMarcenaria = (dados: Record<string, string>) => requisitar<Configuracao>('/configuracoes/marcenaria', 'PUT', dados)
export const salvarPadroes = (padroes: Padroes) => requisitar<Configuracao>('/configuracoes/padroes', 'PUT', padroes)
export const salvarMeta = (metaDoMes: string) => requisitar<Configuracao>('/configuracoes/meta', 'PUT', { metaDoMes })
export const salvarEquilibrio = (dados: { lucroMinimo: string }) =>
  requisitar<Configuracao>('/configuracoes/equilibrio', 'PUT', dados)
