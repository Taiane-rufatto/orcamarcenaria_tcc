import { z } from 'zod'
import { percentualLucro } from './orcamento'

// Campos opcionais: vazio vira nulo.
const opcional = (maximo: number, mensagem: string) =>
  z.string().trim().max(maximo, mensagem).optional().transform((valor) => valor || null)
const obrigatorio = (mensagem: string) => z.string(mensagem).trim().min(1, mensagem)

// RF05. CNPJ opcional: se informado, precisa ter 14 dígitos (a pontuação é livre).
export const dadosMarcenariaSchema = z.object({
  nome: obrigatorio('Informe o nome da marcenaria'),
  responsavel: obrigatorio('Informe o responsável'),
  telefone: opcional(30, 'O telefone deve ter até 30 caracteres'),
  email: z.string().trim().max(200, 'O e-mail deve ter até 200 caracteres')
    .refine((valor) => valor === '' || z.email().safeParse(valor).success, 'Informe um e-mail válido')
    .optional().transform((valor) => valor || null),
  cnpj: opcional(18, 'CNPJ inválido')
    .refine((valor) => valor === null || valor.replace(/\D/g, '').length === 14, 'O CNPJ deve ter 14 dígitos'),
  endereco: opcional(300, 'O endereço deve ter até 300 caracteres'),
})

// RF19–RF22. O limite da margem (< 100) é conferido pela função do domínio (D024).
export const padroesSchema = z.object({
  modoLucro: z.enum(['margem', 'markup'], 'Selecione margem ou markup'),
  percentualLucro,
  regraArredondamento: z.enum(['duas_casas', 'real_inteiro', 'dezena'], 'Selecione a regra de arredondamento'),
  validadeDias: z.number('Informe a validade em dias').int('Informe um número inteiro de dias')
    .min(1, 'A validade deve ser de 1 a 365 dias').max(365, 'A validade deve ser de 1 a 365 dias'),
})
