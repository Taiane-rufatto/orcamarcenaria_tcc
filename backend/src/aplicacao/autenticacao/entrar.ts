import { ErroHttp } from '../../api/erros/erro-http'
import type { EntrarEntrada } from '../../api/validacoes/autenticacao'
import { pool } from '../../infra/banco/pool'
import { buscarUsuarioPorEmail } from '../../infra/repositorios/conta-repositorio'
import { criarSessao } from '../../infra/repositorios/sessao-repositorio'
import { conferirSenha } from '../../seguranca/senhas'
import { resultadoAutenticacao, type ResultadoAutenticacao } from './resultado-autenticacao'

const duracaoSessaoMs = 8 * 60 * 60 * 1000

export async function entrar(entrada: EntrarEntrada): Promise<ResultadoAutenticacao> {
  const usuario = await buscarUsuarioPorEmail(entrada.email)
  if (!usuario || !(await conferirSenha(entrada.senha, usuario.senhaHash))) {
    throw new ErroHttp(401, 'E-mail ou senha inválidos')
  }
  const sessao = await criarSessao(pool, {
    usuarioId: usuario.id,
    marcenariaId: usuario.marcenariaId,
    expiraEm: new Date(Date.now() + duracaoSessaoMs),
  })
  return resultadoAutenticacao(usuario, sessao.id)
}
