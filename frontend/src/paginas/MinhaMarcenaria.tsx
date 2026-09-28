import { useEffect, useState, type FormEvent } from 'react'
import { alterarSenha } from '../servicos/autenticacao'
import { obterConfiguracao, salvarDadosMarcenaria, salvarPadroes, type Configuracao } from '../servicos/configuracoes'
import { paraCampo, type ModoLucro, type RegraArredondamento } from '../servicos/orcamentos'

type Mensagem = { texto: string; erro: boolean } | null

// Página "Minha marcenaria" (RF05, RF19–RF22, D024): dados que saem no PDF, padrões dos
// orçamentos novos e troca de senha. A tela não calcula nada; o multiplicador vem da API.
export function MinhaMarcenaria() {
  const [configuracao, setConfiguracao] = useState<Configuracao | null>(null)
  const [mensagens, setMensagens] = useState<{ dados: Mensagem; padroes: Mensagem; senha: Mensagem }>({ dados: null, padroes: null, senha: null })
  const avisar = (secao: keyof typeof mensagens, mensagem: Mensagem) => setMensagens((atuais) => ({ ...atuais, [secao]: mensagem }))
  const erroDe = (causa: unknown, padrao: string) => ({ texto: causa instanceof Error ? causa.message : padrao, erro: true })

  useEffect(() => {
    let atual = true
    obterConfiguracao()
      .then((dados) => { if (atual) setConfiguracao(dados) })
      .catch((causa) => {
        if (atual) setMensagens((atuais) => ({ ...atuais, dados: { texto: causa instanceof Error ? causa.message : 'Não foi possível carregar a configuração', erro: true } }))
      })
    return () => { atual = false }
  }, [])

  async function salvarDados(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = Object.fromEntries(new FormData(evento.currentTarget)) as Record<string, string>
    try {
      setConfiguracao(await salvarDadosMarcenaria(dados))
      avisar('dados', { texto: 'Dados salvos. Eles aparecem nos próximos PDFs.', erro: false })
    } catch (causa) { avisar('dados', erroDe(causa, 'Não foi possível salvar os dados')) }
  }

  async function salvarPadroesDoOrcamento(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    try {
      setConfiguracao(await salvarPadroes({
        modoLucro: String(dados.get('modoLucro')) as ModoLucro,
        percentualLucro: String(dados.get('percentualLucro')),
        regraArredondamento: String(dados.get('regraArredondamento')) as RegraArredondamento,
        validadeDias: Number(dados.get('validadeDias')), // dias, não é valor monetário
      }))
      avisar('padroes', { texto: 'Padrões salvos. Valem para os próximos orçamentos; os existentes não mudam.', erro: false })
    } catch (causa) { avisar('padroes', erroDe(causa, 'Não foi possível salvar os padrões')) }
  }

  async function trocarSenha(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    try {
      await alterarSenha(String(dados.get('senhaAtual')), String(dados.get('novaSenha')))
      formulario.reset()
      avisar('senha', { texto: 'Senha alterada com sucesso.', erro: false })
    } catch (causa) { avisar('senha', erroDe(causa, 'Não foi possível alterar a senha.')) }
  }

  const aviso = (mensagem: Mensagem) => mensagem &&
    <p role={mensagem.erro ? 'alert' : 'status'} className={mensagem.erro ? 'alerta' : 'aviso'} style={{ marginTop: 16 }}>{mensagem.texto}</p>

  if (!configuracao) return <main className="pagina"><h1>Minha marcenaria</h1>{aviso(mensagens.dados) ?? <p>Carregando…</p>}</main>
  const { marcenaria: m, padroes: p } = configuracao

  return <main className="pagina">
    <div className="cabecalho-pagina">
      <h1>Minha marcenaria</h1>
      <p>Os dados da empresa saem no PDF do orçamento. Os padrões são aplicados a cada orçamento novo.</p>
    </div>

    <section className="folha">
      <h2>Dados da marcenaria</h2>
      <form key={JSON.stringify(m)} onSubmit={salvarDados}>
        <div className="campos">
          <label>Nome da marcenaria<input name="nome" defaultValue={m.nome} required /></label>
          <label>Responsável<input name="responsavel" defaultValue={m.responsavel} required /></label>
          <label>Telefone (opcional)<input name="telefone" type="tel" maxLength={30} defaultValue={m.telefone ?? ''} /></label>
          <label>E-mail de contato (opcional)<input name="email" type="email" maxLength={200} defaultValue={m.email ?? ''} /></label>
          <label>CNPJ (opcional)<input name="cnpj" maxLength={18} placeholder="00.000.000/0000-00" defaultValue={m.cnpj ?? ''} /></label>
          <label className="largo">Endereço (opcional)<input name="endereco" maxLength={300} defaultValue={m.endereco ?? ''} /></label>
        </div>
        {aviso(mensagens.dados)}
        <div className="acoes"><button>Salvar dados</button></div>
      </form>
    </section>

    <section className="folha">
      <h2>Padrões do orçamento</h2>
      <p className="ajuda">Todo orçamento novo começa com estes valores, que podem ser mudados em cada um. Mudar aqui não altera orçamentos já criados.</p>
      <form key={JSON.stringify(p)} onSubmit={salvarPadroesDoOrcamento}>
        <div className="campos">
          <label>Forma de lucro
            <select name="modoLucro" defaultValue={p.modoLucro}>
              <option value="markup">Markup — sobre o custo</option>
              <option value="margem">Margem — sobre o preço de venda</option>
            </select>
          </label>
          <label>Percentual de lucro (%)<input name="percentualLucro" inputMode="decimal" defaultValue={paraCampo(p.percentualLucro)} required /></label>
          <label>Arredondamento do preço
            <select name="regraArredondamento" defaultValue={p.regraArredondamento}>
              <option value="duas_casas">Não arredondar (centavos)</option>
              <option value="real_inteiro">Para cima, ao real inteiro</option>
              <option value="dezena">Para cima, à dezena</option>
            </select>
          </label>
          <label>Validade (dias)<input name="validadeDias" type="number" min={1} max={365} step={1} defaultValue={p.validadeDias} required /></label>
        </div>
        {p.multiplicadorEquivalente && <p className="aviso" style={{ marginTop: 16 }}>
          Markup de {paraCampo(p.percentualLucro)}% equivale a cobrar {paraCampo(p.multiplicadorEquivalente)}× o custo.
        </p>}
        {aviso(mensagens.padroes)}
        <div className="acoes"><button>Salvar padrões</button></div>
      </form>
    </section>

    <section className="folha">
      <h2>Alterar senha</h2>
      <form onSubmit={trocarSenha}>
        <div className="campos">
          <label>Senha atual<input name="senhaAtual" type="password" autoComplete="current-password" required /></label>
          <label>Nova senha<input name="novaSenha" type="password" minLength={8} autoComplete="new-password" required /></label>
        </div>
        {aviso(mensagens.senha)}
        <div className="acoes"><button>Alterar senha</button></div>
      </form>
    </section>
  </main>
}
