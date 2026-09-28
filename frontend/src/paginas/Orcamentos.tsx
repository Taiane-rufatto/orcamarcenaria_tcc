import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { alterarSenha } from '../servicos/autenticacao'
import { criarOrcamento, hojeLocal } from '../servicos/orcamentos'

export function Orcamentos() {
  const [mensagem, setMensagem] = useState<{ texto: string; erro: boolean } | null>(null)
  const [erroNovo, setErroNovo] = useState('')
  const navegar = useNavigate()

  // Lucro e arredondamento não são enviados: a API aplica os padrões (markup 150%, duas casas — D017).
  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    try {
      const orcamento = await criarOrcamento({
        clienteNome: String(dados.get('clienteNome')),
        descricaoProjeto: String(dados.get('descricaoProjeto')),
        dataEmissao: String(dados.get('dataEmissao')),
        dataValidade: String(dados.get('dataValidade')),
      })
      navegar(`/orcamentos/${orcamento.id}`)
    } catch (causa) {
      setErroNovo(causa instanceof Error ? causa.message : 'Não foi possível criar o orçamento.')
    }
  }

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
      <p>Comece pelos dados do cliente e do projeto. Depois você inclui materiais, serviços e custos, e o sistema calcula o preço.</p>
    </div>

    <section className="folha">
      <h2>Novo orçamento</h2>
      <form onSubmit={criar}>
        <div className="campos">
          <label>Cliente<input name="clienteNome" required /></label>
          <label>Descrição do projeto<input name="descricaoProjeto" placeholder="Ex.: armário de cozinha" required /></label>
          <label>Data de emissão<input name="dataEmissao" type="date" defaultValue={hojeLocal()} required /></label>
          <label>Válido até<input name="dataValidade" type="date" required /></label>
        </div>
        {erroNovo && <p role="alert" className="alerta" style={{ marginTop: 16 }}>{erroNovo}</p>}
        <div className="acoes"><button>Criar orçamento</button></div>
      </form>
    </section>

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
