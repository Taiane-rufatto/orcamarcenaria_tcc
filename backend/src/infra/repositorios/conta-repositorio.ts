import type { PoolClient } from 'pg'
import { randomUUID } from 'node:crypto'
import { pool } from '../banco/pool'

export type Usuario = {
  id: string
  marcenariaId: string
  nome: string
  email: string
  senhaHash: string
}

type Executor = Pick<PoolClient, 'query'>

function usuarioDaLinha(linha: Record<string, string>): Usuario {
  return {
    id: linha.id,
    marcenariaId: linha.marcenaria_id,
    nome: linha.nome,
    email: linha.email,
    senhaHash: linha.senha_hash,
  }
}

export async function buscarUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const resultado = await pool.query(
    `SELECT id, marcenaria_id, nome, email, senha_hash
     FROM usuario WHERE email = $1 AND ativo = true`,
    [email],
  )
  return resultado.rows[0] ? usuarioDaLinha(resultado.rows[0]) : null
}

export async function buscarUsuarioPorId(id: string): Promise<Usuario | null> {
  const resultado = await pool.query(
    `SELECT id, marcenaria_id, nome, email, senha_hash
     FROM usuario WHERE id = $1 AND ativo = true`,
    [id],
  )
  return resultado.rows[0] ? usuarioDaLinha(resultado.rows[0]) : null
}

export async function criarConta(
  executor: Executor,
  dados: { nomeMarcenaria: string; nomeResponsavel: string; email: string; senhaHash: string },
): Promise<Usuario> {
  const marcenaria = await executor.query(
    'INSERT INTO marcenaria (id, nome, responsavel) VALUES ($1, $2, $3) RETURNING id',
    [randomUUID(), dados.nomeMarcenaria, dados.nomeResponsavel],
  )
  const usuario = await executor.query(
    `INSERT INTO usuario (id, marcenaria_id, nome, email, senha_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, marcenaria_id, nome, email, senha_hash`,
    [randomUUID(), marcenaria.rows[0].id, dados.nomeResponsavel, dados.email, dados.senhaHash],
  )
  return usuarioDaLinha(usuario.rows[0])
}

export async function atualizarSenha(
  executor: Executor,
  usuarioId: string,
  senhaHash: string,
): Promise<void> {
  await executor.query('UPDATE usuario SET senha_hash = $1 WHERE id = $2 AND ativo = true', [senhaHash, usuarioId])
}
