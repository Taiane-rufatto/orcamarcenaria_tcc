import { randomUUID } from 'node:crypto'
import type { PoolClient } from 'pg'
import { pool } from '../banco/pool'
import { precoEstaAntigo } from '../../dominio/catalogo/preco-antigo'

// Material com fornecedor, histórico de custo e data da última atualização do preço (spec 020, RF16, RF50–RF52).
// Todo SQL filtra por marcenaria_id (AGENTS §5.1). O histórico é só acréscimo: nada é apagado.
export type Situacao = 'ativos' | 'inativos' | 'todos'
export interface DadosMaterial {
  nome: string
  descricao?: string
  unidade: string
  custoUnitario: string
  fornecedorId?: string | null
}

const escaparCuringas = (texto: string) => texto.replace(/[\\%_]/g, '\\$&')

// Uma linha do histórico: preço e fornecedor daquele momento.
async function registrarHistorico(c: PoolClient, materialId: string, marcenariaId: string) {
  await c.query(
    `INSERT INTO material_custo_historico (id, material_id, marcenaria_id, custo_unitario, fornecedor_id)
     SELECT $1, id, marcenaria_id, custo_unitario, fornecedor_id FROM material WHERE id=$2 AND marcenaria_id=$3`,
    [randomUUID(), materialId, marcenariaId],
  )
}

async function emTransacao<T>(operacao: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect()
  try {
    await c.query('BEGIN')
    const resultado = await operacao(c)
    await c.query('COMMIT')
    return resultado
  } catch (erro) {
    await c.query('ROLLBACK')
    throw erro
  } finally {
    c.release()
  }
}

// `dias_desde_atualizacao` vem do banco (dias inteiros); o domínio decide se o preço está antigo (RN15).
export async function listarMateriais(marcenariaId: string, busca = '', situacao: Situacao = 'ativos') {
  const filtros = ['m.marcenaria_id = $1', `m.nome ILIKE $2 ESCAPE '\\'`]
  const valores: unknown[] = [marcenariaId, `%${escaparCuringas(busca.trim())}%`]
  if (situacao !== 'todos') { filtros.push('m.ativo = $3'); valores.push(situacao === 'ativos') }
  const { rows } = await pool.query(
    `SELECT m.*, f.nome AS fornecedor_nome,
            floor(extract(epoch FROM (now() - m.custo_atualizado_em)) / 86400)::int AS dias_desde_atualizacao
     FROM material m LEFT JOIN fornecedor f ON f.id = m.fornecedor_id
     WHERE ${filtros.join(' AND ')} ORDER BY m.nome`,
    valores,
  )
  return rows.map((linha) => ({ ...linha, preco_antigo: precoEstaAntigo(linha.dias_desde_atualizacao) }))
}

export function criarMaterial(marcenariaId: string, dados: DadosMaterial) {
  return emTransacao(async (c) => {
    const id = randomUUID()
    const { rows } = await c.query(
      `INSERT INTO material (id, marcenaria_id, nome, descricao, unidade, custo_unitario, fornecedor_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, marcenariaId, dados.nome, dados.descricao || null, dados.unidade, dados.custoUnitario, dados.fornecedorId ?? null],
    )
    await registrarHistorico(c, id, marcenariaId)
    return rows[0]
  })
}

// Trocar o custo ou o fornecedor renova a data do preço e grava uma linha no histórico.
// Mudar só nome, descrição ou unidade não mexe nos dois (o preço não foi tocado).
export function atualizarMaterial(id: string, marcenariaId: string, dados: DadosMaterial) {
  return emTransacao(async (c) => {
    const atual = await c.query<{ mudou: boolean }>(
      `SELECT (custo_unitario IS DISTINCT FROM $3::numeric OR fornecedor_id IS DISTINCT FROM $4::uuid) AS mudou
       FROM material WHERE id=$1 AND marcenaria_id=$2 FOR UPDATE`,
      [id, marcenariaId, dados.custoUnitario, dados.fornecedorId ?? null],
    )
    if (atual.rowCount === 0) return null
    const mudou = atual.rows[0].mudou
    const { rows } = await c.query(
      `UPDATE material SET nome=$3, descricao=$4, unidade=$5, custo_unitario=$6, fornecedor_id=$7, atualizado_em=now(),
         custo_atualizado_em = CASE WHEN $8 THEN now() ELSE custo_atualizado_em END
       WHERE id=$1 AND marcenaria_id=$2 RETURNING *`,
      [id, marcenariaId, dados.nome, dados.descricao || null, dados.unidade, dados.custoUnitario, dados.fornecedorId ?? null, mudou],
    )
    if (mudou) await registrarHistorico(c, id, marcenariaId)
    return rows[0]
  })
}

// "O preço continua o mesmo": renova a data e registra a confirmação no histórico, sem mudar o custo.
export function confirmarPreco(id: string, marcenariaId: string) {
  return emTransacao(async (c) => {
    const { rows } = await c.query(
      'UPDATE material SET custo_atualizado_em=now() WHERE id=$1 AND marcenaria_id=$2 RETURNING *', [id, marcenariaId])
    if (rows.length === 0) return null
    await registrarHistorico(c, id, marcenariaId)
    return rows[0]
  })
}

// Últimas 20 linhas, da mais recente para a mais antiga. Nulo se o material não for da marcenaria.
export async function historicoDoMaterial(id: string, marcenariaId: string) {
  const dono = await pool.query('SELECT 1 FROM material WHERE id=$1 AND marcenaria_id=$2', [id, marcenariaId])
  if (dono.rowCount === 0) return null
  const { rows } = await pool.query(
    `SELECT h.custo_unitario, f.nome AS fornecedor_nome, h.registrado_em
     FROM material_custo_historico h LEFT JOIN fornecedor f ON f.id = h.fornecedor_id
     WHERE h.material_id=$1 AND h.marcenaria_id=$2 ORDER BY h.registrado_em DESC LIMIT 20`,
    [id, marcenariaId],
  )
  return rows
}
