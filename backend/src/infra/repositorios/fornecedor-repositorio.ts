import { randomUUID } from 'node:crypto'
import { pool } from '../banco/pool'

// Cadastro de fornecedores (RF49, spec 020). Todo SQL filtra por marcenaria_id (AGENTS §5.1).
export type Situacao = 'ativos' | 'inativos' | 'todos'
export interface DadosFornecedor { nome: string; telefone?: string; endereco?: string }

const escaparCuringas = (texto: string) => texto.replace(/[\\%_]/g, '\\$&')

export async function listarFornecedores(marcenariaId: string, busca = '', situacao: Situacao = 'ativos') {
  const filtros = ['f.marcenaria_id = $1', `f.nome ILIKE $2 ESCAPE '\\'`]
  const valores: unknown[] = [marcenariaId, `%${escaparCuringas(busca.trim())}%`]
  if (situacao !== 'todos') { filtros.push('f.ativo = $3'); valores.push(situacao === 'ativos') }
  // `padrao` marca o fornecedor padrão da marcenaria (já escolhido no material novo).
  return (await pool.query(
    `SELECT f.*, COALESCE(f.id = c.fornecedor_padrao_id, false) AS padrao
     FROM fornecedor f LEFT JOIN configuracao c ON c.marcenaria_id = f.marcenaria_id
     WHERE ${filtros.join(' AND ')} ORDER BY f.nome`,
    valores,
  )).rows
}

export async function criarFornecedor(marcenariaId: string, dados: DadosFornecedor) {
  const resultado = await pool.query(
    'INSERT INTO fornecedor (id, marcenaria_id, nome, telefone, endereco) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [randomUUID(), marcenariaId, dados.nome, dados.telefone || null, dados.endereco || null],
  )
  return resultado.rows[0]
}

export async function atualizarFornecedor(id: string, marcenariaId: string, dados: DadosFornecedor) {
  const resultado = await pool.query(
    'UPDATE fornecedor SET nome=$3, telefone=$4, endereco=$5, atualizado_em=now() WHERE id=$1 AND marcenaria_id=$2 RETURNING *',
    [id, marcenariaId, dados.nome, dados.telefone || null, dados.endereco || null],
  )
  return resultado.rows[0] ?? null
}

// Inativar e reativar só alternam `ativo`: nada é apagado, e o fornecedor segue no histórico de preços (RNF10).
export async function definirSituacaoFornecedor(id: string, marcenariaId: string, ativo: boolean) {
  const resultado = await pool.query(
    'UPDATE fornecedor SET ativo=$3, atualizado_em=now() WHERE id=$1 AND marcenaria_id=$2 RETURNING id', [id, marcenariaId, ativo])
  // Fornecedor inativo não pode ser o padrão: a escolha some junto.
  if (!ativo && resultado.rowCount === 1) {
    await pool.query('UPDATE configuracao SET fornecedor_padrao_id=NULL WHERE marcenaria_id=$1 AND fornecedor_padrao_id=$2', [marcenariaId, id])
  }
  return resultado.rowCount === 1
}

// O material só pode apontar para fornecedor da mesma marcenaria e ativo.
export async function fornecedorAtivoDaMarcenaria(id: string, marcenariaId: string) {
  const { rowCount } = await pool.query('SELECT 1 FROM fornecedor WHERE id=$1 AND marcenaria_id=$2 AND ativo', [id, marcenariaId])
  return rowCount === 1
}

// Escolhe o fornecedor padrão (só ativo, da própria marcenaria). A linha da configuração nasce se ainda não existir.
export async function definirFornecedorPadrao(id: string, marcenariaId: string) {
  if (!await fornecedorAtivoDaMarcenaria(id, marcenariaId)) return false
  await pool.query(
    `INSERT INTO configuracao (marcenaria_id, fornecedor_padrao_id) VALUES ($1,$2)
     ON CONFLICT (marcenaria_id) DO UPDATE SET fornecedor_padrao_id=$2, atualizado_em=now()`,
    [marcenariaId, id],
  )
  return true
}

export async function removerFornecedorPadrao(marcenariaId: string) {
  await pool.query('UPDATE configuracao SET fornecedor_padrao_id=NULL, atualizado_em=now() WHERE marcenaria_id=$1', [marcenariaId])
}
