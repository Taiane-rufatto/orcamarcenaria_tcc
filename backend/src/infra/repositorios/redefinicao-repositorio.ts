import type { PoolClient } from 'pg'
import { randomUUID } from 'node:crypto'
import { pool } from '../banco/pool'

type Executor = Pick<PoolClient, 'query'>

// Houve pedido deste usuário há menos de `segundos`? Evita reenviar e-mail a cada clique (D028).
export async function pedidoRecente(usuarioId: string, segundos: number): Promise<boolean> {
  const resultado = await pool.query(
    `SELECT 1 FROM redefinicao_senha WHERE usuario_id = $1 AND criado_em > now() - make_interval(secs => $2)`,
    [usuarioId, segundos],
  )
  return (resultado.rowCount ?? 0) > 0
}

// Cria o pedido novo e invalida os anteriores ainda não usados: só o link mais recente funciona.
export async function criarPedido(executor: Executor, usuarioId: string, tokenHash: string, expiraEm: Date): Promise<void> {
  await executor.query(
    'UPDATE redefinicao_senha SET usada_em = now() WHERE usuario_id = $1 AND usada_em IS NULL',
    [usuarioId],
  )
  await executor.query(
    'INSERT INTO redefinicao_senha (id, usuario_id, token_hash, expira_em) VALUES ($1, $2, $3, $4)',
    [randomUUID(), usuarioId, tokenHash, expiraEm],
  )
}

// Busca o pedido válido (não usado, não vencido, de usuário ativo) e o trava até o fim da transação,
// para que dois cliques simultâneos no mesmo link não troquem a senha duas vezes.
export async function buscarPedidoValido(executor: Executor, tokenHash: string): Promise<{ id: string; usuarioId: string } | null> {
  const resultado = await executor.query(
    `SELECT r.id, r.usuario_id FROM redefinicao_senha r
     JOIN usuario u ON u.id = r.usuario_id AND u.ativo = true
     WHERE r.token_hash = $1 AND r.usada_em IS NULL AND r.expira_em > now()
     FOR UPDATE OF r`,
    [tokenHash],
  )
  const linha = resultado.rows[0]
  return linha ? { id: linha.id, usuarioId: linha.usuario_id } : null
}

export async function marcarUsado(executor: Executor, id: string): Promise<void> {
  await executor.query('UPDATE redefinicao_senha SET usada_em = now() WHERE id = $1', [id])
}
