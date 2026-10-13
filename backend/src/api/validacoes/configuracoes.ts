import { z } from 'zod'
import { horas, percentualLucro } from './orcamento'

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

// Spec 018. Meta mensal em reais (até 2 casas) e horas produtivas por mês; vazio = não informado.
// Um campo preenchido sem o outro é aceito: o aviso só aparece quando os dois existem.
export const equilibrioSchema = z.object({
  metaMensal: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z.string('Informe a meta mensal com até 2 casas decimais').trim()
      .transform((valor) => valor.replace(',', '.'))
      .pipe(z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, 'Informe a meta mensal com até 2 casas decimais').refine((v) => /[1-9]/.test(v), 'A meta mensal deve ser maior que zero'))
      .nullable(),
  ),
  horasProdutivasMes: horas('Informe as horas produtivas por mês com até 2 casas decimais, maiores que zero'),
}).refine((d) => d.horasProdutivasMes === null || Number(d.horasProdutivasMes) <= 744, {
  message: 'Um mês tem no máximo 744 horas',
  path: ['horasProdutivasMes'],
})
