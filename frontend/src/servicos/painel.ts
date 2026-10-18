import { requisitar } from './api'

// Painel do mês (specs 019 e 024, RF47, RF48 e RF60 a RF63). Tudo vem pronto da API; a tela só exibe (AGENTS §4.1).
export type Tendencia = 'subindo' | 'estavel' | 'caindo'
export type Variacao = { percentual: string; tendencia: Tendencia } | null

export type PainelDoMes = {
  mes: string // AAAA-MM
  rascunhos: number
  enviados: number
  aguardando: number
  recusados: number
  vencidos: number
  // `quantidade` inclui os que estão em produção e os já entregues: todo orçamento que o cliente aprovou.
  aprovados: { quantidade: number; valor: string; lucro: string; percentualDoPreco: string | null; emProducao: number; entregues: number }
  taxaDeAprovacao: string | null
  meta: { meta: string; aprovado: string; percentual: string; falta: string; atingida: boolean } | null
  cobranca: {
    maoDeObra: string
    percentualDoPreco: string | null
    valorMedioDaHora: string | null
    valorMedioDaHoraNoMesAnterior: string | null
    variacaoDaHora: Variacao
  }
  // Materiais mais usados nos últimos 90 dias e se o custo subiu, caiu ou ficou estável.
  precos: { materialId: string; nome: string; usos: number; custoAtual: string; custoAnterior: string | null; variacao: Variacao }[]
}

// Sem `mes`, a API usa o mês atual de São Paulo.
export const consultarPainel = (mes?: string) => requisitar<PainelDoMes>(mes ? `/painel?mes=${mes}` : '/painel')
