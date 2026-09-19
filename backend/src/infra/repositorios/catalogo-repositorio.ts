import { randomUUID } from 'node:crypto'
import { pool } from '../banco/pool'

export type Tipo = 'material' | 'servico'
type Dados = Record<string, string | undefined>
export type Situacao = 'ativos' | 'inativos' | 'todos'

// Só existem duas tabelas possíveis; o nome nunca vem do cliente, então a interpolação é segura.
const COLUNAS = {
  material: { extra: 'unidade', valor: 'custo_unitario', dadoExtra: 'unidade', dadoValor: 'custoUnitario' },
  servico: { extra: 'tipo_cobranca', valor: 'valor_unitario', dadoExtra: 'tipoCobranca', dadoValor: 'valorUnitario' },
} as const

const escaparCuringas = (texto: string) => texto.replace(/[\\%_]/g, '\\$&')

export async function listarCatalogo(tipo: Tipo, marcenariaId: string, busca = '', situacao: Situacao = 'ativos') {
  const filtros = ['marcenaria_id = $1', `nome ILIKE $2 ESCAPE '\\'`]
  const valores: unknown[] = [marcenariaId, `%${escaparCuringas(busca.trim())}%`]
  if (situacao !== 'todos') { filtros.push('ativo = $3'); valores.push(situacao === 'ativos') }
  return (await pool.query(`SELECT * FROM ${tipo} WHERE ${filtros.join(' AND ')} ORDER BY nome`, valores)).rows
}

export async function criarCatalogo(tipo: Tipo, marcenariaId: string, dados: Dados) {
  const c = COLUNAS[tipo]
  const resultado = await pool.query(
    `INSERT INTO ${tipo} (id, marcenaria_id, nome, descricao, ${c.extra}, ${c.valor}) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [randomUUID(), marcenariaId, dados.nome, dados.descricao || null, dados[c.dadoExtra], dados[c.dadoValor]],
  )
  return resultado.rows[0]
}

export async function atualizarCatalogo(tipo: Tipo, id: string, marcenariaId: string, dados: Dados) {
  const c = COLUNAS[tipo]
  const resultado = await pool.query(
    `UPDATE ${tipo} SET nome=$1, descricao=$2, ${c.extra}=$3, ${c.valor}=$4, atualizado_em=now() WHERE id=$5 AND marcenaria_id=$6 RETURNING *`,
    [dados.nome, dados.descricao || null, dados[c.dadoExtra], dados[c.dadoValor], id, marcenariaId],
  )
  return resultado.rows[0] ?? null
}

// Inativar e reativar só alternam a coluna `ativo`: nada é apagado nem recriado (RNF10).
export async function definirSituacaoCatalogo(tipo: Tipo, id: string, marcenariaId: string, ativo: boolean) {
  const resultado = await pool.query(
    `UPDATE ${tipo} SET ativo=$3, atualizado_em=now() WHERE id=$1 AND marcenaria_id=$2 RETURNING id`,
    [id, marcenariaId, ativo],
  )
  return resultado.rowCount === 1
}
