import { pool } from '../../infra/banco/pool'
import { criarConta } from '../../infra/repositorios/conta-repositorio'
import { criarSessao } from '../../infra/repositorios/sessao-repositorio'
import { criarHashDeSenha } from '../../seguranca/senhas'
import type { CadastroEntrada } from '../../api/validacoes/autenticacao'
import { ErroHttp } from '../../api/erros/erro-http'
import { resultadoAutenticacao, type ResultadoAutenticacao } from './resultado-autenticacao'

const duracaoSessaoMs = 8 * 60 * 60 * 1000

export async function cadastrarConta(entrada: CadastroEntrada): Promise<ResultadoAutenticacao> {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const usuario = await criarConta(cliente, { ...entrada, senhaHash: await criarHashDeSenha(entrada.senha) })
    const sessao = await criarSessao(cliente, {
      usuarioId: usuario.id,
      marcenariaId: usuario.marcenariaId,
      expiraEm: new Date(Date.now() + duracaoSessaoMs),
    })
    await cliente.query('COMMIT')
    return resultadoAutenticacao(usuario, sessao.id)
  } catch (erro: unknown) {
    await cliente.query('ROLLBACK')
    if (typeof erro === 'object' && erro !== null && 'code' in erro && erro.code === '23505') {
      throw new ErroHttp(409, 'Este e-mail já está em uso')
    }
    throw erro
  } finally {
    cliente.release()
  }
}
