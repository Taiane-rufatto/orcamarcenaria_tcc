import { z } from 'zod'

const textoObrigatorio = (nome: string) =>
  z.string().trim().min(1, `${nome} é obrigatório`)

// Spec 028 (F-05): teto de 128 caracteres; o bcrypt só usa os 72 primeiros bytes e uma senha enorme só gasta CPU.
const senhaNova = (nome: string) =>
  z.string().min(8, `${nome} deve ter ao menos 8 caracteres`).max(128, `${nome} pode ter no máximo 128 caracteres`)

export const cadastroSchema = z.object({
  nomeMarcenaria: textoObrigatorio('Nome da marcenaria'),
  nomeResponsavel: textoObrigatorio('Nome do responsável'),
  email: z.string().trim().email('Informe um e-mail válido').transform((email) => email.toLowerCase()),
  senha: senhaNova('A senha'),
})

export const entrarSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido').transform((email) => email.toLowerCase()),
  senha: textoObrigatorio('Senha').max(128, 'A senha pode ter no máximo 128 caracteres'),
})

export const alterarSenhaSchema = z.object({
  senhaAtual: textoObrigatorio('Senha atual').max(128, 'A senha pode ter no máximo 128 caracteres'),
  novaSenha: senhaNova('A nova senha'),
})

export const esqueciSenhaSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido').transform((email) => email.toLowerCase()),
})

export const redefinirSenhaSchema = z.object({
  token: textoObrigatorio('Link de recuperação'),
  novaSenha: senhaNova('A nova senha'),
})

export type CadastroEntrada = z.infer<typeof cadastroSchema>
export type EntrarEntrada = z.infer<typeof entrarSchema>
export type AlterarSenhaEntrada = z.infer<typeof alterarSenhaSchema>
export type RedefinirSenhaEntrada = z.infer<typeof redefinirSenhaSchema>
