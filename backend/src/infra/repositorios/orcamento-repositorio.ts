import { randomUUID } from 'node:crypto'
import type { PoolClient } from 'pg'
import type { ModoLucro, RegraArredondamento, ResultadoCalculo } from '../../dominio/orcamento/calculo'

// Acesso a dados do orçamento. Só SQL: quem decide preço é o domínio (arquitetura.md §3).
// Todo comando filtra por marcenaria_id (AGENTS §5.1), mesmo quando o caso de uso já travou o
// orçamento: a garantia de isolamento fica no próprio SQL e não depende da ordem das chamadas.
// Convenção dos parâmetros: $1 = id do orçamento, $2 = marcenaria_id da sessão.

// Itens e custos adicionais não têm marcenaria_id próprio: o dono é verificado pelo orçamento.
const DO_ORCAMENTO_DA_MARCENARIA = 'orcamento_id IN (SELECT id FROM orcamento WHERE id=$1 AND marcenaria_id=$2)'

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
  valorUnitarioCatalogo: string | null // nulo no item avulso
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
// Devolve a situação, para o caso de uso só permitir alteração em rascunho (RN09).
export async function travarOrcamento(c: PoolClient, id: string, marcenariaId: string): Promise<string | null> {
  const resultado = await c.query<{ situacao: string }>(
    'SELECT situacao FROM orcamento WHERE id=$1 AND marcenaria_id=$2 FOR UPDATE', [id, marcenariaId])
  return resultado.rows[0]?.situacao ?? null
}

