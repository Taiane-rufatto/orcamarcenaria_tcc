import { pool } from '../../infra/banco/pool'
import { encerrarSessao } from '../../infra/repositorios/sessao-repositorio'

export function sair(sessaoId: string): Promise<void> {
  return encerrarSessao(pool, sessaoId)
}
