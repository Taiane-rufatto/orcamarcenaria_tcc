import type { PoolClient } from 'pg'
import { randomUUID } from 'node:crypto'
import { pool } from '../banco/pool'

type Executor = Pick<PoolClient, 'query'>

export type Sessao = {
  id: string
  usuarioId: string
  marcenariaId: string
  expiraEm: Date
}

function sessaoDaLinha(linha: Record<string, string | Date>): Sessao {
  return {
    id: linha.id as string,
    usuarioId: linha.usuario_id as string,
    marcenariaId: linha.marcenaria_id as string,
    expiraEm: new Date(linha.expira_em),
  }
}

export async function criarSessao(
  executor: Executor,
  dados: { usuarioId: string; marcenariaId: string; expiraEm: Date },
): Promise<Sessao> {
  const resultado = await executor.query(
    `INSERT INTO sessao (id, usuario_id, marcenaria_id, expira_em)
     VALUES ($1, $2, $3, $4)
     RETURNING id, usuario_id, marcenaria_id, expira_em`,
    [randomUUID(), dados.usuarioId, dados.marcenariaId, dados.expiraEm],
  )
  return sessaoDaLinha(resultado.rows[0])
}

export async function buscarSessaoAtiva(id: string): Promise<Sessao | null> {
  const resultado = await pool.query(
    `SELECT id, usuario_id, marcenaria_id, expira_em FROM sessao
     WHERE id = $1 AND encerrada_em IS NULL AND expira_em > now()`,
    [id],
  )
  return resultado.rows[0] ? sessaoDaLinha(resultado.rows[0]) : null
}

export async function encerrarSessao(executor: Executor, id: string): Promise<void> {
  await executor.query('UPDATE sessao SET encerrada_em = now() WHERE id = $1 AND encerrada_em IS NULL', [id])
}

export async function encerrarSessoesDoUsuario(executor: Executor, usuarioId: string): Promise<void> {
  await executor.query(
    'UPDATE sessao SET encerrada_em = now() WHERE usuario_id = $1 AND encerrada_em IS NULL',
    [usuarioId],
  )
}
