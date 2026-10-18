import { z } from 'zod'
import { nomeEmMaiusculas } from './catalogo'

// RF49: só o nome é obrigatório; telefone opcional. Simples de propósito: não é um cadastro de CRM.
export const fornecedorSchema = z.object({
  nome: nomeEmMaiusculas('Informe o nome do fornecedor'),
  telefone: z.string().trim().max(30, 'O telefone deve ter até 30 caracteres').optional(),
})
