import DecimalBase from 'decimal.js'

// Aviso de equilíbrio (spec 018, RN12 e RN13): compara o que um orçamento rende por hora de trabalho
// com o que a marcenaria precisa por hora para fechar o mês. NÃO faz parte do cálculo do preço
// (calculo.ts): só lê valores já calculados e nunca altera o preço.
// Fonte das regras: documentacao/regras-de-calculo.md §6. Valores entram e saem como texto decimal.

const Decimal = DecimalBase.clone({ precision: 50, rounding: DecimalBase.ROUND_HALF_UP })
type Decimal = InstanceType<typeof Decimal>

const arred2 = (valor: Decimal) => valor.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

// Texto decimal simples e positivo; o resto (vazio, nulo, zero, "NaN", "1e3") significa "não informado".
function lerPositivo(texto: string | null | undefined): Decimal | null {
  if (texto === null || texto === undefined) return null
  if (!/^\d+(\.\d{1,2})?$/.test(texto)) return null
  const valor = new Decimal(texto)
  return valor.gt(0) ? valor : null
}

export interface ConfiguracaoEquilibrio {
  metaMensal: string | null // quanto precisa sobrar por mês, depois de pagar os materiais
  horasProdutivasMes: string | null
}

// RN12: valor necessário por hora = meta mensal ÷ horas produtivas por mês.
// Sem meta ou sem horas produtivas, não há como calcular: devolve null.
export function necessarioPorHora(config: ConfiguracaoEquilibrio): string | null {
  const meta = lerPositivo(config.metaMensal)
  const horas = lerPositivo(config.horasProdutivasMes)
  if (!meta || !horas) return null
  return arred2(meta.div(horas)).toFixed(2)
}

export interface EntradaEquilibrio extends ConfiguracaoEquilibrio {
  horasEstimadas: string | null
  precoFinal: string
  subtotalMateriais: string
  totalAdicionais: string
}

export interface ResultadoEquilibrio {
  contribuicao: string // preço final − materiais − custos adicionais
  valorPorHora: string // contribuição ÷ horas estimadas
  necessarioPorHora: string
  abaixoDoNecessario: boolean
}

// RN13: valor do orçamento por hora = (preço final − materiais − custos adicionais) ÷ horas estimadas.
// Os serviços não são descontados: o trabalho do marceneiro é o que a meta precisa remunerar.
// A comparação usa os valores já arredondados a duas casas, os mesmos que a tela mostra, para o aviso
// nunca contradizer o que a pessoa lê. Sem meta, sem horas produtivas ou sem horas estimadas devolve
// null: nada é inventado e nenhum aviso aparece.
export function avaliarEquilibrio(entrada: EntradaEquilibrio): ResultadoEquilibrio | null {
  const necessario = necessarioPorHora(entrada)
  const horasEstimadas = lerPositivo(entrada.horasEstimadas)
  if (necessario === null || !horasEstimadas) return null

  const contribuicao = new Decimal(entrada.precoFinal)
    .minus(entrada.subtotalMateriais)
    .minus(entrada.totalAdicionais)
  const valorPorHora = arred2(contribuicao.div(horasEstimadas))

  return {
    contribuicao: contribuicao.toFixed(2),
    valorPorHora: valorPorHora.toFixed(2),
    necessarioPorHora: necessario,
    abaixoDoNecessario: valorPorHora.lt(necessario),
  }
}
