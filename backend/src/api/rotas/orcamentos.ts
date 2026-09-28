import { Router, type Response } from 'express'
import { z } from 'zod'
import { ErroHttp } from '../erros/erro-http'
import { exigirAutenticacao } from '../middlewares/autenticacao'
import {
  alteracaoItemSchema, cabecalhoSchema, custoAdicionalSchema, filtrosListagemSchema, itemSchema, mudancaSituacaoSchema,
} from '../validacoes/orcamento'
import * as casos from '../../aplicacao/orcamento/orcamento'
import { gerarPdfOrcamento } from '../../aplicacao/orcamento/pdf'

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

rotasOrcamentos.get('/orcamentos', async (req, res) => {
  res.json(await casos.listarOrcamentos(marcenaria(res), filtrosListagemSchema.parse(req.query)))
})

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

// Registrar = enviar (D020): número sequencial e edição travada.
rotasOrcamentos.post('/orcamentos/:id/registrar', async (req, res) => {
  res.json(await casos.registrarOrcamento(marcenaria(res), lerId(req.params.id)))
})

rotasOrcamentos.post('/orcamentos/:id/situacao', async (req, res) => {
  const { situacao } = mudancaSituacaoSchema.parse(req.body)
  res.json(await casos.mudarSituacao(marcenaria(res), lerId(req.params.id), situacao))
})

// RF43: baixar o PDF de um orçamento registrado. Por padrão sem a lista de materiais e serviços,
// como no modelo do proprietário (Q7); ?itens=sim a inclui, sempre sem valores (RF42, D022).
const opcaoPdfSchema = z.object({ itens: z.enum(['sim', 'nao'], 'Escolha itens=sim ou itens=nao').default('nao') })

rotasOrcamentos.get('/orcamentos/:id/pdf', async (req, res) => {
  const { itens } = opcaoPdfSchema.parse(req.query)
  const { nomeArquivo, pdf } = await gerarPdfOrcamento(marcenaria(res), lerId(req.params.id), itens === 'sim')
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`)
  res.send(pdf)
})
