import DecimalBase from 'decimal.js'

// Painel do mês (specs 019 e 024, RN14 a RN20): resume os orçamentos de um mês pelo que já está gravado.
// NÃO calcula preço: só soma, conta e compara valores que o cálculo do orçamento já fixou.
// Fonte das regras: documentacao/regras-de-calculo.md §6. Valores entram e saem como texto decimal.

const Decimal = DecimalBase.clone({ precision: 50, rounding: DecimalBase.ROUND_HALF_UP })
type Dec = InstanceType<typeof Decimal>
const ZERO = new Decimal(0)
const CEM = new Decimal(100)

const duas = (valor: Dec) => valor.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2)
const somar = (valores: string[]) => valores.reduce((total, valor) => total.plus(valor), ZERO)

export type SituacaoPainel = 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'vencido' | 'em_producao' | 'entregue'

export interface LinhaPainel {
  situacao: SituacaoPainel
  precoFinal: string
  custoDiretoTotal: string
}

export interface ResumoMes {
  rascunhos: number // ainda não enviados: não entram na conta
  enviados: number // todos os registrados no mês (tudo, menos rascunho)
  aguardando: number // enviados que ainda não tiveram resposta
  aprovados: {
    quantidade: number // aprovados, em produção e entregues: todo orçamento que o cliente aprovou
    valor: string
    lucro: string
    percentualDoPreco: string | null
    emProducao: number // dos aprovados, quantos estão em produção
    entregues: number // dos aprovados, quantos já foram entregues
  }
  recusados: number
  vencidos: number
  taxaDeAprovacao: string | null // aprovados ÷ enviados × 100, duas casas; nulo se nada foi enviado
}

// RN14. Rascunho não conta como enviado. "Aprovado" inclui o que passou a "em produção" e "entregue",
// porque o cliente já tinha aprovado (spec 024). Valor aprovado = soma dos preços finais deles; lucro = soma
// de (preço final − custo direto total), orçamento a orçamento (RN12). Taxa = aprovados ÷ enviados, duas casas.
export function resumirMes(linhas: LinhaPainel[]): ResumoMes {
  const conta = (...situacoes: SituacaoPainel[]) => linhas.filter((l) => situacoes.includes(l.situacao))
  const aprovadas = conta('aprovado', 'em_producao', 'entregue')
  const enviados = linhas.length - conta('rascunho').length

  const valor = somar(aprovadas.map((l) => l.precoFinal))
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
      emProducao: conta('em_producao').length,
      entregues: conta('entregue').length,
    },
    recusados: conta('recusado').length,
    vencidos: conta('vencido').length,
    taxaDeAprovacao: enviados > 0 ? duas(new Decimal(aprovadas.length).div(enviados).times(CEM)) : null,
  }
}

// ---------- Cobrança de mão de obra (RN18) ----------

export interface LinhaCobranca {
  situacao: SituacaoPainel
  precoFinal: string
  subtotalServicos: string
  horas: string // soma das quantidades dos serviços cobrados por hora (unidade h)
  valorDasHoras: string // soma dos valores de linha desses serviços
}

export interface ResumoCobranca {
  maoDeObra: string // soma dos subtotais de serviço dos orçamentos enviados
  percentualDoPreco: string | null // mão de obra ÷ soma dos preços finais × 100
  valorMedioDaHora: string | null // valor das horas ÷ horas; nulo se não há serviço por hora
}

// RN18. Só orçamentos enviados (tudo, menos rascunho). O valor médio da hora é a média ponderada pelas horas:
// soma dos valores dos serviços por hora ÷ soma das horas. Sem horas ou sem preço, o campo fica nulo.
export function resumirCobranca(linhas: LinhaCobranca[]): ResumoCobranca {
  const enviadas = linhas.filter((l) => l.situacao !== 'rascunho')
  const maoDeObra = somar(enviadas.map((l) => l.subtotalServicos))
  const preco = somar(enviadas.map((l) => l.precoFinal))
  const horas = somar(enviadas.map((l) => l.horas))
  return {
    maoDeObra: duas(maoDeObra),
    percentualDoPreco: preco.gt(0) ? duas(maoDeObra.div(preco).times(CEM)) : null,
    valorMedioDaHora: horas.gt(0) ? duas(somar(enviadas.map((l) => l.valorDasHoras)).div(horas)) : null,
  }
}

// ---------- Variação de preço (RN19) ----------

export type Tendencia = 'subindo' | 'estavel' | 'caindo'

export interface VariacaoDePreco {
  percentual: string // (atual − anterior) ÷ anterior × 100, duas casas; negativo quando caiu
  tendencia: Tendencia
}

// RN19. A tendência segue o percentual já arredondado, o mesmo que a tela mostra: 0,00% é "estável".
// Usada para o custo dos materiais e para o valor médio da hora. Valor anterior zero ou ausente: não compara.
export function variacaoDePreco(anterior: string | null, atual: string | null): VariacaoDePreco | null {
  if (anterior === null || atual === null || !new Decimal(anterior).gt(0)) return null
  const percentual = new Decimal(atual).minus(anterior).div(anterior).times(CEM).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
  return {
    percentual: percentual.toFixed(2),
    tendencia: percentual.isZero() ? 'estavel' : percentual.gt(0) ? 'subindo' : 'caindo',
  }
}

// ---------- Meta do mês (RN20) ----------

export interface ProgressoDaMeta {
  meta: string
  aprovado: string
  percentual: string // aprovado ÷ meta × 100, duas casas (passa de 100 quando a meta é superada)
  falta: string // quanto falta para a meta; zero quando já foi batida
  atingida: boolean
}

// RN20. Compara o valor aprovado do mês com a meta de faturamento que a pessoa definiu (opcional). Só compara;
// não é previsão e não muda nenhum preço. Sem meta (nula ou zero), não há progresso.
export function progressoDaMeta(valorAprovado: string, meta: string | null): ProgressoDaMeta | null {
  if (meta === null || !new Decimal(meta).gt(0)) return null
  const aprovado = new Decimal(valorAprovado)
  const falta = new Decimal(meta).minus(aprovado)
  return {
    meta: duas(new Decimal(meta)),
    aprovado: duas(aprovado),
    percentual: duas(aprovado.div(meta).times(CEM)),
    falta: falta.gt(0) ? duas(falta) : '0.00',
    atingida: falta.lte(0),
  }
}
