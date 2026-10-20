import 'dotenv/config'
import process from 'node:process'
import { hostDaApi } from './host'

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

// Achado A7: segredo curto ou o texto do .env.example deixaria os tokens fáceis de falsificar.
function segredoJwt(): string {
  const valor = obrigatoria('JWT_SECRET')
  if (valor.length < 32 || valor.startsWith('troque-por')) {
    throw new Error('JWT_SECRET fraco: use ao menos 32 caracteres aleatórios (openssl rand -hex 32).')
  }
  return valor
}

export const ambiente = {
  porta: Number(process.env.PORT ?? 3333),
  host: hostDaApi(process.env.HOST),
  urlBanco: obrigatoria('DATABASE_URL'),
  origemPermitida: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  segredoJwt: segredoJwt(),
  expiracaoJwt: process.env.JWT_EXPIRACAO ?? '8h',
  // Endereço do front-end, usado para montar o link do e-mail de recuperação de senha.
  urlFrontend: process.env.URL_FRONTEND ?? process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  smtp: smtp(),
  remetente: process.env.EMAIL_REMETENTE ?? process.env.SMTP_USUARIO ?? 'OrçaMarcenaria <nao-responda@localhost>',
}
