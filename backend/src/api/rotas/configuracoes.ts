import { Router, type Response } from 'express'
import { exigirAutenticacao } from '../middlewares/autenticacao'
import { dadosMarcenariaSchema, padroesSchema } from '../validacoes/configuracoes'
import { multiplicadorEquivalente, validarLucro } from '../../dominio/orcamento/calculo'
import { pool } from '../../infra/banco/pool'
import {
  gravarDadosMarcenaria, gravarPadroes, lerDadosMarcenaria, lerPadroes,
} from '../../infra/repositorios/configuracao-repositorio'

// Página "Minha marcenaria" (RF05, RF19–RF22, D024). Só lê e grava; não há regra além de validar.
export const rotasConfiguracoes = Router()
rotasConfiguracoes.use('/configuracoes', exigirAutenticacao)

// marcenariaId vem sempre da sessão (AGENTS §5.1), nunca do corpo ou da URL.
const marcenaria = (res: Response) => res.locals.autenticacao!.marcenariaId

async function responder(marcenariaId: string) {
  const [dados, padroes] = await Promise.all([lerDadosMarcenaria(marcenariaId), lerPadroes(pool, marcenariaId)])
  return {
    marcenaria: dados,
    // O multiplicador vem do domínio, como no orçamento (D018): a tela não calcula.
    padroes: { ...padroes, multiplicadorEquivalente: multiplicadorEquivalente(padroes.modoLucro, padroes.percentualLucro) },
  }
}

rotasConfiguracoes.get('/configuracoes', async (_req, res) => {
  res.json(await responder(marcenaria(res)))
})

rotasConfiguracoes.put('/configuracoes/marcenaria', async (req, res) => {
  await gravarDadosMarcenaria(marcenaria(res), dadosMarcenariaSchema.parse(req.body))
  res.json(await responder(marcenaria(res)))
})

// Vale só para orçamentos novos (D024): nenhum orçamento existente é alterado.
rotasConfiguracoes.put('/configuracoes/padroes', async (req, res) => {
  const padroes = padroesSchema.parse(req.body)
  validarLucro(padroes.modoLucro, padroes.percentualLucro) // margem ≥ 100 → ErroCalculo → 400
  await gravarPadroes(marcenaria(res), padroes)
  res.json(await responder(marcenaria(res)))
})
