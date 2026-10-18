import { Router } from 'express'
import { alterarSenha } from '../../aplicacao/autenticacao/alterar-senha'
import { cadastrarConta } from '../../aplicacao/autenticacao/cadastrar-conta'
import { entrar } from '../../aplicacao/autenticacao/entrar'
import { redefinirSenha, solicitarRedefinicao } from '../../aplicacao/autenticacao/recuperar-senha'
import { sair } from '../../aplicacao/autenticacao/sair'
import { ErroHttp } from '../erros/erro-http'
import { exigirAutenticacao } from '../middlewares/autenticacao'
import { limitarTentativas } from '../middlewares/limite-de-tentativas'
import { alterarSenhaSchema, cadastroSchema, entrarSchema, esqueciSenhaSchema, redefinirSenhaSchema } from '../validacoes/autenticacao'
import { buscarUsuarioPorId } from '../../infra/repositorios/conta-repositorio'

export const rotasAutenticacao = Router()

// Achado A1 do diagnóstico de segurança: sem limite, dava para testar senhas sem parar e criar contas em massa.
const MIN = 60 * 1000
const emailDoCorpo = (requisicao: { body?: { email?: unknown } }) => String(requisicao.body?.email ?? '').trim().toLowerCase()
const limiteDeLoginPorEndereco = limitarTentativas({ janelaMs: 15 * MIN, maximo: 30, chave: (r) => `entrar|${r.ip}` })
const limiteDeLoginPorConta = limitarTentativas({ janelaMs: 15 * MIN, maximo: 10, chave: (r) => `entrar|${r.ip}|${emailDoCorpo(r)}` })
const limiteDeCadastro = limitarTentativas({ janelaMs: 60 * MIN, maximo: 10, chave: (r) => `cadastro|${r.ip}` })
const limiteDeRecuperacao = limitarTentativas({ janelaMs: 60 * MIN, maximo: 10, chave: (r) => `esqueci|${r.ip}` })
const limiteDeRedefinicao = limitarTentativas({ janelaMs: 15 * MIN, maximo: 10, chave: (r) => `redefinir|${r.ip}` })

rotasAutenticacao.post('/cadastro', limiteDeCadastro, async (requisicao, resposta) => {
  const resultado = await cadastrarConta(cadastroSchema.parse(requisicao.body))
  resposta.status(201).json(resultado)
})

rotasAutenticacao.post('/entrar', limiteDeLoginPorEndereco, limiteDeLoginPorConta, async (requisicao, resposta) => {
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
rotasAutenticacao.post('/esqueci-senha', limiteDeRecuperacao, async (requisicao, resposta) => {
  await solicitarRedefinicao(esqueciSenhaSchema.parse(requisicao.body).email)
  resposta.status(202).json({ mensagem: 'Se este e-mail tiver conta, enviamos um link para criar uma nova senha.' })
})

rotasAutenticacao.post('/redefinir-senha', limiteDeRedefinicao, async (requisicao, resposta) => {
  await redefinirSenha(redefinirSenhaSchema.parse(requisicao.body))
  resposta.status(204).end()
})
