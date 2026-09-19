import { Router } from 'express'
import { alterarSenha } from '../../aplicacao/autenticacao/alterar-senha'
import { cadastrarConta } from '../../aplicacao/autenticacao/cadastrar-conta'
import { entrar } from '../../aplicacao/autenticacao/entrar'
import { sair } from '../../aplicacao/autenticacao/sair'
import { ErroHttp } from '../erros/erro-http'
import { exigirAutenticacao } from '../middlewares/autenticacao'
import { alterarSenhaSchema, cadastroSchema, entrarSchema } from '../validacoes/autenticacao'
import { buscarUsuarioPorId } from '../../infra/repositorios/conta-repositorio'

export const rotasAutenticacao = Router()

rotasAutenticacao.post('/cadastro', async (requisicao, resposta) => {
  const resultado = await cadastrarConta(cadastroSchema.parse(requisicao.body))
  resposta.status(201).json(resultado)
})

rotasAutenticacao.post('/entrar', async (requisicao, resposta) => {
  resposta.json(await entrar(entrarSchema.parse(requisicao.body)))
})

rotasAutenticacao.post('/sair', exigirAutenticacao, async (_requisicao, resposta) => {
  await sair(resposta.locals.autenticacao!.sessaoId)
  resposta.status(204).end()
})

rotasAutenticacao.put('/senha', exigirAutenticacao, async (requisicao, resposta) => {
  const contexto = resposta.locals.autenticacao!
  const usuario = await buscarUsuarioPorId(contexto.usuarioId)
  if (!usuario || usuario.id !== contexto.usuarioId) throw new ErroHttp(401, 'Sessão inválida ou expirada')
  resposta.json(await alterarSenha(usuario, alterarSenhaSchema.parse(requisicao.body)))
})
