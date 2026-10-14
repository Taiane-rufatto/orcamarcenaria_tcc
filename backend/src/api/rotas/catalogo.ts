import { Router } from 'express'
import { z } from 'zod'
import { ErroHttp } from '../erros/erro-http'
import { exigirAutenticacao } from '../middlewares/autenticacao'
import { materialSchema, servicoSchema } from '../validacoes/catalogo'
import { fornecedorAtivoDaMarcenaria } from '../../infra/repositorios/fornecedor-repositorio'
import { confirmarPreco, historicoDoMaterial } from '../../infra/repositorios/material-repositorio'
import {
  atualizarCatalogo, criarCatalogo, definirSituacaoCatalogo, listarCatalogo,
  type Situacao, type Tipo,
} from '../../infra/repositorios/catalogo-repositorio'

export const rotasCatalogo = Router()

const consultaSchema = z.object({
  busca: z.string().optional(),
  situacao: z.enum(['ativos', 'inativos', 'todos']).default('ativos'),
})
const idSchema = z.uuid()

// id malformado não pode chegar ao banco (viraria erro 500): trata como não encontrado.
function lerId(valor: unknown): string {
  const id = idSchema.safeParse(valor)
  if (!id.success) throw new ErroHttp(404, 'Registro não encontrado')
  return id.data
}

// Nome único por marcenaria: violação (23505) vira mensagem clara em vez de erro interno.
async function traduzirDuplicidade<T>(operacao: Promise<T>): Promise<T> {
  try { return await operacao } catch (erro) {
    if (typeof erro === 'object' && erro !== null && 'code' in erro && erro.code === '23505') {
      throw new ErroHttp(409, 'Já existe um cadastro com este nome')
    }
    throw erro
  }
}

// Spec 020: o fornecedor escolhido para um material precisa ser da mesma marcenaria e estar ativo.
async function exigirFornecedor(marcenariaId: string, dados: { fornecedorId?: string | null }) {
  if (dados.fornecedorId && !await fornecedorAtivoDaMarcenaria(dados.fornecedorId, marcenariaId)) {
    throw new ErroHttp(400, 'Fornecedor não encontrado ou inativo')
  }
}

function registrar(tipo: Tipo, rota: string, schema: typeof materialSchema | typeof servicoSchema) {
  // marcenariaId vem sempre da sessão (AGENTS §5.1), nunca do corpo ou da URL.
  const marcenaria = (res: { locals: { autenticacao?: { marcenariaId: string } } }) => res.locals.autenticacao!.marcenariaId

  rotasCatalogo.get(`/${rota}`, exigirAutenticacao, async (req, res) => {
    const { busca, situacao } = consultaSchema.parse(req.query)
    res.json(await listarCatalogo(tipo, marcenaria(res), busca, situacao as Situacao))
  })

  rotasCatalogo.post(`/${rota}`, exigirAutenticacao, async (req, res) => {
    const dados = schema.parse(req.body)
    await exigirFornecedor(marcenaria(res), dados as { fornecedorId?: string | null })
    res.status(201).json(await traduzirDuplicidade(criarCatalogo(tipo, marcenaria(res), dados)))
  })

  rotasCatalogo.put(`/${rota}/:id`, exigirAutenticacao, async (req, res) => {
    const id = lerId(req.params.id)
    const dados = schema.parse(req.body)
    await exigirFornecedor(marcenaria(res), dados as { fornecedorId?: string | null })
    const item = await traduzirDuplicidade(atualizarCatalogo(tipo, id, marcenaria(res), dados))
    if (!item) throw new ErroHttp(404, 'Registro não encontrado')
    res.json(item)
  })

  // Sem exclusão física (AGENTS §5.2): DELETE apenas inativa e a reativação devolve o registro à lista de ativos (D015).
  rotasCatalogo.delete(`/${rota}/:id`, exigirAutenticacao, async (req, res) => {
    if (!await definirSituacaoCatalogo(tipo, lerId(req.params.id), marcenaria(res), false)) throw new ErroHttp(404, 'Registro não encontrado')
    res.status(204).end()
  })

  rotasCatalogo.post(`/${rota}/:id/reativar`, exigirAutenticacao, async (req, res) => {
    if (!await definirSituacaoCatalogo(tipo, lerId(req.params.id), marcenaria(res), true)) throw new ErroHttp(404, 'Registro não encontrado')
    res.status(204).end()
  })
}

registrar('material', 'materiais', materialSchema)
registrar('servico', 'servicos', servicoSchema)

// Spec 020 (RF51, RF52): confirmar que o preço continua o mesmo e consultar o histórico de custo.
rotasCatalogo.post('/materiais/:id/confirmar-preco', exigirAutenticacao, async (req, res) => {
  const material = await confirmarPreco(lerId(req.params.id), res.locals.autenticacao!.marcenariaId)
  if (!material) throw new ErroHttp(404, 'Registro não encontrado')
  res.json(material)
})

rotasCatalogo.get('/materiais/:id/historico', exigirAutenticacao, async (req, res) => {
  const historico = await historicoDoMaterial(lerId(req.params.id), res.locals.autenticacao!.marcenariaId)
  if (!historico) throw new ErroHttp(404, 'Registro não encontrado')
  res.json(historico)
})
