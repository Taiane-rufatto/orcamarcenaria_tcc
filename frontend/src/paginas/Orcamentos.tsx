import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { obterConfiguracao } from '../servicos/configuracoes'
import { listarClientes, type Cliente } from '../servicos/clientes'
import {
  criarOrcamento, exibirData, exibirMoeda, hojeLocal, listarOrcamentos, SITUACOES,
  type FiltrosListagem, type ResumoOrcamento, type Situacao,
} from '../servicos/orcamentos'

export function Orcamentos() {
  const [erroNovo, setErroNovo] = useState('')
  const navegar = useNavigate()
  const [orcamentos, setOrcamentos] = useState<ResumoOrcamento[] | null>(null)
  const [filtros, setFiltros] = useState<FiltrosListagem>({ busca: '', situacao: '', de: '', ate: '' })
  const [erroLista, setErroLista] = useState('')
  const filtrar = (campo: keyof FiltrosListagem, valor: string) => setFiltros((atuais) => ({ ...atuais, [campo]: valor }))
  const [clientes, setClientes] = useState<Cliente[] | null>(null)
  const [validadeDias, setValidadeDias] = useState<number | null>(null)

  // Só clientes ativos podem receber orçamento novo (D021).
  useEffect(() => {
    let atual = true
    Promise.all([listarClientes('', 'ativos'), obterConfiguracao()])
      .then(([lista, configuracao]) => { if (atual) { setClientes(lista); setValidadeDias(configuracao.padroes.validadeDias) } })
      .catch((causa) => { if (atual) setErroNovo(causa instanceof Error ? causa.message : 'Não foi possível carregar os clientes') })
    return () => { atual = false }
  }, [])

  // RF37: a API filtra e já aplica o vencimento (RF36); a tela só exibe.
  useEffect(() => {
    let atual = true
    listarOrcamentos(filtros)
      .then((lista) => { if (atual) { setOrcamentos(lista); setErroLista('') } })
      .catch((causa) => { if (atual) setErroLista(causa instanceof Error ? causa.message : 'Não foi possível carregar os orçamentos') })
    return () => { atual = false }
  }, [filtros])

  // Lucro, arredondamento e validade em branco vêm da configuração da marcenaria (D024).
  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    try {
      const orcamento = await criarOrcamento({
        clienteId: String(dados.get('clienteId')),
        descricaoProjeto: String(dados.get('descricaoProjeto')),
        dataEmissao: String(dados.get('dataEmissao')),
        dataValidade: String(dados.get('dataValidade')) || undefined,
      })
      navegar(`/orcamentos/${orcamento.id}`)
    } catch (causa) {
      setErroNovo(causa instanceof Error ? causa.message : 'Não foi possível criar o orçamento.')
    }
  }

  return <main className="pagina">
    <div className="cabecalho-pagina">
      <h1>Orçamentos</h1>
      <p>Seus orçamentos, dos mais recentes aos mais antigos. Rascunhos ficam aqui até serem registrados e podem ser reabertos para edição.</p>
    </div>

    <section className="folha">
      <h2>Meus orçamentos</h2>
      <div className="filtros filtros-orcamento">
        <label>Buscar por cliente<input value={filtros.busca} onChange={(e) => filtrar('busca', e.target.value)} placeholder="Nome do cliente" /></label>
        <label>Situação
          <select value={filtros.situacao} onChange={(e) => filtrar('situacao', e.target.value)}>
            <option value="">Todas</option>
            {(Object.keys(SITUACOES) as Situacao[]).map((s) => <option key={s} value={s}>{SITUACOES[s]}</option>)}
          </select>
        </label>
        <label>Emitido a partir de<input type="date" value={filtros.de} onChange={(e) => filtrar('de', e.target.value)} /></label>
        <label>Emitido até<input type="date" value={filtros.ate} onChange={(e) => filtrar('ate', e.target.value)} /></label>
      </div>
      {erroLista && <p role="alert" className="alerta">{erroLista}</p>}
      {orcamentos && (orcamentos.length === 0 ? <p className="vazio">Nenhum orçamento encontrado.</p> : <div className="tabela-rolagem"><table>
        <thead><tr><th>Nº</th><th>Cliente e projeto</th><th>Emissão</th><th>Validade</th><th className="valor">Preço final</th><th>Situação</th></tr></thead>
        <tbody>{orcamentos.map((o) => <tr key={o.id}>
          <td><Link to={`/orcamentos/${o.id}`}>{o.numero === null ? 'Rascunho' : `Nº ${o.numero}`}</Link></td>
          <td data-label="Cliente">{o.clienteNome}<small>{o.descricaoProjeto}</small></td>
          <td data-label="Emissão">{exibirData(o.dataEmissao)}</td>
          <td data-label="Validade">{exibirData(o.dataValidade)}</td>
          <td className="valor" data-label="Preço final">{exibirMoeda(o.precoFinal)}</td>
          <td data-label="Situação"><span className={`selo ${o.situacao}`}>{SITUACOES[o.situacao]}</span></td>
        </tr>)}</tbody>
      </table></div>)}
    </section>

    <section className="folha">
      <h2>Novo orçamento</h2>
      {clientes?.length === 0 && <p className="aviso">Cadastre um cliente antes de criar o orçamento: <Link to="/clientes">ir para Clientes</Link>.</p>}
      {clientes && clientes.length > 0 && <form onSubmit={criar}>
        <div className="campos">
          <label>Cliente
            <select name="clienteId" required defaultValue="">
              <option value="" disabled>Selecione…</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.telefone ? ` — ${c.telefone}` : ''}</option>)}
            </select>
          </label>
          <label>Descrição do projeto<input name="descricaoProjeto" placeholder="Ex.: armário de cozinha" required /></label>
          <label>Data de emissão<input name="dataEmissao" type="date" defaultValue={hojeLocal()} required /></label>
          <label>Válido até (opcional)<input name="dataValidade" type="date" /></label>
        </div>
        {validadeDias !== null && <p className="ajuda" style={{ marginTop: 12 }}>
          Em branco, vale {validadeDias} dias após a emissão, como definido em <Link to="/minha-marcenaria">Minha marcenaria</Link>.
        </p>}
        {erroNovo && <p role="alert" className="alerta" style={{ marginTop: 16 }}>{erroNovo}</p>}
        <div className="acoes"><button>Criar orçamento</button></div>
      </form>}
    </section>

  </main>
}
