import jwt, { type SignOptions } from 'jsonwebtoken'
import { ambiente } from '../config/ambiente'

export type DadosDoToken = {
  sessaoId: string
  usuarioId: string
  marcenariaId: string
}

export function emitirToken(dados: DadosDoToken): string {
  const opcoes: SignOptions = {
    algorithm: 'HS256',
    expiresIn: ambiente.expiracaoJwt as SignOptions['expiresIn'],
  }
  return jwt.sign(dados, ambiente.segredoJwt, opcoes)
}

export function verificarToken(token: string): DadosDoToken {
  const dados = jwt.verify(token, ambiente.segredoJwt, { algorithms: ['HS256'] })
  if (
    typeof dados === 'string' ||
    typeof dados.sessaoId !== 'string' ||
    typeof dados.usuarioId !== 'string' ||
    typeof dados.marcenariaId !== 'string'
  ) {
    throw new Error('Token inválido')
  }
  return dados as DadosDoToken
}
