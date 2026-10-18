import { pool } from '../../infra/banco/pool'
import {
  progressoDaMeta, resumirCobranca, resumirMes, variacaoDePreco, type LinhaCobranca, type LinhaPainel,
} from '../../dominio/painel/painel'
import { listarDoMes, materiaisMaisUsados, mesAtual, vencerOrcamentos } from '../../infra/repositorios/orcamento-repositorio'
import { lerMeta } from '../../infra/repositorios/configuracao-repositorio'

// Painel do mês (specs 019 e 024): lê os orçamentos do mês e do mês anterior, aplica o vencimento (RF36) e deixa o
// domínio resumir. Tudo numa transação: as linhas e as contas enxergam o mesmo instante. Só lê valores já gravados.

type Linha = Awaited<ReturnType<typeof listarDoMes>>[number]

const paraPainel = (l: Linha): LinhaPainel => ({ situacao: l.situacao, precoFinal: l.preco_final, custoDiretoTotal: l.custo_direto_total })
const paraCobranca = (l: Linha): LinhaCobranca => ({
  situacao: l.situacao, precoFinal: l.preco_final, subtotalServicos: l.subtotal_servicos, horas: l.horas, valorDasHoras: l.valor_das_horas,
})

// "2026-01" → "2025-12". Aritmética simples de calendário; não depende do banco.
function mesAnterior(mes: string): string {
  const [ano, numero] = mes.split('-').map(Number)
  return numero === 1 ? `${ano - 1}-12` : `${ano}-${String(numero - 1).padStart(2, '0')}`
}

export async function painelDoMes(marcenariaId: string, mes?: string) {
  const c = await pool.connect()
  try {
    await c.query('BEGIN')
    await vencerOrcamentos(c, marcenariaId)
    const mesConsultado = mes ?? await mesAtual(c)
    const linhas = await listarDoMes(c, marcenariaId, mesConsultado)
    const linhasAnteriores = await listarDoMes(c, marcenariaId, mesAnterior(mesConsultado))
    const materiais = await materiaisMaisUsados(c, marcenariaId)
    const { metaDoMes } = await lerMeta(c, marcenariaId)
    await c.query('COMMIT')

    const resumo = resumirMes(linhas.map(paraPainel))
    const cobranca = resumirCobranca(linhas.map(paraCobranca))
    const cobrancaAnterior = resumirCobranca(linhasAnteriores.map(paraCobranca))

    return {
      mes: mesConsultado,
      ...resumo,
      // RN20: só compara o aprovado do mês com a meta da pessoa (opcional).
      meta: progressoDaMeta(resumo.aprovados.valor, metaDoMes),
      // RN18 e RN19: quanto a pessoa cobra pela mão de obra e se a hora subiu ou caiu em relação ao mês anterior.
      cobranca: {
        ...cobranca,
        valorMedioDaHoraNoMesAnterior: cobrancaAnterior.valorMedioDaHora,
        variacaoDaHora: variacaoDePreco(cobrancaAnterior.valorMedioDaHora, cobranca.valorMedioDaHora),
      },
      // RN19: materiais mais usados nos últimos 90 dias e se o custo subiu, caiu ou ficou estável.
      precos: materiais.map((m) => ({
        materialId: m.material_id,
        nome: m.nome,
        usos: m.usos,
        custoAtual: m.custo_atual,
        custoAnterior: m.custo_anterior,
        variacao: variacaoDePreco(m.custo_anterior, m.custo_atual),
      })),
    }
  } catch (erro) {
    await c.query('ROLLBACK')
    throw erro
  } finally {
    c.release()
  }
}
