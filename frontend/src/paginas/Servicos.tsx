import { useEffect, useState, type FormEvent } from 'react'
import { FiltroLista, RodapeLista } from '../componentes/FiltroLista'
import { PainelLateral } from '../componentes/PainelLateral'
import {
  criarServico, editarServico, exibirValor, inativarServico, listarServicos, reativarServico,
  type Servico, type Situacao,
} from '../servicos/catalogo'

const COBRANCA = { hora: 'Por hora', unidade: 'Por unidade' }

export function Servicos() {
  const [itens, setItens] = useState<Servico[]>([])
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState<Situacao>('ativos')
  // Painel lateral: fechado, criando (null) ou editando um serviço.
  const [painel, setPainel] = useState<{ editando: Servico | null } | null>(null)
  const editando = painel?.editando ?? null
  const [erro, setErro] = useState('')

  // Mudar a versão dispara nova consulta (após salvar ou inativar).
  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao((v) => v + 1)

  useEffect(() => {
    let atual = true
    listarServicos(busca, situacao)
      .then((lista) => { if (atual) { setItens(lista); setErro('') } })
      .catch((causa) => { if (atual) setErro(causa instanceof Error ? causa.message : 'Não foi possível carregar os serviços') })
    return () => { atual = false }
  }, [busca, situacao, versao])

  function abrir(servico: Servico | null) { setErro(''); setPainel({ editando: servico }) }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    const servico = {
      nome: String(dados.get('nome')),
      descricao: String(dados.get('descricao') ?? ''),
      tipoCobranca: String(dados.get('tipo')),
      valorUnitario: String(dados.get('valor')),
    }
    try {
      if (editando) await editarServico(editando.id, servico)
      else await criarServico(servico)
      setPainel(null)
      recarregar()
    } catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível salvar o serviço') }
  }

  async function inativar(item: Servico) {
    if (!window.confirm(`Inativar "${item.nome}"? O registro é preservado, mas sai da lista de ativos.`)) return
    try { await inativarServico(item.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível inativar o serviço') }
  }

  async function reativar(item: Servico) {
    try { await reativarServico(item.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível reativar o serviço') }
  }

  return <main className="pagina">
    <div className="cabecalho-pagina com-acao">
      <div>
        <h1>Serviços</h1>
        <p>Mão de obra e serviços que você cobra por hora ou por unidade.</p>
      </div>
      <button onClick={() => abrir(null)}>+ Novo serviço</button>
    </div>

    <FiltroLista busca={busca} situacao={situacao} exemplo="Nome do serviço…" aoBuscar={setBusca} aoFiltrar={setSituacao} />
    {erro && !painel && <p role="alert" className="alerta">{erro}</p>}

    <section className="folha lista">
      {itens.length === 0 ? <p className="vazio">Nenhum serviço encontrado.</p> : <div className="tabela-rolagem"><table>
        <thead><tr><th>Serviço</th><th>Cobrança</th><th className="valor">Valor (R$)</th><th>Situação</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{itens.map((item) => <tr key={item.id} className={item.ativo ? '' : 'linha-inativa'}>
          <td><b>{item.nome}</b>{item.descricao && <small>{item.descricao}</small>}</td>
          <td data-label="Cobrança" className="secundaria">{COBRANCA[item.tipo_cobranca]}</td>
          <td className="valor" data-label="Valor">{exibirValor(item.valor_unitario)}</td>
          <td data-label="Situação"><span className={item.ativo ? 'selo' : 'selo inativo'}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
          <td className="acoes-linha">{item.ativo ? <>
            <button className="discreto" onClick={() => abrir(item)}>Editar</button>
            <button className="discreto inativar" onClick={() => inativar(item)}>Inativar</button>
          </> : <button className="discreto" onClick={() => reativar(item)}>Reativar</button>}</td>
        </tr>)}</tbody>
      </table></div>}
      <RodapeLista total={itens.length} singular="serviço" plural="serviços" situacao={situacao} />
    </section>

    <PainelLateral titulo={editando ? `Editar "${editando.nome}"` : 'Novo serviço'} aberto={painel !== null} aoFechar={() => setPainel(null)}>
      <form key={editando?.id ?? 'novo'} onSubmit={salvar} className="formulario-painel">
        <label>Nome<input name="nome" defaultValue={editando?.nome} required autoFocus /></label>
        <label>Cobrança
          <select name="tipo" defaultValue={editando?.tipo_cobranca ?? 'hora'}>
            <option value="hora">Por hora</option><option value="unidade">Por unidade</option>
          </select>
        </label>
        <label>Valor (R$)<input name="valor" inputMode="decimal" placeholder="0,0000" defaultValue={editando?.valor_unitario.replace('.', ',')} required /></label>
        {editando && <p className="ajuda">Orçamentos que já usam este serviço mantêm o valor antigo; o novo vale para os próximos.</p>}
        <label>Descrição (opcional)<input name="descricao" maxLength={300} defaultValue={editando?.descricao ?? ''} /></label>
        {erro && <p role="alert" className="alerta">{erro}</p>}
        <div className="acoes">
          <button>{editando ? 'Salvar alterações' : 'Cadastrar serviço'}</button>
          <button type="button" className="secundario" onClick={() => setPainel(null)}>Cancelar</button>
        </div>
      </form>
    </PainelLateral>
  </main>
}
