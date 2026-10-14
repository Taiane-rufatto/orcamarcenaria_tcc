import { Router, type Response } from 'express'
import { z } from 'zod'
import { ErroHttp } from '../erros/erro-http'
import { exigirAutenticacao } from '../middlewares/autenticacao'
import { fornecedorSchema } from '../validacoes/fornecedores'
import {
  atualizarFornecedor, criarFornecedor, definirFornecedorPadrao, definirSituacaoFornecedor, listarFornecedores,
  removerFornecedorPadrao, type Situacao,
} from '../../infra/repositorios/fornecedor-repositorio'

// Cadastro de fornecedores (RF49, spec 020), no mesmo formato de clientes e do catálogo.
export const rotasFornecedores = Router()
rotasFornecedores.use('/fornecedores', exigirAutenticacao)

// marcenariaId vem sempre da sessão (AGENTS §5.1), nunca do corpo ou da URL.
const marcenaria = (res: Response) => res.locals.autenticacao!.marcenariaId

const consultaSchema = z.object({
  busca: z.string().optional(),
  situacao: z.enum(['ativos', 'inativos', 'todos']).default('ativos'),
})

// id malformado não pode chegar ao banco (viraria erro 500): trata como não encontrado.
function lerId(valor: unknown): string {
  const id = z.uuid().safeParse(valor)
  if (!id.success) throw new ErroHttp(404, 'Fornecedor não encontrado')
  return id.data
}

// Nome único por marcenaria: violação (23505) vira mensagem clara em vez de erro interno.
async function traduzirDuplicidade<T>(operacao: Promise<T>): Promise<T> {
  try { return await operacao } catch (erro) {
    if (typeof erro === 'object' && erro !== null && 'code' in erro && erro.code === '23505') {
      throw new ErroHttp(409, 'Já existe um fornecedor com este nome')
    }
    throw erro
  }
}

rotasFornecedores.get('/fornecedores', async (req, res) => {
  const { busca, situacao } = consultaSchema.parse(req.query)
  res.json(await listarFornecedores(marcenaria(res), busca, situacao as Situacao))
})

rotasFornecedores.post('/fornecedores', async (req, res) => {
  res.status(201).json(await traduzirDuplicidade(criarFornecedor(marcenaria(res), fornecedorSchema.parse(req.body))))
})

rotasFornecedores.put('/fornecedores/:id', async (req, res) => {
  const fornecedor = await traduzirDuplicidade(atualizarFornecedor(lerId(req.params.id), marcenaria(res), fornecedorSchema.parse(req.body)))
  if (!fornecedor) throw new ErroHttp(404, 'Fornecedor não encontrado')
  res.json(fornecedor)
})

// Fornecedor padrão: já vem escolhido no material novo. Rota fixa antes das rotas com :id.
rotasFornecedores.delete('/fornecedores/padrao', async (_req, res) => {
  await removerFornecedorPadrao(marcenaria(res))
  res.status(204).end()
})

rotasFornecedores.post('/fornecedores/:id/padrao', async (req, res) => {
  if (!await definirFornecedorPadrao(lerId(req.params.id), marcenaria(res))) throw new ErroHttp(404, 'Fornecedor não encontrado ou inativo')
  res.status(204).end()
})

// Não existe exclusão (AGENTS §5.2): DELETE apenas inativa; o fornecedor segue no histórico de preços.
rotasFornecedores.delete('/fornecedores/:id', async (req, res) => {
  if (!await definirSituacaoFornecedor(lerId(req.params.id), marcenaria(res), false)) throw new ErroHttp(404, 'Fornecedor não encontrado')
  res.status(204).end()
})

rotasFornecedores.post('/fornecedores/:id/reativar', async (req, res) => {
  if (!await definirSituacaoFornecedor(lerId(req.params.id), marcenaria(res), true)) throw new ErroHttp(404, 'Fornecedor não encontrado')
  res.status(204).end()
})
