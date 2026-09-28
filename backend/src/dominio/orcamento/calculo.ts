import DecimalBase from 'decimal.js'

// Implementação única do cálculo do orçamento (AGENTS §4.1, D005).
// Fonte das regras: documentacao/regras-de-calculo.md — cada passo abaixo cita o item correspondente.
// Todos os valores entram e saem como texto decimal ("1931.10"): nada passa por Number (RN-C01).

// Precisão alta para a divisão da margem não arredondar sozinha; o arredondamento
// acontece só onde a regra manda, sempre meio para cima (RN-C02).
const Decimal = DecimalBase.clone({ precision: 50, rounding: DecimalBase.ROUND_HALF_UP })
type Decimal = InstanceType<typeof Decimal>

export type ModoLucro = 'margem' | 'markup'
export type RegraArredondamento = 'duas_casas' | 'real_inteiro' | 'dezena'

export interface ItemCalculo {
  tipo: 'material' | 'servico'
  quantidade: string
  valorUnitario: string
}

export interface EntradaCalculo {
  itens: ItemCalculo[]
  custosAdicionais: string[]
  modoLucro: ModoLucro
  percentualLucro: string
  regraArredondamento: RegraArredondamento
}

export interface ResultadoCalculo {
  valoresLinha: string[] // na mesma ordem de `itens`
  subtotalMateriais: string
  subtotalServicos: string
  totalAdicionais: string
  custoDiretoTotal: string
  precoBruto: string
  valorLucro: string
  ajusteArredondamento: string
  precoFinal: string
  multiplicadorEquivalente: string | null // só no markup (D018)
}

// Entrada que tornaria o cálculo inválido (RN10). A API traduz para resposta 400.
export class ErroCalculo extends Error {}

const ZERO = new Decimal(0)
const CEM = new Decimal(100)
const arred2 = (valor: Decimal) => valor.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
const somar = (valores: Decimal[]) => valores.reduce((total, valor) => total.plus(valor), ZERO)
const moeda = (valor: Decimal) => valor.toFixed(2)

// Aceita só decimal simples com ponto ("12.50", "-1") e no máximo `casas` casas (regras-de-calculo.md §1).
// Barra o que o decimal.js aceitaria sem ser valor de orçamento ("NaN", "Infinity", "1e3", "0x10")
// e o que ele recusaria com erro interno ("", "2,5"). A vírgula decimal é convertida antes, na API.
function lerDecimal(texto: string, casas: number, rotulo: string): Decimal {
  if (!new RegExp(`^-?\\d+(\\.\\d{1,${casas}})?$`).test(texto)) {
    throw new ErroCalculo(`${rotulo}: use número com até ${casas} casas decimais`)
  }
  return new Decimal(texto)
}

// Converte e valida toda a entrada antes de qualquer conta (RN10).
function lerEntrada(entrada: EntradaCalculo) {
  const itens = entrada.itens.map((item) => {
    const quantidade = lerDecimal(item.quantidade, 3, 'Quantidade inválida')
    const valorUnitario = lerDecimal(item.valorUnitario, 4, 'Valor unitário inválido')
    if (quantidade.lte(0)) throw new ErroCalculo('A quantidade deve ser maior que zero')
    if (valorUnitario.lt(0)) throw new ErroCalculo('O valor unitário não pode ser negativo')
    return { tipo: item.tipo, quantidade, valorUnitario }
  })

  const custosAdicionais = entrada.custosAdicionais.map((texto) => {
    const valor = lerDecimal(texto, 2, 'Custo adicional inválido')
    if (valor.lte(0)) throw new ErroCalculo('O custo adicional deve ser maior que zero')
    return valor
  })

  const percentual = lerDecimal(entrada.percentualLucro, 2, 'Percentual de lucro inválido')
  if (entrada.modoLucro === 'margem') {
    if (percentual.lt(0)) throw new ErroCalculo('A margem não pode ser negativa')
    if (percentual.gte(100)) throw new ErroCalculo('A margem deve ser menor que 100%')
  } else if (percentual.lt(0)) {
    throw new ErroCalculo('O markup não pode ser negativo')
  }

  return { itens, custosAdicionais, percentual }
}

// Passo 7 — RN05 (margem sobre o preço de venda) e RN06 (markup sobre o custo).
function aplicarLucro(custo: Decimal, modo: ModoLucro, percentual: Decimal): Decimal {
  const taxa = percentual.div(CEM)
  if (modo === 'margem') return arred2(custo.div(new Decimal(1).minus(taxa)))
  return arred2(custo.times(new Decimal(1).plus(taxa)))
}

// Passo 9 — RN07. Real inteiro e dezena arredondam sempre para cima.
function aplicarArredondamentoComercial(preco: Decimal, regra: RegraArredondamento): Decimal {
  if (regra === 'real_inteiro') return preco.toDecimalPlaces(0, Decimal.ROUND_CEIL)
  if (regra === 'dezena') return preco.div(10).toDecimalPlaces(0, Decimal.ROUND_CEIL).times(10)
  return preco
}

export function calcularOrcamento(entrada: EntradaCalculo): ResultadoCalculo {
  const { itens, custosAdicionais, percentual } = lerEntrada(entrada)

  // Passos 1 e 2 — RN01/RN02: cada linha arredondada a 2 casas.
  const linhas = itens.map((item) => ({
    tipo: item.tipo,
    valor: arred2(item.quantidade.times(item.valorUnitario)),
  }))

  // Passos 3 a 6 — somas das parcelas já arredondadas (RN-C03) e RN04.
  const subtotalMateriais = somar(linhas.filter((l) => l.tipo === 'material').map((l) => l.valor))
  const subtotalServicos = somar(linhas.filter((l) => l.tipo === 'servico').map((l) => l.valor))
  const totalAdicionais = somar(custosAdicionais)
  const custoDiretoTotal = subtotalMateriais.plus(subtotalServicos).plus(totalAdicionais)

  // Passos 7 a 9.
  const precoBruto = aplicarLucro(custoDiretoTotal, entrada.modoLucro, percentual)
  const valorLucro = precoBruto.minus(custoDiretoTotal)
  const precoFinal = aplicarArredondamentoComercial(precoBruto, entrada.regraArredondamento)

  // D018: informativo, para "cobro 2,5× o custo" não virar markup de 250%. Não entra no cálculo.
  let multiplicadorEquivalente: string | null = null
  if (entrada.modoLucro === 'markup') {
    const multiplicador = new Decimal(1).plus(percentual.div(CEM))
    multiplicadorEquivalente = multiplicador.toFixed(Math.max(2, multiplicador.decimalPlaces()))
  }

  return {
    valoresLinha: linhas.map((l) => moeda(l.valor)),
    subtotalMateriais: moeda(subtotalMateriais),
    subtotalServicos: moeda(subtotalServicos),
    totalAdicionais: moeda(totalAdicionais),
    custoDiretoTotal: moeda(custoDiretoTotal),
    precoBruto: moeda(precoBruto),
    valorLucro: moeda(valorLucro),
    ajusteArredondamento: moeda(precoFinal.minus(precoBruto)),
    precoFinal: moeda(precoFinal),
    multiplicadorEquivalente,
  }
}
