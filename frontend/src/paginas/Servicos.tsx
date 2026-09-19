import { useEffect, useState, type FormEvent } from 'react'
import {
  criarServico, editarServico, exibirValor, inativarServico, listarServicos,
  type Servico, type Situacao,
} from '../servicos/catalogo'

const COBRANCA = { hora: 'Por hora', unidade: 'Por unidade' }

export function Servicos() {
  const [itens, setItens] = useState<Servico[]>([])
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState<Situacao>('ativos')
  const [editando, setEditando] = useState<Servico | null>(null)
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

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    const servico = {
      nome: String(dados.get('nome')),
      descricao: String(dados.get('descricao') ?? ''),
      tipoCobranca: String(dados.get('tipo')),
      valorUnitario: String(dados.get('valor')),
    }
    try {
      if (editando) await editarServico(editando.id, servico)
      else await criarServico(servico)
      formulario.reset()
      setEditando(null)
      recarregar()
    } catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível salvar o serviço') }
  }

  async function inativar(item: Servico) {
    if (!window.confirm(`Inativar "${item.nome}"? O registro é preservado, mas sai da lista de ativos.`)) return
    try { await inativarServico(item.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível inativar o serviço') }
  }

  return <main className="pagina">
    <div className="cabecalho-pagina">
      <h1>Serviços</h1>
      <p>Mão de obra e serviços que você cobra por hora ou por unidade.</p>
    </div>

    <section className="folha">
      <h2>{editando ? `Editar "${editando.nome}"` : 'Novo serviço'}</h2>
      <form key={editando?.id ?? 'novo'} onSubmit={salvar}>
        <div className="campos">
          <label>Nome<input name="nome" defaultValue={editando?.nome} required /></label>
          <label>Cobrança
            <select name="tipo" defaultValue={editando?.tipo_cobranca ?? 'hora'}>
              <option value="hora">Por hora</option><option value="unidade">Por unidade</option>
            </select>
          </label>
          <label>Valor (R$)<input name="valor" inputMode="decimal" placeholder="0,0000" defaultValue={editando?.valor_unitario.replace('.', ',')} required /></label>
          <label className="largo">Descrição (opcional)<input name="descricao" maxLength={300} defaultValue={editando?.descricao ?? ''} /></label>
        </div>
        {erro && <p role="alert" className="alerta" style={{ marginTop: 16 }}>{erro}</p>}
        <div className="acoes">
          <button>{editando ? 'Salvar alterações' : 'Cadastrar serviço'}</button>
          {editando && <button type="button" className="secundario" onClick={() => setEditando(null)}>Cancelar edição</button>}
        </div>
      </form>
    </section>

    <section className="folha">
      <h2>Catálogo</h2>
      <div className="filtros">
        <label>Buscar por nome<input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Ex.: montagem" /></label>
        <label>Situação
          <select value={situacao} onChange={(e) => setSituacao(e.target.value as Situacao)}>
            <option value="ativos">Ativos</option><option value="inativos">Inativos</option><option value="todos">Todos</option>
          </select>
        </label>
      </div>
      {itens.length === 0 ? <p className="vazio">Nenhum serviço encontrado.</p> : <div className="tabela-rolagem"><table>
        <thead><tr><th>Serviço</th><th>Cobrança</th><th className="valor">Valor</th><th>Situação</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{itens.map((item) => <tr key={item.id} className={item.ativo ? '' : 'linha-inativa'}>
          <td>{item.nome}{item.descricao && <small>{item.descricao}</small>}</td>
          <td data-label="Cobrança">{COBRANCA[item.tipo_cobranca]}</td>
          <td className="valor" data-label="Valor">{exibirValor(item.valor_unitario)}</td>
          <td data-label="Situação"><span className={item.ativo ? 'selo' : 'selo inativo'}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
          <td className="acoes-linha">{item.ativo && <>
            <button className="discreto" onClick={() => setEditando(item)}>Editar</button>
            <button className="discreto" onClick={() => inativar(item)}>Inativar</button>
          </>}</td>
        </tr>)}</tbody>
      </table></div>}
    </section>
  </main>
}
