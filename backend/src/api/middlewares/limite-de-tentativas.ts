import type { Request, RequestHandler } from 'express'
import { ErroHttp } from '../erros/erro-http'

// Limite de tentativas (spec 021, achado A1 do diagnóstico de segurança): impede testar senhas sem parar
// e criar contas em massa. Em memória, sem dependência nova: a API roda em um único processo na VPS.

// Conta tentativas por chave dentro de uma janela de tempo. Separado do Express para ser testado com relógio falso.
export class ContadorDeTentativas {
  private readonly registros = new Map<string, { contagem: number; reinicioEm: number }>()

  constructor(private readonly janelaMs: number, private readonly maximo: number) {}

  // Registra uma tentativa. Devolve se ainda é permitida e, se não, em quantos segundos a janela reabre.
  registrar(chave: string, agora: number): { permitido: boolean; esperarSegundos: number } {
    this.limparVencidos(agora)
    const atual = this.registros.get(chave)
    if (!atual || atual.reinicioEm <= agora) {
      this.registros.set(chave, { contagem: 1, reinicioEm: agora + this.janelaMs })
      return { permitido: true, esperarSegundos: 0 }
    }
    atual.contagem += 1
    if (atual.contagem > this.maximo) {
      return { permitido: false, esperarSegundos: Math.ceil((atual.reinicioEm - agora) / 1000) }
    }
    return { permitido: true, esperarSegundos: 0 }
  }

  // Evita que o mapa cresça sem fim: só varre quando já tem muitas chaves.
  private limparVencidos(agora: number) {
    if (this.registros.size < 5000) return
    for (const [chave, registro] of this.registros) if (registro.reinicioEm <= agora) this.registros.delete(chave)
  }
}

interface Opcoes {
  janelaMs: number
  maximo: number
  chave: (requisicao: Request) => string
}

const MENSAGEM = 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'

// Cada chamada cria o seu próprio contador, para limites diferentes não se misturarem.
// LIMITE_TENTATIVAS=desligado (só nos testes automatizados) deixa passar tudo.
export function limitarTentativas({ janelaMs, maximo, chave }: Opcoes): RequestHandler {
  const contador = new ContadorDeTentativas(janelaMs, maximo)
  return (requisicao, resposta, proximo) => {
    if (process.env.LIMITE_TENTATIVAS === 'desligado') return proximo()
    const resultado = contador.registrar(chave(requisicao), Date.now())
    if (resultado.permitido) return proximo()
    resposta.setHeader('Retry-After', String(resultado.esperarSegundos))
    proximo(new ErroHttp(429, MENSAGEM))
  }
}
