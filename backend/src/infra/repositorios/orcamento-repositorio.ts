import { randomUUID } from 'node:crypto'
import type { PoolClient } from 'pg'
import type { ModoLucro, RegraArredondamento, ResultadoCalculo } from '../../dominio/orcamento/calculo'

// Acesso a dados do orçamento. Só SQL: quem decide preço é o domínio (arquitetura.md §3).
// Toda consulta que parte de um orçamento filtra por marcenaria_id; itens e custos adicionais
// só são tocados depois que o caso de uso travou o orçamento da marcenaria da sessão.

export type TipoItem = 'material' | 'servico'

export interface Cabecalho {
  clienteNome: string
  descricaoProjeto: string
  dataEmissao: string
  dataValidade: string
  modoLucro: ModoLucro
  percentualLucro: string
  regraArredondamento: RegraArredondamento
}

export interface NovoItem {
  tipo: TipoItem
  materialId: string | null
  servicoId: string | null
  descricao: string
  unidade: string
  quantidade: string
  valorUnitario: string
}

export async function inserirOrcamento(c: PoolClient, marcenariaId: string, dados: Cabecalho): Promise<string> {
  const id = randomUUID()
  await c.query(
    `INSERT INTO orcamento (id, marcenaria_id, cliente_nome, descricao_projeto, data_emissao, data_validade,
       modo_lucro, percentual_lucro, regra_arredondamento)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, marcenariaId, dados.clienteNome, dados.descricaoProjeto, dados.dataEmissao, dados.dataValidade,
      dados.modoLucro, dados.percentualLucro, dados.regraArredondamento],
  )
  return id
}

// Trava o orçamento até o fim da transação: duas alterações simultâneas não gravam totais cruzados.
export async function travarOrcamento(c: PoolClient, marcenariaId: string, id: string): Promise<boolean> {
  const resultado = await c.query('SELECT id FROM orcamento WHERE id=$1 AND marcenaria_id=$2 FOR UPDATE', [id, marcenariaId])
  return resultado.rowCount === 1
}

export async function atualizarCabecalho(c: PoolClient, id: string, dados: Cabecalho) {
  await c.query(
    `UPDATE orcamento SET cliente_nome=$2, descricao_projeto=$3, data_emissao=$4, data_validade=$5,
       modo_lucro=$6, percentual_lucro=$7, regra_arredondamento=$8, atualizado_em=now()
     WHERE id=$1`,
    [id, dados.clienteNome, dados.descricaoProjeto, dados.dataEmissao, dados.dataValidade,
      dados.modoLucro, dados.percentualLucro, dados.regraArredondamento],
  )
}

// Item do catálogo que pode entrar no orçamento: da mesma marcenaria e ativo.
export async function buscarNoCatalogo(c: PoolClient, marcenariaId: string, tipo: TipoItem, id: string) {
  const sql = tipo === 'material'
    ? 'SELECT nome, unidade, custo_unitario AS valor FROM material WHERE id=$1 AND marcenaria_id=$2 AND ativo'
    : `SELECT nome, CASE tipo_cobranca WHEN 'hora' THEN 'h' ELSE 'un' END AS unidade, valor_unitario AS valor
       FROM servico WHERE id=$1 AND marcenaria_id=$2 AND ativo`
  const resultado = await c.query<{ nome: string; unidade: string; valor: string }>(sql, [id, marcenariaId])
  return resultado.rows[0] ?? null
}

export async function inserirItem(c: PoolClient, orcamentoId: string, item: NovoItem) {
  await c.query(
    `INSERT INTO orcamento_item (id, orcamento_id, tipo, material_id, servico_id, descricao, unidade, quantidade, valor_unitario, ordem)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,
       (SELECT COALESCE(MAX(ordem), 0) + 1 FROM orcamento_item WHERE orcamento_id=$2))`,
    [randomUUID(), orcamentoId, item.tipo, item.materialId, item.servicoId, item.descricao, item.unidade,
      item.quantidade, item.valorUnitario],
  )
}

// Valor diferente do copiado do catálogo marca o item como ajustado só neste orçamento (US08).
// Item avulso não tem valor de catálogo para comparar e nunca é marcado.
export async function atualizarItem(c: PoolClient, orcamentoId: string, itemId: string, quantidade: string, valorUnitario: string) {
  const resultado = await c.query(
    `UPDATE orcamento_item SET quantidade=$3, valor_unitario=$4,
       valor_ajustado_manualmente = valor_ajustado_manualmente
         OR ((material_id IS NOT NULL OR servico_id IS NOT NULL) AND valor_unitario <> $4::numeric)
     WHERE id=$2 AND orcamento_id=$1`,
    [orcamentoId, itemId, quantidade, valorUnitario],
  )
  return resultado.rowCount === 1
}

// Remover um item é editar a composição do rascunho, não excluir um cadastro (AGENTS §5.2).
export async function removerItem(c: PoolClient, orcamentoId: string, itemId: string) {
  const resultado = await c.query('DELETE FROM orcamento_item WHERE id=$2 AND orcamento_id=$1', [orcamentoId, itemId])
  return resultado.rowCount === 1
}

export async function inserirCustoAdicional(c: PoolClient, orcamentoId: string, descricao: string, valor: string) {
  await c.query(
    `INSERT INTO orcamento_custo_adicional (id, orcamento_id, descricao, valor, ordem)
     VALUES ($1,$2,$3,$4, (SELECT COALESCE(MAX(ordem), 0) + 1 FROM orcamento_custo_adicional WHERE orcamento_id=$2))`,
    [randomUUID(), orcamentoId, descricao, valor],
  )
}

export async function atualizarCustoAdicional(c: PoolClient, orcamentoId: string, custoId: string, descricao: string, valor: string) {
  const resultado = await c.query(
    'UPDATE orcamento_custo_adicional SET descricao=$3, valor=$4 WHERE id=$2 AND orcamento_id=$1',
    [orcamentoId, custoId, descricao, valor],
  )
  return resultado.rowCount === 1
}

export async function removerCustoAdicional(c: PoolClient, orcamentoId: string, custoId: string) {
  const resultado = await c.query('DELETE FROM orcamento_custo_adicional WHERE id=$2 AND orcamento_id=$1', [orcamentoId, custoId])
  return resultado.rowCount === 1
}

export async function lerOrcamento(c: PoolClient, marcenariaId: string, id: string) {
  const orcamento = (await c.query('SELECT * FROM orcamento WHERE id=$1 AND marcenaria_id=$2', [id, marcenariaId])).rows[0]
  if (!orcamento) return null
  const itens = (await c.query('SELECT * FROM orcamento_item WHERE orcamento_id=$1 ORDER BY ordem', [id])).rows
  const custos = (await c.query('SELECT * FROM orcamento_custo_adicional WHERE orcamento_id=$1 ORDER BY ordem', [id])).rows
  return { orcamento, itens, custos }
}

// Grava o que o domínio calculou: valor de cada linha e totais do orçamento (D019).
export async function gravarCalculo(c: PoolClient, orcamentoId: string, itemIds: string[], resultado: ResultadoCalculo) {
  for (const [i, itemId] of itemIds.entries()) {
    await c.query('UPDATE orcamento_item SET valor_linha=$2 WHERE id=$1', [itemId, resultado.valoresLinha[i]])
  }
  await c.query(
    `UPDATE orcamento SET subtotal_materiais=$2, subtotal_servicos=$3, total_adicionais=$4, custo_direto_total=$5,
       valor_lucro=$6, ajuste_arredondamento=$7, preco_final=$8, atualizado_em=now()
     WHERE id=$1`,
    [orcamentoId, resultado.subtotalMateriais, resultado.subtotalServicos, resultado.totalAdicionais,
      resultado.custoDiretoTotal, resultado.valorLucro, resultado.ajusteArredondamento, resultado.precoFinal],
  )
}
