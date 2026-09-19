import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PainelAcesso } from '../componentes/PainelAcesso'
import { entrar, guardarSessao } from '../servicos/autenticacao'

export function Entrar() {
  const navegar = useNavigate()
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    try {
      guardarSessao(await entrar(String(dados.get('email')), String(dados.get('senha'))))
      navegar('/orcamentos')
    } catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível entrar.') }
  }

  return <PainelAcesso titulo="Entrar">
    <form onSubmit={enviar}>
      <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
      <label>Senha<input name="senha" type="password" autoComplete="current-password" required /></label>
      {erro && <p role="alert" className="alerta">{erro}</p>}
      <button>Entrar</button>
    </form>
    <p>Ainda não tem conta? <Link to="/cadastro">Criar conta</Link></p>
  </PainelAcesso>
}
