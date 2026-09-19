import { Router } from 'express'
import { z } from 'zod'
import { ErroHttp } from '../erros/erro-http'
import { exigirAutenticacao } from '../middlewares/autenticacao'
import { materialSchema, servicoSchema } from '../validacoes/catalogo'
import {
  atualizarCatalogo, criarCatalogo, inativarCatalogo, listarCatalogo,
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

function registrar(tipo: Tipo, rota: string, schema: typeof materialSchema | typeof servicoSchema) {
  // marcenariaId vem sempre da sessão (AGENTS §5.1), nunca do corpo ou da URL.
  const marcenaria = (res: { locals: { autenticacao?: { marcenariaId: string } } }) => res.locals.autenticacao!.marcenariaId

  rotasCatalogo.get(`/${rota}`, exigirAutenticacao, async (req, res) => {
    const { busca, situacao } = consultaSchema.parse(req.query)
    res.json(await listarCatalogo(tipo, marcenaria(res), busca, situacao as Situacao))
  })

  rotasCatalogo.post(`/${rota}`, exigirAutenticacao, async (req, res) => {
    res.status(201).json(await traduzirDuplicidade(criarCatalogo(tipo, marcenaria(res), schema.parse(req.body))))
  })

  rotasCatalogo.put(`/${rota}/:id`, exigirAutenticacao, async (req, res) => {
    const id = lerId(req.params.id)
    const item = await traduzirDuplicidade(atualizarCatalogo(tipo, id, marcenaria(res), schema.parse(req.body)))
    if (!item) throw new ErroHttp(404, 'Registro não encontrado')
    res.json(item)
  })

  // Sem exclusão física (AGENTS §5.2): DELETE apenas inativa.
  rotasCatalogo.delete(`/${rota}/:id`, exigirAutenticacao, async (req, res) => {
    if (!await inativarCatalogo(tipo, lerId(req.params.id), marcenaria(res))) throw new ErroHttp(404, 'Registro não encontrado')
    res.status(204).end()
  })
}

registrar('material', 'materiais', materialSchema)
registrar('servico', 'servicos', servicoSchema)
