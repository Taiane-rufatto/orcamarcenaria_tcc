import 'dotenv/config'
import process from 'node:process'

function obrigatoria(nome: string): string {
  const valor = process.env[nome]
  if (!valor) {
    throw new Error(`Variável de ambiente ausente: ${nome}. Veja o .env.example.`)
  }
  return valor
}

export const ambiente = {
  porta: Number(process.env.PORT ?? 3333),
  urlBanco: obrigatoria('DATABASE_URL'),
  origemPermitida: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}
