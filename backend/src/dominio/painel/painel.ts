import DecimalBase from 'decimal.js'

// Painel do mês (spec 019, RN14): resume os orçamentos de um mês pelo que já está gravado.
// NÃO calcula preço: só soma e conta valores que o cálculo do orçamento já fixou.
// Fonte das regras: documentacao/regras-de-calculo.md §6. Valores entram e saem como texto decimal.

const Decimal = DecimalBase.clone({ precision: 50, rounding: DecimalBase.ROUND_HALF_UP })
const ZERO = new Decimal(0)
const CEM = new Decimal(100)

export type SituacaoPainel = 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'vencido'

export interface LinhaPainel {
  situacao: SituacaoPainel
  precoFinal: string
  custoDiretoTotal: string
}

export interface ResumoMes {
  rascunhos: number // ainda não enviados: não entram na conta
  enviados: number // todos os registrados no mês (enviado, aprovado, recusado ou vencido)
  aguardando: number // enviados que ainda não tiveram resposta
  aprovados: { quantidade: number; valor: string; lucro: string; percentualDoPreco: string | null }
  recusados: number
  vencidos: number
  taxaDeAprovacao: string | null // aprovados ÷ enviados × 100, duas casas; nulo se nada foi enviado
}

const duas = (valor: InstanceType<typeof Decimal>) => valor.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2)

// RN14. Rascunho não conta como enviado. Valor aprovado = soma dos preços finais dos aprovados;
// lucro = soma de (preço final − custo direto total) deles (mesma conta da RN12, orçamento a orçamento).
// Taxa de aprovação = aprovados ÷ enviados (arredondada a duas casas); sem enviados, não há taxa.
export function resumirMes(linhas: LinhaPainel[]): ResumoMes {
  const conta = (situacao: SituacaoPainel) => linhas.filter((l) => l.situacao === situacao)
  const aprovadas = conta('aprovado')
  const enviados = linhas.length - conta('rascunho').length

  const valor = aprovadas.reduce((total, l) => total.plus(l.precoFinal), ZERO)
  const lucro = aprovadas.reduce((total, l) => total.plus(l.precoFinal).minus(l.custoDiretoTotal), ZERO)

  return {
    rascunhos: conta('rascunho').length,
    enviados,
    aguardando: conta('enviado').length,
    aprovados: {
      quantidade: aprovadas.length,
      valor: duas(valor),
      lucro: duas(lucro),
      percentualDoPreco: valor.gt(0) ? duas(lucro.div(valor).times(CEM)) : null,
    },
    recusados: conta('recusado').length,
    vencidos: conta('vencido').length,
    taxaDeAprovacao: enviados > 0 ? duas(new Decimal(aprovadas.length).div(enviados).times(CEM)) : null,
  }
}
