import type { Usuario } from '../../infra/repositorios/conta-repositorio'
import { emitirToken } from '../../seguranca/tokens'

export type ResultadoAutenticacao = {
  token: string
  usuario: { id: string; nome: string; email: string; marcenariaId: string }
}

export function resultadoAutenticacao(usuario: Usuario, sessaoId: string): ResultadoAutenticacao {
  return {
    token: emitirToken({ sessaoId, usuarioId: usuario.id, marcenariaId: usuario.marcenariaId }),
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      marcenariaId: usuario.marcenariaId,
    },
  }
}
