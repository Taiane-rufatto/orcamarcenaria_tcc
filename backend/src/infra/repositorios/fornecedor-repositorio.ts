import { randomUUID } from 'node:crypto'
import { pool } from '../banco/pool'

// Cadastro de fornecedores (RF49, spec 020). Todo SQL filtra por marcenaria_id (AGENTS §5.1).
export type Situacao = 'ativos' | 'inativos' | 'todos'
export interface DadosFornecedor { nome: string; telefone?: string }

const escaparCuringas = (texto: string) => texto.replace(/[\\%_]/g, '\\$&')

export async function listarFornecedores(marcenariaId: string, busca = '', situacao: Situacao = 'ativos') {
  const filtros = ['marcenaria_id = $1', `nome ILIKE $2 ESCAPE '\\'`]
  const valores: unknown[] = [marcenariaId, `%${escaparCuringas(busca.trim())}%`]
  if (situacao !== 'todos') { filtros.push('ativo = $3'); valores.push(situacao === 'ativos') }
  return (await pool.query(`SELECT * FROM fornecedor WHERE ${filtros.join(' AND ')} ORDER BY nome`, valores)).rows
}

export async function criarFornecedor(marcenariaId: string, dados: DadosFornecedor) {
  const resultado = await pool.query(
    'INSERT INTO fornecedor (id, marcenaria_id, nome, telefone) VALUES ($1,$2,$3,$4) RETURNING *',
    [randomUUID(), marcenariaId, dados.nome, dados.telefone || null],
  )
  return resultado.rows[0]
}

export async function atualizarFornecedor(id: string, marcenariaId: string, dados: DadosFornecedor) {
  const resultado = await pool.query(
    'UPDATE fornecedor SET nome=$3, telefone=$4, atualizado_em=now() WHERE id=$1 AND marcenaria_id=$2 RETURNING *',
    [id, marcenariaId, dados.nome, dados.telefone || null],
  )
  return resultado.rows[0] ?? null
}

// Inativar e reativar só alternam `ativo`: nada é apagado, e o fornecedor segue no histórico de preços (RNF10).
export async function definirSituacaoFornecedor(id: string, marcenariaId: string, ativo: boolean) {
  const resultado = await pool.query(
    'UPDATE fornecedor SET ativo=$3, atualizado_em=now() WHERE id=$1 AND marcenaria_id=$2 RETURNING id', [id, marcenariaId, ativo])
  return resultado.rowCount === 1
}

// O material só pode apontar para fornecedor da mesma marcenaria e ativo.
export async function fornecedorAtivoDaMarcenaria(id: string, marcenariaId: string) {
  const { rowCount } = await pool.query('SELECT 1 FROM fornecedor WHERE id=$1 AND marcenaria_id=$2 AND ativo', [id, marcenariaId])
  return rowCount === 1
}
