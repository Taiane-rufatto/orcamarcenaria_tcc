import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { ErroHttp } from '../erros/erro-http'

export const tratamentoDeErros: ErrorRequestHandler = (erro, _requisicao, resposta, _proximo) => {
  if (erro instanceof ZodError) {
    return resposta.status(400).json({ mensagem: erro.issues[0]?.message ?? 'Entrada inválida' })
  }

  if (erro instanceof ErroHttp) {
    return resposta.status(erro.status).json({ mensagem: erro.message })
  }

  console.error(erro)
  return resposta.status(500).json({ mensagem: 'Ocorreu um erro interno.' })
}
