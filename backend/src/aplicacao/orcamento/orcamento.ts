import type { PoolClient } from 'pg'
import { pool } from '../../infra/banco/pool'
import { ErroHttp } from '../../api/erros/erro-http'
import { calcularOrcamento, multiplicadorEquivalente } from '../../dominio/orcamento/calculo'
import * as repositorio from '../../infra/repositorios/orcamento-repositorio'
import type { Cabecalho, TipoItem } from '../../infra/repositorios/orcamento-repositorio'

// Casos de uso do orçamento (arquitetura.md §3): orquestram transação, repositório e domínio.
// Toda alteração segue o mesmo caminho (D019): trava o orçamento, altera a composição,
// o domínio calcula uma única vez, os totais são gravados e a resposta volta completa.
// Se o domínio recusar a entrada (ErroCalculo), a transação é desfeita e nada é gravado.

export type EntradaItem =
  | { origem: 'catalogo'; tipo: TipoItem; catalogoId: string; quantidade: string }
  | { origem: 'avulso'; tipo: TipoItem; descricao: string; unidade: string; quantidade: string; valorUnitario: string }

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

async function recalcular(c: PoolClient, marcenariaId: string, id: string) {
  const { orcamento, itens, custos } = (await repositorio.lerOrcamento(c, marcenariaId, id))!
  const resultado = calcularOrcamento({
    itens: itens.map((i) => ({ tipo: i.tipo, quantidade: i.quantidade, valorUnitario: i.valor_unitario })),
    custosAdicionais: custos.map((custo) => custo.valor),
    modoLucro: orcamento.modo_lucro,
    percentualLucro: orcamento.percentual_lucro,
    regraArredondamento: orcamento.regra_arredondamento,
  })
  await repositorio.gravarCalculo(c, id, itens.map((i) => i.id), resultado)
}

// Resposta da API em camelCase. Todos os valores vêm gravados pelo domínio; nada é somado aqui.
async function montarResposta(c: PoolClient, marcenariaId: string, id: string) {
  const dados = await repositorio.lerOrcamento(c, marcenariaId, id)
  if (!dados) return null
  const { orcamento: o, itens, custos } = dados
  return {
    id: o.id,
    clienteNome: o.cliente_nome,
    descricaoProjeto: o.descricao_projeto,
    dataEmissao: o.data_emissao,
    dataValidade: o.data_validade,
    situacao: o.situacao,
    modoLucro: o.modo_lucro,
    percentualLucro: o.percentual_lucro,
    regraArredondamento: o.regra_arredondamento,
    itens: itens.map((i) => ({
      id: i.id, tipo: i.tipo, materialId: i.material_id, servicoId: i.servico_id,
      descricao: i.descricao, unidade: i.unidade, quantidade: i.quantidade,
      valorUnitario: i.valor_unitario, valorLinha: i.valor_linha,
      valorAjustadoManualmente: i.valor_ajustado_manualmente,
    })),
    custosAdicionais: custos.map((custo) => ({ id: custo.id, descricao: custo.descricao, valor: custo.valor })),
    // Memorial de cálculo (RF31), na ordem de regras-de-calculo.md §5.
    memorial: {
      subtotalMateriais: o.subtotal_materiais,
      subtotalServicos: o.subtotal_servicos,
      totalAdicionais: o.total_adicionais,
      custoDiretoTotal: o.custo_direto_total,
      valorLucro: o.valor_lucro,
      multiplicadorEquivalente: multiplicadorEquivalente(o.modo_lucro, o.percentual_lucro),
      ajusteArredondamento: o.ajuste_arredondamento,
      precoFinal: o.preco_final,
    },
  }
}

export type Orcamento = NonNullable<Awaited<ReturnType<typeof montarResposta>>>

// `alteracao` devolve false quando o item ou custo indicado não pertence ao orçamento.
async function alterar(marcenariaId: string, id: string, alteracao: (c: PoolClient) => Promise<boolean | void>) {
  return emTransacao(async (c) => {
    if (!await repositorio.travarOrcamento(c, marcenariaId, id)) throw new ErroHttp(404, 'Orçamento não encontrado')
    if (await alteracao(c) === false) throw new ErroHttp(404, 'Registro não encontrado')
    await recalcular(c, marcenariaId, id)
    return (await montarResposta(c, marcenariaId, id))!
  })
}

export function criarOrcamento(marcenariaId: string, cabecalho: Cabecalho): Promise<Orcamento> {
  return emTransacao(async (c) => {
    const id = await repositorio.inserirOrcamento(c, marcenariaId, cabecalho)
    await recalcular(c, marcenariaId, id)
    return (await montarResposta(c, marcenariaId, id))!
  })
}

export async function consultarOrcamento(marcenariaId: string, id: string): Promise<Orcamento> {
  const c = await pool.connect()
  try {
    const orcamento = await montarResposta(c, marcenariaId, id)
    if (!orcamento) throw new ErroHttp(404, 'Orçamento não encontrado')
    return orcamento
  } finally {
    c.release()
  }
}

export const alterarCabecalho = (marcenariaId: string, id: string, cabecalho: Cabecalho) =>
  alterar(marcenariaId, id, (c) => repositorio.atualizarCabecalho(c, id, cabecalho))

// Item do catálogo: descrição, unidade e valor são copiados no momento da inclusão (RN08, RF14).
export const adicionarItem = (marcenariaId: string, id: string, item: EntradaItem) =>
  alterar(marcenariaId, id, async (c) => {
    if (item.origem === 'avulso') {
      await repositorio.inserirItem(c, id, { ...item, materialId: null, servicoId: null })
      return
    }
    const origem = await repositorio.buscarNoCatalogo(c, marcenariaId, item.tipo, item.catalogoId)
    if (!origem) throw new ErroHttp(404, 'Item do catálogo não encontrado ou inativo')
    await repositorio.inserirItem(c, id, {
      tipo: item.tipo,
      materialId: item.tipo === 'material' ? item.catalogoId : null,
      servicoId: item.tipo === 'servico' ? item.catalogoId : null,
      descricao: origem.nome,
      unidade: origem.unidade,
      quantidade: item.quantidade,
      valorUnitario: origem.valor,
    })
  })

export const alterarItem = (marcenariaId: string, id: string, itemId: string, quantidade: string, valorUnitario: string) =>
  alterar(marcenariaId, id, (c) => repositorio.atualizarItem(c, id, itemId, quantidade, valorUnitario))

export const removerItem = (marcenariaId: string, id: string, itemId: string) =>
  alterar(marcenariaId, id, (c) => repositorio.removerItem(c, id, itemId))

export const adicionarCustoAdicional = (marcenariaId: string, id: string, descricao: string, valor: string) =>
  alterar(marcenariaId, id, (c) => repositorio.inserirCustoAdicional(c, id, descricao, valor))

export const alterarCustoAdicional = (marcenariaId: string, id: string, custoId: string, descricao: string, valor: string) =>
  alterar(marcenariaId, id, (c) => repositorio.atualizarCustoAdicional(c, id, custoId, descricao, valor))

export const removerCustoAdicional = (marcenariaId: string, id: string, custoId: string) =>
  alterar(marcenariaId, id, (c) => repositorio.removerCustoAdicional(c, id, custoId))
