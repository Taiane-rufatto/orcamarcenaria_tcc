import { Router, type Response } from 'express'
import { z } from 'zod'
import { ErroHttp } from '../erros/erro-http'
import { exigirAutenticacao } from '../middlewares/autenticacao'
import { alteracaoItemSchema, cabecalhoSchema, custoAdicionalSchema, itemSchema } from '../validacoes/orcamento'
import * as casos from '../../aplicacao/orcamento/orcamento'

// Toda resposta de escrita devolve o orçamento completo, já recalculado pelo domínio (D019).
export const rotasOrcamentos = Router()
rotasOrcamentos.use('/orcamentos', exigirAutenticacao)

// marcenariaId vem sempre da sessão (AGENTS §5.1), nunca do corpo ou da URL.
const marcenaria = (res: Response) => res.locals.autenticacao!.marcenariaId

// id malformado não pode chegar ao banco (viraria erro 500): trata como não encontrado.
function lerId(valor: unknown): string {
  const id = z.uuid().safeParse(valor)
  if (!id.success) throw new ErroHttp(404, 'Registro não encontrado')
  return id.data
}

rotasOrcamentos.post('/orcamentos', async (req, res) => {
  res.status(201).json(await casos.criarOrcamento(marcenaria(res), cabecalhoSchema.parse(req.body)))
})

rotasOrcamentos.get('/orcamentos/:id', async (req, res) => {
  res.json(await casos.consultarOrcamento(marcenaria(res), lerId(req.params.id)))
})

rotasOrcamentos.put('/orcamentos/:id', async (req, res) => {
  res.json(await casos.alterarCabecalho(marcenaria(res), lerId(req.params.id), cabecalhoSchema.parse(req.body)))
})

rotasOrcamentos.post('/orcamentos/:id/itens', async (req, res) => {
  res.status(201).json(await casos.adicionarItem(marcenaria(res), lerId(req.params.id), itemSchema.parse(req.body)))
})

rotasOrcamentos.put('/orcamentos/:id/itens/:itemId', async (req, res) => {
  const { quantidade, valorUnitario } = alteracaoItemSchema.parse(req.body)
  res.json(await casos.alterarItem(marcenaria(res), lerId(req.params.id), lerId(req.params.itemId), quantidade, valorUnitario))
})

rotasOrcamentos.delete('/orcamentos/:id/itens/:itemId', async (req, res) => {
  res.json(await casos.removerItem(marcenaria(res), lerId(req.params.id), lerId(req.params.itemId)))
})

rotasOrcamentos.post('/orcamentos/:id/custos-adicionais', async (req, res) => {
  const { descricao, valor } = custoAdicionalSchema.parse(req.body)
  res.status(201).json(await casos.adicionarCustoAdicional(marcenaria(res), lerId(req.params.id), descricao, valor))
})

rotasOrcamentos.put('/orcamentos/:id/custos-adicionais/:custoId', async (req, res) => {
  const { descricao, valor } = custoAdicionalSchema.parse(req.body)
  res.json(await casos.alterarCustoAdicional(marcenaria(res), lerId(req.params.id), lerId(req.params.custoId), descricao, valor))
})

rotasOrcamentos.delete('/orcamentos/:id/custos-adicionais/:custoId', async (req, res) => {
  res.json(await casos.removerCustoAdicional(marcenaria(res), lerId(req.params.id), lerId(req.params.custoId)))
})
