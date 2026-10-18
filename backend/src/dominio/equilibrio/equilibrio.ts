import DecimalBase from 'decimal.js'

// Aviso de lucro mínimo (spec 018, RN12 e RN13): mostra quanto do preço de venda é lucro de verdade
// e avisa quando fica abaixo do mínimo que o marceneiro aceita. NÃO faz parte do cálculo do preço
// (calculo.ts): só lê valores já calculados e nunca altera o preço.
// Fonte das regras: documentacao/regras-de-calculo.md §6. Valores entram e saem como texto decimal.

const Decimal = DecimalBase.clone({ precision: 50, rounding: DecimalBase.ROUND_HALF_UP })
const CEM = new Decimal(100)

// Lucro mínimo em pontos percentuais do preço de venda: maior que zero e menor que 100.
// Qualquer outra coisa (vazio, nulo, zero, "NaN", "1e3") vale como "não informado".
function lerMinimo(texto: string | null | undefined): InstanceType<typeof Decimal> | null {
  if (texto === null || texto === undefined || !/^\d{1,2}(\.\d{1,2})?$/.test(texto)) return null
  const valor = new Decimal(texto)
  return valor.gt(0) && valor.lt(CEM) ? valor : null
}

export interface EntradaEquilibrio {
  lucroMinimo: string | null // % do preço de venda; opcional
  precoFinal: string
  custoDiretoTotal: string
}

export interface ResultadoEquilibrio {
  lucro: string // preço final − custo direto total (o que sobra depois de pagar tudo)
  percentualDoPreco: string // lucro ÷ preço final × 100, duas casas
  lucroMinimo: string | null
  abaixoDoMinimo: boolean
}

// RN12: lucro real = preço final − custo direto total (materiais, serviços e custos adicionais).
// Inclui o ajuste de arredondamento, porque ele também fica com a marcenaria.
// RN13: percentual do preço = arred2(lucro ÷ preço final × 100). É a margem de verdade do orçamento
// e vale para markup e para margem. Aviso quando o percentual (já arredondado, como a tela mostra)
// é menor que o mínimo informado. Sem mínimo, só informa o lucro e nunca avisa.
// Preço zero (orçamento sem itens) não tem percentual: devolve null.
export function avaliarEquilibrio(entrada: EntradaEquilibrio): ResultadoEquilibrio | null {
  const preco = new Decimal(entrada.precoFinal)
  if (!preco.gt(0)) return null

  const lucro = preco.minus(entrada.custoDiretoTotal)
  const percentual = lucro.div(preco).times(CEM).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
  const minimo = lerMinimo(entrada.lucroMinimo)

  return {
    lucro: lucro.toFixed(2),
    percentualDoPreco: percentual.toFixed(2),
    lucroMinimo: minimo ? minimo.toFixed(2) : null,
    abaixoDoMinimo: minimo ? percentual.lt(minimo) : false,
  }
}
