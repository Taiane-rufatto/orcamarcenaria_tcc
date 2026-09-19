import type { RequestHandler } from 'express'
import { ErroHttp } from '../erros/erro-http'
import { buscarSessaoAtiva } from '../../infra/repositorios/sessao-repositorio'
import { verificarToken } from '../../seguranca/tokens'

export type ContextoAutenticado = {
  sessaoId: string
  usuarioId: string
  marcenariaId: string
}

declare global {
  namespace Express {
    interface Locals {
      autenticacao?: ContextoAutenticado
    }
  }
}

export const exigirAutenticacao: RequestHandler = async (requisicao, resposta, proximo) => {
  try {
    const [tipo, token] = requisicao.header('authorization')?.split(' ') ?? []
    if (tipo !== 'Bearer' || !token) throw new ErroHttp(401, 'Sessão inválida ou expirada')

    const dados = verificarToken(token)
    const sessao = await buscarSessaoAtiva(dados.sessaoId)
    if (
      !sessao ||
      sessao.usuarioId !== dados.usuarioId ||
      sessao.marcenariaId !== dados.marcenariaId
    ) throw new ErroHttp(401, 'Sessão inválida ou expirada')

    resposta.locals.autenticacao = dados
    proximo()
  } catch {
    proximo(new ErroHttp(401, 'Sessão inválida ou expirada'))
  }
}
