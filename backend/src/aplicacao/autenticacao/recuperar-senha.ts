import { createHash, randomBytes } from 'node:crypto'
import { ErroHttp } from '../../api/erros/erro-http'
import type { RedefinirSenhaEntrada } from '../../api/validacoes/autenticacao'
import { ambiente } from '../../config/ambiente'
import { pool } from '../../infra/banco/pool'
import { enviarEmail } from '../../infra/email/enviar-email'
import { atualizarSenha, buscarUsuarioPorEmail } from '../../infra/repositorios/conta-repositorio'
import { buscarPedidoValido, criarPedido, marcarUsado, pedidoRecente } from '../../infra/repositorios/redefinicao-repositorio'
import { encerrarSessoesDoUsuario } from '../../infra/repositorios/sessao-repositorio'
import { criarHashDeSenha } from '../../seguranca/senhas'

const validadeMs = 60 * 60 * 1000 // 1 hora
const intervaloMinimoSegundos = 60

// O banco guarda só o hash: quem ler a tabela não tem o link.
const hashDoToken = (token: string) => createHash('sha256').update(token).digest('hex')

// RF07, D028. Não lança erro para e-mail desconhecido: a resposta da rota é sempre a mesma,
// para não revelar quais e-mails têm conta.
export async function solicitarRedefinicao(email: string): Promise<void> {
  const usuario = await buscarUsuarioPorEmail(email)
  if (!usuario || await pedidoRecente(usuario.id, intervaloMinimoSegundos)) return

  const token = randomBytes(32).toString('base64url')
  await criarPedido(pool, usuario.id, hashDoToken(token), new Date(Date.now() + validadeMs))

  const link = `${ambiente.urlFrontend}/redefinir-senha?token=${token}`
  // Falha no envio não muda a resposta (senão ela revelaria que o e-mail tem conta); fica no log do servidor.
  await enviarEmail({
    para: usuario.email,
    assunto: 'Criar nova senha — OrçaMarcenaria',
    texto: [
      `Olá, ${usuario.nome}.`,
      '',
      'Recebemos um pedido para criar uma nova senha na sua conta do OrçaMarcenaria.',
      'Para continuar, abra o link abaixo. Ele vale por 1 hora e pode ser usado uma vez só:',
      '',
      link,
      '',
      'Se não foi você quem pediu, ignore este e-mail: sua senha continua a mesma.',
    ].join('\n'),
  }).catch((erro: unknown) => console.error('Não foi possível enviar o e-mail de recuperação de senha.', erro))
}

// Troca a senha pelo link do e-mail e encerra as sessões abertas, como na troca de senha (RF06).
export async function redefinirSenha(entrada: RedefinirSenhaEntrada): Promise<void> {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const pedido = await buscarPedidoValido(cliente, hashDoToken(entrada.token))
    if (!pedido) throw new ErroHttp(400, 'Este link é inválido ou expirou. Peça um novo em "Esqueceu sua senha?".')
    await atualizarSenha(cliente, pedido.usuarioId, await criarHashDeSenha(entrada.novaSenha))
    await marcarUsado(cliente, pedido.id)
    await encerrarSessoesDoUsuario(cliente, pedido.usuarioId)
    await cliente.query('COMMIT')
  } catch (erro) {
    await cliente.query('ROLLBACK')
    throw erro
  } finally {
    cliente.release()
  }
}
