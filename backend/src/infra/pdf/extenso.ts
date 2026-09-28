// Valor em reais por extenso para o PDF (RF41): "2760.00" → "dois mil, setecentos e sessenta reais".
// Trabalha dígito a dígito sobre o texto decimal, sem converter para Number (AGENTS §4.2).
// Aceita até bilhões, o limite de NUMERIC(12,2).

const UNIDADES: Record<string, string> = {
  '1': 'um', '2': 'dois', '3': 'três', '4': 'quatro', '5': 'cinco', '6': 'seis', '7': 'sete', '8': 'oito', '9': 'nove',
}
const DEZ_A_DEZENOVE: Record<string, string> = {
  '0': 'dez', '1': 'onze', '2': 'doze', '3': 'treze', '4': 'catorze',
  '5': 'quinze', '6': 'dezesseis', '7': 'dezessete', '8': 'dezoito', '9': 'dezenove',
}
const DEZENAS: Record<string, string> = {
  '2': 'vinte', '3': 'trinta', '4': 'quarenta', '5': 'cinquenta', '6': 'sessenta', '7': 'setenta', '8': 'oitenta', '9': 'noventa',
}
const CENTENAS: Record<string, string> = {
  '1': 'cento', '2': 'duzentos', '3': 'trezentos', '4': 'quatrocentos', '5': 'quinhentos',
  '6': 'seiscentos', '7': 'setecentos', '8': 'oitocentos', '9': 'novecentos',
}
// Nome de cada grupo de três dígitos, da direita para a esquerda: [singular, plural].
const ESCALAS: [string, string][] = [['', ''], ['mil', 'mil'], ['milhão', 'milhões'], ['bilhão', 'bilhões']]

const zerado = (grupo: string) => grupo === '000'
const eUm = (grupo: string) => grupo === '001'

// "760" → "setecentos e sessenta"; sempre recebe três dígitos.
function tresDigitos(grupo: string): string {
  const [c, d, u] = grupo
  if (grupo === '100') return 'cem'
  const partes: string[] = []
  if (c !== '0') partes.push(CENTENAS[c])
  if (d === '1') partes.push(DEZ_A_DEZENOVE[u])
  else {
    if (d !== '0') partes.push(DEZENAS[d])
    if (u !== '0') partes.push(UNIDADES[u])
  }
  return partes.join(' e ')
}

// Número inteiro (texto sem zeros à esquerda) por extenso: "2760" → "dois mil, setecentos e sessenta".
function inteiroPorExtenso(digitos: string): string {
  const completo = digitos.padStart(Math.ceil(digitos.length / 3) * 3, '0')
  const grupos: string[] = []
  for (let i = 0; i < completo.length; i += 3) grupos.push(completo.slice(i, i + 3))

  const partes: { texto: string; grupo: string }[] = []
  grupos.forEach((grupo, i) => {
    if (zerado(grupo)) return
    const [singular, plural] = ESCALAS[grupos.length - 1 - i]
    // "mil", e não "um mil"; "um milhão", "dois milhões".
    const numero = singular === 'mil' && eUm(grupo) ? '' : tresDigitos(grupo)
    const escala = eUm(grupo) ? singular : plural
    partes.push({ texto: [numero, escala].filter(Boolean).join(' '), grupo })
  })

  // O último grupo entra com "e" quando é menor que cem ou uma centena redonda ("mil e cem",
  // "mil e um", "dois milhões e quinhentos mil"); os demais, com vírgula ("dois mil, setecentos e sessenta").
  return partes.map((parte, i) => {
    if (i === 0) return parte.texto
    const [c, d, u] = parte.grupo
    const comE = i === partes.length - 1 && (c === '0' || (d === '0' && u === '0'))
    return `${comE ? ' e ' : ', '}${parte.texto}`
  }).join('')
}

export function valorPorExtenso(valor: string): string {
  if (!/^\d{1,10}\.\d{2}$/.test(valor)) throw new Error(`Valor inválido para extenso: ${valor}`)
  const [inteiroBruto, centavos] = valor.split('.')
  const inteiro = inteiroBruto.replace(/^0+/, '')

  const partes: string[] = []
  if (inteiro) {
    const texto = inteiroPorExtenso(inteiro)
    // "um milhão de reais": milhão e bilhão redondos pedem "de".
    const redondoGrande = /(milhão|milhões|bilhão|bilhões)$/.test(texto)
    partes.push(`${texto}${redondoGrande ? ' de' : ''} ${inteiro === '1' ? 'real' : 'reais'}`)
  }
  if (centavos !== '00') {
    partes.push(`${tresDigitos(`0${centavos}`)} ${centavos === '01' ? 'centavo' : 'centavos'}`)
  }
  return partes.length ? partes.join(' e ') : 'zero reais'
}
