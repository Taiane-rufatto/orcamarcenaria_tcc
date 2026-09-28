import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { ErroHttp } from '../erros/erro-http'
import { ErroCalculo } from '../../dominio/orcamento/calculo'

export const tratamentoDeErros: ErrorRequestHandler = (erro, _requisicao, resposta, _proximo) => {
  if (erro instanceof ZodError) {
    return resposta.status(400).json({ mensagem: erro.issues[0]?.message ?? 'Entrada inválida' })
  }

  // Entrada recusada pelo domínio do cálculo (RN10): a transação já foi desfeita.
  if (erro instanceof ErroCalculo) {
    return resposta.status(400).json({ mensagem: erro.message })
  }

  if (erro instanceof ErroHttp) {
    return resposta.status(erro.status).json({ mensagem: erro.message })
  }

  console.error(erro)
  return resposta.status(500).json({ mensagem: 'Ocorreu um erro interno.' })
}