export async function atualizarCabecalho(c: PoolClient, id: string, marcenariaId: string, dados: Cabecalho) {
  const resultado = await c.query(
    `UPDATE orcamento SET cliente_nome=$3, descricao_projeto=$4, data_emissao=$5, data_validade=$6,
       modo_lucro=$7, percentual_lucro=$8, regra_arredondamento=$9, atualizado_em=now()
     WHERE id=$1 AND marcenaria_id=$2`,
    [id, marcenariaId, dados.clienteNome, dados.descricaoProjeto, dados.dataEmissao, dados.dataValidade,
      dados.modoLucro, dados.percentualLucro, dados.regraArredondamento],
  )
  return resultado.rowCount === 1
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

export async function inserirItem(c: PoolClient, id: string, marcenariaId: string, item: NovoItem) {
  const resultado = await c.query(
    `INSERT INTO orcamento_item (id, orcamento_id, tipo, material_id, servico_id, descricao, unidade,
       quantidade, valor_unitario, valor_unitario_catalogo, ordem)
     SELECT $3, o.id, $4, $5, $6, $7, $8, $9, $10, $11,
       (SELECT COALESCE(MAX(ordem), 0) + 1 FROM orcamento_item WHERE orcamento_id = o.id)
     FROM orcamento o WHERE o.id=$1 AND o.marcenaria_id=$2`,
    [id, marcenariaId, randomUUID(), item.tipo, item.materialId, item.servicoId, item.descricao, item.unidade,
      item.quantidade, item.valorUnitario, item.valorUnitarioCatalogo],
  )
  return resultado.rowCount === 1
}

// Só muda quantidade e valor. A marca de ajuste manual é calculada pelo banco comparando com
// valor_unitario_catalogo (ver 003-orcamento.sql): volta a falso se o valor do catálogo for restaurado.
export async function atualizarItem(c: PoolClient, id: string, marcenariaId: string, itemId: string, quantidade: string, valorUnitario: string) {
  const resultado = await c.query(
    `UPDATE orcamento_item SET quantidade=$4, valor_unitario=$5 WHERE id=$3 AND ${DO_ORCAMENTO_DA_MARCENARIA}`,
    [id, marcenariaId, itemId, quantidade, valorUnitario],
  )
  return resultado.rowCount === 1
}

// Remover um item é editar a composição do rascunho, não excluir um cadastro (AGENTS §5.2).
export async function removerItem(c: PoolClient, id: string, marcenariaId: string, itemId: string) {
  const resultado = await c.query(
    `DELETE FROM orcamento_item WHERE id=$3 AND ${DO_ORCAMENTO_DA_MARCENARIA}`, [id, marcenariaId, itemId])
  return resultado.rowCount === 1
}

export async function inserirCustoAdicional(c: PoolClient, id: string, marcenariaId: string, descricao: string, valor: string) {
  const resultado = await c.query(
    `INSERT INTO orcamento_custo_adicional (id, orcamento_id, descricao, valor, ordem)
     SELECT $3, o.id, $4, $5,
       (SELECT COALESCE(MAX(ordem), 0) + 1 FROM orcamento_custo_adicional WHERE orcamento_id = o.id)
     FROM orcamento o WHERE o.id=$1 AND o.marcenaria_id=$2`,
    [id, marcenariaId, randomUUID(), descricao, valor],
  )
  return resultado.rowCount === 1
}

export async function atualizarCustoAdicional(c: PoolClient, id: string, marcenariaId: string, custoId: string, descricao: string, valor: string) {
  const resultado = await c.query(
    `UPDATE orcamento_custo_adicional SET descricao=$4, valor=$5 WHERE id=$3 AND ${DO_ORCAMENTO_DA_MARCENARIA}`,
    [id, marcenariaId, custoId, descricao, valor],
  )
  return resultado.rowCount === 1
}

export async function removerCustoAdicional(c: PoolClient, id: string, marcenariaId: string, custoId: string) {
  const resultado = await c.query(
    `DELETE FROM orcamento_custo_adicional WHERE id=$3 AND ${DO_ORCAMENTO_DA_MARCENARIA}`, [id, marcenariaId, custoId])
  return resultado.rowCount === 1
}

export async function lerOrcamento(c: PoolClient, id: string, marcenariaId: string) {
  const orcamento = (await c.query('SELECT * FROM orcamento WHERE id=$1 AND marcenaria_id=$2', [id, marcenariaId])).rows[0]
  if (!orcamento) return null
  const itens = (await c.query(
    `SELECT * FROM orcamento_item WHERE ${DO_ORCAMENTO_DA_MARCENARIA} ORDER BY ordem`, [id, marcenariaId])).rows
  const custos = (await c.query(
    `SELECT * FROM orcamento_custo_adicional WHERE ${DO_ORCAMENTO_DA_MARCENARIA} ORDER BY ordem`, [id, marcenariaId])).rows
  return { orcamento, itens, custos }
}

// Grava o que o domínio calculou: valor de cada linha e totais do orçamento (D019).
export async function gravarCalculo(c: PoolClient, id: string, marcenariaId: string, itemIds: string[], resultado: ResultadoCalculo) {
  for (const [i, itemId] of itemIds.entries()) {
    await c.query(
      `UPDATE orcamento_item SET valor_linha=$4 WHERE id=$3 AND ${DO_ORCAMENTO_DA_MARCENARIA}`,
      [id, marcenariaId, itemId, resultado.valoresLinha[i]],
    )
  }
  await c.query(
    `UPDATE orcamento SET subtotal_materiais=$3, subtotal_servicos=$4, total_adicionais=$5, custo_direto_total=$6,
       valor_lucro=$7, ajuste_arredondamento=$8, preco_final=$9, atualizado_em=now()
     WHERE id=$1 AND marcenaria_id=$2`,
    [id, marcenariaId, resultado.subtotalMateriais, resultado.subtotalServicos, resultado.totalAdicionais,
      resultado.custoDiretoTotal, resultado.valorLucro, resultado.ajusteArredondamento, resultado.precoFinal],
  )
}

// ---------- Registro e situação (Spec 004) ----------

export type Situacao = 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'vencido'

export interface FiltrosListagem {
  busca?: string
  situacao?: Situacao
  de?: string
  ate?: string
}

// RF36: enviado com validade anterior a hoje passa a vencido. "Hoje" é a data de São Paulo,
// explícita para não depender do fuso configurado no servidor do banco.
export async function vencerOrcamentos(c: PoolClient, marcenariaId: string) {
  await c.query(
    `UPDATE orcamento SET situacao='vencido', atualizado_em=now()
     WHERE marcenaria_id=$1 AND situacao='enviado'
       AND data_validade < (now() AT TIME ZONE 'America/Sao_Paulo')::date`,
    [marcenariaId],
  )
}

const escaparCuringas = (texto: string) => texto.replace(/[\\%_]/g, '\\$&')

export async function listarOrcamentos(c: PoolClient, marcenariaId: string, filtros: FiltrosListagem) {
  const condicoes = ['marcenaria_id = $1']
  const valores: unknown[] = [marcenariaId]
  const filtrar = (condicao: string, valor: unknown) => { valores.push(valor); condicoes.push(condicao.replace('?', `$${valores.length}`)) }
  if (filtros.busca?.trim()) filtrar(`cliente_nome ILIKE ? ESCAPE '\\'`, `%${escaparCuringas(filtros.busca.trim())}%`)
  if (filtros.situacao) filtrar('situacao = ?', filtros.situacao)
  if (filtros.de) filtrar('data_emissao >= ?', filtros.de)
  if (filtros.ate) filtrar('data_emissao <= ?', filtros.ate)
  const resultado = await c.query(
    `SELECT id, numero, cliente_nome, descricao_projeto, data_emissao, data_validade, preco_final, situacao
     FROM orcamento WHERE ${condicoes.join(' AND ')}
     ORDER BY data_emissao DESC, criado_em DESC`,
    valores,
  )
  return resultado.rows
}

export async function temItens(c: PoolClient, id: string, marcenariaId: string): Promise<boolean> {
  const resultado = await c.query<{ tem: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM orcamento_item WHERE ${DO_ORCAMENTO_DA_MARCENARIA}) AS tem`, [id, marcenariaId])
  return resultado.rows[0].tem
}

// RN11: próximo número da marcenaria. A linha da marcenaria fica travada até o fim da transação,
// para que dois registros simultâneos não recebam o mesmo número; UNIQUE (marcenaria_id, numero) é a rede de segurança.
export async function reservarProximoNumero(c: PoolClient, marcenariaId: string): Promise<number> {
  await c.query('SELECT id FROM marcenaria WHERE id=$1 FOR UPDATE', [marcenariaId])
  const resultado = await c.query<{ proximo: number }>(
    'SELECT COALESCE(MAX(numero), 0) + 1 AS proximo FROM orcamento WHERE marcenaria_id=$1', [marcenariaId])
  return resultado.rows[0].proximo
}

export async function registrarOrcamento(c: PoolClient, id: string, marcenariaId: string, numero: number) {
  await c.query(
    `UPDATE orcamento SET numero=$3, situacao='enviado', atualizado_em=now()
     WHERE id=$1 AND marcenaria_id=$2 AND situacao='rascunho'`,
    [id, marcenariaId, numero],
  )
}

export async function mudarSituacao(c: PoolClient, id: string, marcenariaId: string, situacao: Situacao) {
  await c.query(
    'UPDATE orcamento SET situacao=$3, atualizado_em=now() WHERE id=$1 AND marcenaria_id=$2', [id, marcenariaId, situacao])
}
