import { z } from 'zod'

// Valor monetário/quantidade permanece string: nunca vira Number (AGENTS §4.2).
// Aceita vírgula decimal (AGENTS §8) e normaliza para ponto antes de gravar em NUMERIC(12,4).
export const decimal = z
  .string()
  .trim()
  .transform((valor) => valor.replace(',', '.'))
  .pipe(z.string().regex(/^\d{1,8}(\.\d{1,4})?$/, 'Informe valor positivo com até quatro casas decimais'))
  .refine((valor) => /[1-9]/.test(valor), 'Informe valor maior que zero')

const base = {
  nome: z.string().trim().min(1, 'Nome é obrigatório'),
  descricao: z.string().trim().max(300, 'A descrição deve ter até 300 caracteres').optional(),
}

export const UNIDADES = ['un', 'm', 'm²', 'ml', 'ch', 'kg', 'L', 'pç'] as const

export const materialSchema = z.object({
  ...base,
  unidade: z.enum(UNIDADES, 'Selecione uma unidade válida'),
  custoUnitario: decimal,
})

export const servicoSchema = z.object({
  ...base,
  tipoCobranca: z.enum(['hora', 'unidade'], 'Selecione a forma de cobrança'),
  valorUnitario: decimal,
})
