import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PainelAcesso } from '../componentes/PainelAcesso'
import { redefinirSenha } from '../servicos/autenticacao'

// RF07 (D028): aberta pelo link do e-mail. O token vem no fragmento do endereço (#token=...), que não chega ao
// servidor nem aos logs do nginx (spec 028, F-06), e vale uma vez só. Links antigos, com ?token=, ainda funcionam.
export function RedefinirSenha() {
  const { hash, search } = useLocation()
  const [token] = useState(() =>
    new URLSearchParams(hash.replace(/^#/, '')).get('token') ?? new URLSearchParams(search).get('token') ?? '')
  // Depois de lido, o token sai do endereço visível e do histórico do navegador.
  useEffect(() => { if (token) window.history.replaceState(null, '', window.location.pathname) }, [token])
  const [concluido, setConcluido] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    const novaSenha = String(dados.get('novaSenha'))
    if (novaSenha !== String(dados.get('confirmacao'))) { setErro('As duas senhas não são iguais. Digite a mesma senha nos dois campos.'); return }
    try {
      await redefinirSenha(token, novaSenha)
      setConcluido(true)
    } catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível criar a nova senha.') }
  }

  if (!token) return <PainelAcesso titulo="Criar nova senha">
    <p className="alerta" role="alert">Este link está incompleto. Abra de novo o link do e-mail ou peça outro.</p>
    <p><Link to="/esqueci-senha">Pedir um novo link</Link></p>
  </PainelAcesso>

  return <PainelAcesso titulo="Criar nova senha">
    {concluido ? <>
      <p className="aviso" role="status">Senha alterada. Por segurança, as sessões abertas foram encerradas.</p>
      <p><Link to="/entrar">Entrar com a nova senha</Link></p>
    </> : <form onSubmit={salvar}>
      <label>Nova senha (mínimo 8 caracteres)<input name="novaSenha" type="password" minLength={8} autoComplete="new-password" required autoFocus /></label>
      <label>Repita a nova senha<input name="confirmacao" type="password" minLength={8} autoComplete="new-password" required /></label>
      {erro && <p role="alert" className="alerta">{erro}</p>}
      <button>Salvar nova senha</button>
    </form>}
  </PainelAcesso>
}
