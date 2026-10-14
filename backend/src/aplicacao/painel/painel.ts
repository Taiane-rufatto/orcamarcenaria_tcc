import { pool } from '../../infra/banco/pool'
import { resumirMes } from '../../dominio/painel/painel'
import { listarDoMes, mesAtual, vencerOrcamentos } from '../../infra/repositorios/orcamento-repositorio'

// Painel do mês (spec 019): lê os orçamentos do mês, aplica o vencimento (RF36) e deixa o domínio resumir.
// Transação somente leitura depois do vencimento: as linhas e as contas enxergam o mesmo instante.
export async function painelDoMes(marcenariaId: string, mes?: string) {
  const c = await pool.connect()
  try {
    await c.query('BEGIN')
    await vencerOrcamentos(c, marcenariaId)
    const mesConsultado = mes ?? await mesAtual(c)
    const linhas = await listarDoMes(c, marcenariaId, mesConsultado)
    await c.query('COMMIT')
    return {
      mes: mesConsultado,
      ...resumirMes(linhas.map((l) => ({ situacao: l.situacao, precoFinal: l.preco_final, custoDiretoTotal: l.custo_direto_total }))),
    }
  } catch (erro) {
    await c.query('ROLLBACK')
    throw erro
  } finally {
    c.release()
  }
}
