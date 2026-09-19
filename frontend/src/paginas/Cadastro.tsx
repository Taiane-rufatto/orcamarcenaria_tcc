import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PainelAcesso } from '../componentes/PainelAcesso'
import { cadastrar, guardarSessao } from '../servicos/autenticacao'

export function Cadastro() {
  const navegar = useNavigate()
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    try {
      guardarSessao(await cadastrar({
        nomeMarcenaria: String(dados.get('nomeMarcenaria')),
        nomeResponsavel: String(dados.get('nomeResponsavel')),
        email: String(dados.get('email')),
        senha: String(dados.get('senha')),
      }))
      navegar('/orcamentos')
    } catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível criar a conta.') }
  }

  return <PainelAcesso titulo="Crie a conta da sua marcenaria">
    <form onSubmit={enviar}>
      <label>Nome da marcenaria<input name="nomeMarcenaria" required /></label>
      <label>Seu nome<input name="nomeResponsavel" autoComplete="name" required /></label>
      <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
      <label>Senha (mínimo 8 caracteres)<input name="senha" type="password" minLength={8} autoComplete="new-password" required /></label>
      {erro && <p role="alert" className="alerta">{erro}</p>}
      <button>Criar conta</button>
    </form>
    <p>Já tem conta? <Link to="/entrar">Entrar</Link></p>
  </PainelAcesso>
}
