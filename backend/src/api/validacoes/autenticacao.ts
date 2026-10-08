import { z } from 'zod'

const textoObrigatorio = (nome: string) =>
  z.string().trim().min(1, `${nome} é obrigatório`)

export const cadastroSchema = z.object({
  nomeMarcenaria: textoObrigatorio('Nome da marcenaria'),
  nomeResponsavel: textoObrigatorio('Nome do responsável'),
  email: z.string().trim().email('Informe um e-mail válido').transform((email) => email.toLowerCase()),
  senha: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
})

export const entrarSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido').transform((email) => email.toLowerCase()),
  senha: textoObrigatorio('Senha'),
})

export const alterarSenhaSchema = z.object({
  senhaAtual: textoObrigatorio('Senha atual'),
  novaSenha: z.string().min(8, 'A nova senha deve ter ao menos 8 caracteres'),
})

export const esqueciSenhaSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido').transform((email) => email.toLowerCase()),
})

export const redefinirSenhaSchema = z.object({
  token: textoObrigatorio('Link de recuperação'),
  novaSenha: z.string().min(8, 'A nova senha deve ter ao menos 8 caracteres'),
})

export type CadastroEntrada = z.infer<typeof cadastroSchema>
export type EntrarEntrada = z.infer<typeof entrarSchema>
export type AlterarSenhaEntrada = z.infer<typeof alterarSenhaSchema>
export type RedefinirSenhaEntrada = z.infer<typeof redefinirSenhaSchema>
