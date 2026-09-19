import { useState, type FormEvent } from 'react'
import { alterarSenha } from '../servicos/autenticacao'

export function Orcamentos() {
  const [mensagem, setMensagem] = useState<{ texto: string; erro: boolean } | null>(null)

  async function trocar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    try {
      await alterarSenha(String(dados.get('senhaAtual')), String(dados.get('novaSenha')))
      formulario.reset()
      setMensagem({ texto: 'Senha alterada com sucesso.', erro: false })
    } catch (causa) {
      setMensagem({ texto: causa instanceof Error ? causa.message : 'Não foi possível alterar a senha.', erro: true })
    }
  }

  return <main className="pagina">
    <div className="cabecalho-pagina">
      <h1>Orçamentos</h1>
      <p>Nenhum orçamento cadastrado neste momento.</p>
    </div>

    <section className="folha">
      <h2>Alterar senha</h2>
      <form onSubmit={trocar}>
        <div className="campos">
          <label>Senha atual<input name="senhaAtual" type="password" autoComplete="current-password" required /></label>
          <label>Nova senha<input name="novaSenha" type="password" minLength={8} autoComplete="new-password" required /></label>
        </div>
        {mensagem && <p role={mensagem.erro ? 'alert' : 'status'} className={mensagem.erro ? 'alerta' : 'aviso'} style={{ marginTop: 16 }}>{mensagem.texto}</p>}
        <div className="acoes"><button>Alterar senha</button></div>
      </form>
    </section>
  </main>
}
