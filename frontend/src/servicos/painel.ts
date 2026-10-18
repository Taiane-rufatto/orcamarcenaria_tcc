import { requisitar } from './api'

// Painel do mês (spec 019, RF47, RF48). Tudo vem pronto da API; a tela só exibe (AGENTS §4.1).
export type PainelDoMes = {
  mes: string // AAAA-MM
  rascunhos: number
  enviados: number
  aguardando: number
  recusados: number
  vencidos: number
  aprovados: { quantidade: number; valor: string; lucro: string; percentualDoPreco: string | null }
  taxaDeAprovacao: string | null
}

// Sem `mes`, a API usa o mês atual de São Paulo.
export const consultarPainel = (mes?: string) => requisitar<PainelDoMes>(mes ? `/painel?mes=${mes}` : '/painel')
