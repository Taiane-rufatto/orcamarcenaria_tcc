import { Router } from 'express'
import { alterarSenha } from '../../aplicacao/autenticacao/alterar-senha'
import { cadastrarConta } from '../../aplicacao/autenticacao/cadastrar-conta'
import { entrar } from '../../aplicacao/autenticacao/entrar'
import { redefinirSenha, solicitarRedefinicao } from '../../aplicacao/autenticacao/recuperar-senha'
import { sair } from '../../aplicacao/autenticacao/sair'
import { ErroHttp } from '../erros/erro-http'
import { exigirAutenticacao } from '../middlewares/autenticacao'
import { alterarSenhaSchema, cadastroSchema, entrarSchema, esqueciSenhaSchema, redefinirSenhaSchema } from '../validacoes/autenticacao'
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

// RF07 (D028): sempre 202, com ou sem conta para o e-mail, para não revelar quem está cadastrado.
rotasAutenticacao.post('/esqueci-senha', async (requisicao, resposta) => {
  await solicitarRedefinicao(esqueciSenhaSchema.parse(requisicao.body).email)
  resposta.status(202).json({ mensagem: 'Se este e-mail tiver conta, enviamos um link para criar uma nova senha.' })
})

rotasAutenticacao.post('/redefinir-senha', async (requisicao, resposta) => {
  await redefinirSenha(redefinirSenhaSchema.parse(requisicao.body))
  resposta.status(204).end()
})
