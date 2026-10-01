import 'dotenv/config'
import process from 'node:process'

function obrigatoria(nome: string): string {
  const valor = process.env[nome]
  if (!valor) {
    throw new Error(`Variável de ambiente ausente: ${nome}. Veja o .env.example.`)
  }
  return valor
}

// SMTP é opcional: sem ele, o e-mail de recuperação de senha vai para o console (D028).
function smtp() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USUARIO, SMTP_SENHA } = process.env
  if (!SMTP_HOST || !SMTP_USUARIO || !SMTP_SENHA) return null
  return { host: SMTP_HOST, porta: Number(SMTP_PORT ?? 465), usuario: SMTP_USUARIO, senha: SMTP_SENHA }
}

export const ambiente = {
  porta: Number(process.env.PORT ?? 3333),
  urlBanco: obrigatoria('DATABASE_URL'),
  origemPermitida: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  segredoJwt: obrigatoria('JWT_SECRET'),
  expiracaoJwt: process.env.JWT_EXPIRACAO ?? '8h',
  // Endereço do front-end, usado para montar o link do e-mail de recuperação de senha.
  urlFrontend: process.env.URL_FRONTEND ?? process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  smtp: smtp(),
  remetente: process.env.EMAIL_REMETENTE ?? process.env.SMTP_USUARIO ?? 'OrçaMarcenaria <nao-responda@localhost>',
}
