import bcrypt from 'bcrypt'

const custo = 12

export function criarHashDeSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, custo)
}

export function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash)
}
