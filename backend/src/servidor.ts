import express from 'express'
import cors from 'cors'
import { ambiente } from './config/ambiente'
import { pool } from './infra/banco/pool'
import { rotasAutenticacao } from './api/rotas/autenticacao'
import { tratamentoDeErros } from './api/middlewares/tratamento-de-erros'

export const app = express()

app.use(cors({ origin: ambiente.origemPermitida }))
app.use(express.json())
app.use('/auth', rotasAutenticacao)

app.get('/saude', async (_requisicao, resposta) => {
  try {
    const resultado = await pool.query('select now() as agora')
    resposta.json({
      api: 'ok',
      banco: 'ok',
      horaDoBanco: resultado.rows[0].agora,
    })
  } catch (erro) {
    resposta.status(503).json({
      api: 'ok',
      banco: 'indisponivel',
      detalhe: erro instanceof Error ? erro.message : 'erro desconhecido',
    })
  }
})

app.use(tratamentoDeErros)

if (require.main === module) {
  app.listen(ambiente.porta, () => {
    console.log(`API ouvindo em http://localhost:${ambiente.porta}`)
  })
}
