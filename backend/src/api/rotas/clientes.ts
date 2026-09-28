import { Router, type Response } from 'express'
import { z } from 'zod'
import { ErroHttp } from '../erros/erro-http'
import { exigirAutenticacao } from '../middlewares/autenticacao'
import { clienteSchema } from '../validacoes/clientes'
import {
  atualizarCliente, criarCliente, definirSituacaoCliente, listarClientes, type Situacao,
} from '../../infra/repositorios/cliente-repositorio'

// Cadastro de clientes (RF08–RF10, US06), no mesmo formato do catálogo (002).
export const rotasClientes = Router()
rotasClientes.use('/clientes', exigirAutenticacao)

// marcenariaId vem sempre da sessão (AGENTS §5.1), nunca do corpo ou da URL.
const marcenaria = (res: Response) => res.locals.autenticacao!.marcenariaId

const consultaSchema = z.object({
  busca: z.string().optional(),
  situacao: z.enum(['ativos', 'inativos', 'todos']).default('ativos'),
})

// id malformado não pode chegar ao banco (viraria erro 500): trata como não encontrado.
function lerId(valor: unknown): string {
  const id = z.uuid().safeParse(valor)
  if (!id.success) throw new ErroHttp(404, 'Cliente não encontrado')
  return id.data
}

rotasClientes.get('/clientes', async (req, res) => {
  const { busca, situacao } = consultaSchema.parse(req.query)
  res.json(await listarClientes(marcenaria(res), busca, situacao as Situacao))
})

rotasClientes.post('/clientes', async (req, res) => {
  res.status(201).json(await criarCliente(marcenaria(res), clienteSchema.parse(req.body)))
})

rotasClientes.put('/clientes/:id', async (req, res) => {
  const cliente = await atualizarCliente(lerId(req.params.id), marcenaria(res), clienteSchema.parse(req.body))
  if (!cliente) throw new ErroHttp(404, 'Cliente não encontrado')
  res.json(cliente)
})

// Não existe exclusão (RF10, AGENTS §5.2): DELETE apenas inativa; o cliente segue ligado aos orçamentos.
rotasClientes.delete('/clientes/:id', async (req, res) => {
  if (!await definirSituacaoCliente(lerId(req.params.id), marcenaria(res), false)) throw new ErroHttp(404, 'Cliente não encontrado')
  res.status(204).end()
})

rotasClientes.post('/clientes/:id/reativar', async (req, res) => {
  if (!await definirSituacaoCliente(lerId(req.params.id), marcenaria(res), true)) throw new ErroHttp(404, 'Cliente não encontrado')
  res.status(204).end()
})
