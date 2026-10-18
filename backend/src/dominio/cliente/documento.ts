// CPF ou CNPJ do cliente (spec 022, RF54). Só confere se o número é plausível (dígitos verificadores);
// não consulta a Receita. Fonte das regras: documentacao/regras-de-calculo.md §6.2. Nada aqui é preço.

export type TipoDocumento = 'cpf' | 'cnpj'

const soDigitos = (texto: string) => texto.replace(/\D/g, '')
const todosIguais = (digitos: string) => /^(\d)\1+$/.test(digitos)

// Dígito verificador: soma dos dígitos vezes os pesos, resto da divisão por 11 (resto < 2 vira 0; senão 11 − resto).
function digitoVerificador(digitos: string, pesos: number[]): number {
  const soma = pesos.reduce((total, peso, i) => total + Number(digitos[i]) * peso, 0)
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

const PESOS_CPF_1 = [10, 9, 8, 7, 6, 5, 4, 3, 2]
const PESOS_CPF_2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
const PESOS_CNPJ_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const PESOS_CNPJ_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

// Aceita com ou sem pontuação. Devolve o tipo e só os dígitos, ou nulo se não for um CPF (11 dígitos)
// nem um CNPJ (14 dígitos) válido. Sequências repetidas (111.111.111-11) são recusadas.
export function lerDocumento(texto: string): { tipo: TipoDocumento; digitos: string } | null {
  const digitos = soDigitos(texto)
  if (todosIguais(digitos)) return null

  if (digitos.length === 11) {
    const confere = digitoVerificador(digitos, PESOS_CPF_1) === Number(digitos[9])
      && digitoVerificador(digitos, PESOS_CPF_2) === Number(digitos[10])
    return confere ? { tipo: 'cpf', digitos } : null
  }
  if (digitos.length === 14) {
    const confere = digitoVerificador(digitos, PESOS_CNPJ_1) === Number(digitos[12])
      && digitoVerificador(digitos, PESOS_CNPJ_2) === Number(digitos[13])
    return confere ? { tipo: 'cnpj', digitos } : null
  }
  return null
}
