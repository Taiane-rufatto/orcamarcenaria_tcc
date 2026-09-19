import { ErroHttp } from '../../api/erros/erro-http'
import type { AlterarSenhaEntrada } from '../../api/validacoes/autenticacao'
import { pool } from '../../infra/banco/pool'
import { atualizarSenha, type Usuario } from '../../infra/repositorios/conta-repositorio'
import { criarSessao, encerrarSessoesDoUsuario } from '../../infra/repositorios/sessao-repositorio'
import { conferirSenha, criarHashDeSenha } from '../../seguranca/senhas'
import { resultadoAutenticacao, type ResultadoAutenticacao } from './resultado-autenticacao'

const duracaoSessaoMs = 8 * 60 * 60 * 1000

export async function alterarSenha(
  usuario: Usuario,
  entrada: AlterarSenhaEntrada,
): Promise<ResultadoAutenticacao> {
  if (!(await conferirSenha(entrada.senhaAtual, usuario.senhaHash))) {
    throw new ErroHttp(401, 'Senha atual inválida')
  }

  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    await atualizarSenha(cliente, usuario.id, await criarHashDeSenha(entrada.novaSenha))
    await encerrarSessoesDoUsuario(cliente, usuario.id)
    const sessao = await criarSessao(cliente, {
      usuarioId: usuario.id,
      marcenariaId: usuario.marcenariaId,
      expiraEm: new Date(Date.now() + duracaoSessaoMs),
    })
    await cliente.query('COMMIT')
    return resultadoAutenticacao(usuario, sessao.id)
  } catch (erro) {
    await cliente.query('ROLLBACK')
    throw erro
  } finally {
    cliente.release()
  }
}
