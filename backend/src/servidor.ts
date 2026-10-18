import express from 'express'
import cors from 'cors'
import { ambiente } from './config/ambiente'
import { pool } from './infra/banco/pool'
import { rotasAutenticacao } from './api/rotas/autenticacao'
import { tratamentoDeErros } from './api/middlewares/tratamento-de-erros'
import { rotasCatalogo } from './api/rotas/catalogo'
import { rotasOrcamentos } from './api/rotas/orcamentos'
import { rotasClientes } from './api/rotas/clientes'
import { rotasConfiguracoes } from './api/rotas/configuracoes'
import { rotasPainel } from './api/rotas/painel'
import { rotasFornecedores } from './api/rotas/fornecedores'

export const app = express()

// A API roda atrás do nginx (D029): confiar em 1 salto para enxergar o endereço real do cliente no limite de tentativas.
app.set('trust proxy', 1)
app.use(cors({ origin: ambiente.origemPermitida }))
app.use(express.json())
app.use('/auth', rotasAutenticacao)
app.use(rotasCatalogo)
app.use(rotasOrcamentos)
app.use(rotasClientes)
app.use(rotasConfiguracoes)
app.use(rotasPainel)
app.use(rotasFornecedores)

app.get('/saude', async (_requisicao, resposta) => {
  try {
    const resultado = await pool.query('select now() as agora')
    resposta.json({
      api: 'ok',
      banco: 'ok',
      horaDoBanco: resultado.rows[0].agora,
    })
  } catch (erro) {
    // Achado A6: a rota é pública, então a causa do erro (host, porta, usuário do banco) fica só no log do servidor.
    console.error('Banco indisponível na verificação de saúde.', erro)
    resposta.status(503).json({ api: 'ok', banco: 'indisponivel' })
  }
})

app.use(tratamentoDeErros)

if (require.main === module) {
  app.listen(ambiente.porta, () => {
    console.log(`API ouvindo em http://localhost:${ambiente.porta}`)
  })
}
