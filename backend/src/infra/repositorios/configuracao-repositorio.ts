import type { Pool, PoolClient } from 'pg'
import { pool } from '../banco/pool'
import type { ModoLucro, RegraArredondamento } from '../../dominio/orcamento/calculo'

// Configuração da marcenaria (RF05, RF19–RF22, D024). Todo SQL filtra pela marcenaria da sessão.
type Executor = Pool | PoolClient

export interface Padroes {
  modoLucro: ModoLucro
  percentualLucro: string
  regraArredondamento: RegraArredondamento
  validadeDias: number // dias, não é valor monetário
}

export interface DadosMarcenaria {
  nome: string
  responsavel: string
  telefone: string | null
  email: string | null
  cnpj: string | null
  endereco: string | null
}

// A linha nasce com os DEFAULT da tabela (007-configuracoes.sql) na primeira leitura:
// os padrões iniciais ficam num lugar só (D024).
export async function lerPadroes(executor: Executor, marcenariaId: string): Promise<Padroes> {
  await executor.query('INSERT INTO configuracao (marcenaria_id) VALUES ($1) ON CONFLICT DO NOTHING', [marcenariaId])
  const { rows } = await executor.query(
    `SELECT modo_lucro, percentual_lucro_padrao, regra_arredondamento, validade_padrao_dias
     FROM configuracao WHERE marcenaria_id=$1`, [marcenariaId])
  const linha = rows[0]
  return {
    modoLucro: linha.modo_lucro,
    percentualLucro: linha.percentual_lucro_padrao,
    regraArredondamento: linha.regra_arredondamento,
    validadeDias: linha.validade_padrao_dias,
  }
}

export async function gravarPadroes(marcenariaId: string, padroes: Padroes) {
  await pool.query(
    `INSERT INTO configuracao (marcenaria_id, modo_lucro, percentual_lucro_padrao, regra_arredondamento, validade_padrao_dias)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (marcenaria_id) DO UPDATE SET modo_lucro=$2, percentual_lucro_padrao=$3,
       regra_arredondamento=$4, validade_padrao_dias=$5, atualizado_em=now()`,
    [marcenariaId, padroes.modoLucro, padroes.percentualLucro, padroes.regraArredondamento, padroes.validadeDias],
  )
}

export async function lerDadosMarcenaria(marcenariaId: string): Promise<DadosMarcenaria | null> {
  const { rows } = await pool.query(
    'SELECT nome, responsavel, telefone, email_contato AS email, cnpj, endereco FROM marcenaria WHERE id=$1', [marcenariaId])
  return rows[0] ?? null
}

export async function gravarDadosMarcenaria(marcenariaId: string, dados: DadosMarcenaria) {
  await pool.query(
    'UPDATE marcenaria SET nome=$2, responsavel=$3, telefone=$4, email_contato=$5, cnpj=$6, endereco=$7 WHERE id=$1',
    [marcenariaId, dados.nome, dados.responsavel, dados.telefone, dados.email, dados.cnpj, dados.endereco],
  )
}
