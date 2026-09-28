import { randomUUID } from 'node:crypto'
import type { PoolClient } from 'pg'
import { pool } from '../banco/pool'

// Cadastro de clientes (RF08–RF10). Todo SQL filtra por marcenaria_id (AGENTS §5.1).
export type Situacao = 'ativos' | 'inativos' | 'todos'
export interface DadosCliente { nome: string; telefone?: string; email?: string; endereco?: string }

const escaparCuringas = (texto: string) => texto.replace(/[\\%_]/g, '\\$&')
const vazioComoNulo = (valor?: string) => valor || null

export async function listarClientes(marcenariaId: string, busca = '', situacao: Situacao = 'ativos') {
  const filtros = ['marcenaria_id = $1', `nome ILIKE $2 ESCAPE '\\'`]
  const valores: unknown[] = [marcenariaId, `%${escaparCuringas(busca.trim())}%`]
  if (situacao !== 'todos') { filtros.push('ativo = $3'); valores.push(situacao === 'ativos') }
  return (await pool.query(`SELECT * FROM cliente WHERE ${filtros.join(' AND ')} ORDER BY nome`, valores)).rows
}

export async function criarCliente(marcenariaId: string, dados: DadosCliente) {
  const resultado = await pool.query(
    'INSERT INTO cliente (id, marcenaria_id, nome, telefone, email, endereco) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [randomUUID(), marcenariaId, dados.nome, vazioComoNulo(dados.telefone), vazioComoNulo(dados.email), vazioComoNulo(dados.endereco)],
  )
  return resultado.rows[0]
}

export async function atualizarCliente(id: string, marcenariaId: string, dados: DadosCliente) {
  const resultado = await pool.query(
    `UPDATE cliente SET nome=$3, telefone=$4, email=$5, endereco=$6, atualizado_em=now()
     WHERE id=$1 AND marcenaria_id=$2 RETURNING *`,
    [id, marcenariaId, dados.nome, vazioComoNulo(dados.telefone), vazioComoNulo(dados.email), vazioComoNulo(dados.endereco)],
  )
  return resultado.rows[0] ?? null
}

// Inativar e reativar só alternam `ativo`: nada é apagado (RF10, AGENTS §5.2, D021).
export async function definirSituacaoCliente(id: string, marcenariaId: string, ativo: boolean) {
  const resultado = await pool.query(
    'UPDATE cliente SET ativo=$3, atualizado_em=now() WHERE id=$1 AND marcenaria_id=$2 RETURNING id', [id, marcenariaId, ativo])
  return resultado.rowCount === 1
}

// Usado pelo orçamento, dentro da transação dele: o cliente precisa ser da mesma marcenaria.
export async function buscarCliente(c: PoolClient, id: string, marcenariaId: string) {
  const resultado = await c.query<{ id: string; ativo: boolean }>(
    'SELECT id, ativo FROM cliente WHERE id=$1 AND marcenaria_id=$2', [id, marcenariaId])
  return resultado.rows[0] ?? null
}
