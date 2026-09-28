import { z } from 'zod'

// RF08: só o nome é obrigatório. Campos opcionais vazios viram ausentes.
const opcional = (maximo: number, mensagem: string) => z.string().trim().max(maximo, mensagem).optional()

export const clienteSchema = z.object({
  nome: z.string('Informe o nome do cliente').trim().min(1, 'Informe o nome do cliente'),
  telefone: opcional(30, 'O telefone deve ter até 30 caracteres'),
  email: z.string().trim().max(200, 'O e-mail deve ter até 200 caracteres')
    .refine((valor) => valor === '' || z.email().safeParse(valor).success, 'Informe um e-mail válido')
    .optional(),
  endereco: opcional(300, 'O endereço deve ter até 300 caracteres'),
})
