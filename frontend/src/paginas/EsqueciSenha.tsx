import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PainelAcesso } from '../componentes/PainelAcesso'
import { pedirNovaSenha } from '../servicos/autenticacao'

// RF07 (D028): pede o link de nova senha. A resposta é a mesma com ou sem conta para o e-mail.
export function EsqueciSenha() {
  const [enviado, setEnviado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setEnviando(true)
    try {
      setEnviado(await pedirNovaSenha(String(new FormData(evento.currentTarget).get('email'))))
      setErro(null)
    } catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível enviar o pedido.') }
    finally { setEnviando(false) }
  }

  return <PainelAcesso titulo="Esqueceu sua senha?">
    {enviado ? <>
      <p className="aviso" role="status">{enviado}</p>
      <p>O link vale por 1 hora. Não chegou? Confira a caixa de spam ou <button type="button" className="discreto" onClick={() => setEnviado(null)}>peça de novo</button>.</p>
    </> : <form onSubmit={enviar}>
      <p>Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.</p>
      <label>E-mail<input name="email" type="email" autoComplete="email" required autoFocus /></label>
      {erro && <p role="alert" className="alerta">{erro}</p>}
      <button disabled={enviando} aria-busy={enviando}>{enviando ? 'Enviando…' : 'Enviar link'}</button>
    </form>}
    <p><Link to="/entrar">Voltar para entrar</Link></p>
  </PainelAcesso>
}
