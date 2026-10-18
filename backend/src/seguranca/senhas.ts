import bcrypt from 'bcrypt'

const custo = 12

export function criarHashDeSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, custo)
}

// Achado A5: quando o e-mail não existe, o login gastaria menos tempo do que com e-mail existente e revelaria quais
// e-mails têm conta. Esta comparação com um hash falso iguala o tempo das duas respostas.
let hashFalso: Promise<string> | undefined
export async function gastarTempoDeComparacao(senha: string): Promise<void> {
  hashFalso ??= criarHashDeSenha('hash-falso-que-nenhuma-conta-usa')
  await conferirSenha(senha, await hashFalso)
}

export function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash)
}
