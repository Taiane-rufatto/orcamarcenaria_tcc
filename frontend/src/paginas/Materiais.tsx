import { useEffect, useState, type FormEvent } from 'react'
import {
  criarMaterial, editarMaterial, exibirValor, inativarMaterial, listarMateriais,
  type Material, type Situacao,
} from '../servicos/catalogo'

const UNIDADES = ['un', 'm', 'm²', 'ml', 'ch', 'kg', 'L', 'pç']

export function Materiais() {
  const [itens, setItens] = useState<Material[]>([])
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState<Situacao>('ativos')
  const [editando, setEditando] = useState<Material | null>(null)
  const [erro, setErro] = useState('')

  // Mudar a versão dispara nova consulta (após salvar ou inativar).
  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao((v) => v + 1)

  useEffect(() => {
    let atual = true
    listarMateriais(busca, situacao)
      .then((lista) => { if (atual) { setItens(lista); setErro('') } })
      .catch((causa) => { if (atual) setErro(causa instanceof Error ? causa.message : 'Não foi possível carregar os materiais') })
    return () => { atual = false }
  }, [busca, situacao, versao])

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    const material = {
      nome: String(dados.get('nome')),
      descricao: String(dados.get('descricao') ?? ''),
      unidade: String(dados.get('unidade')),
      custoUnitario: String(dados.get('custo')),
    }
    try {
      if (editando) await editarMaterial(editando.id, material)
      else await criarMaterial(material)
      formulario.reset()
      setEditando(null)
      recarregar()
    } catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível salvar o material') }
  }

  async function inativar(item: Material) {
    if (!window.confirm(`Inativar "${item.nome}"? O registro é preservado, mas sai da lista de ativos.`)) return
    try { await inativarMaterial(item.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível inativar o material') }
  }

  return <main className="pagina">
    <div className="cabecalho-pagina">
      <h1>Materiais</h1>
      <p>Chapas, ferragens e insumos que você usa nos orçamentos, com o custo de cada unidade.</p>
    </div>

    <section className="folha">
      <h2>{editando ? `Editar "${editando.nome}"` : 'Novo material'}</h2>
      <form key={editando?.id ?? 'novo'} onSubmit={salvar}>
        <div className="campos">
          <label>Nome<input name="nome" defaultValue={editando?.nome} required /></label>
          <label>Unidade
            <select name="unidade" defaultValue={editando?.unidade ?? 'un'}>{UNIDADES.map((u) => <option key={u}>{u}</option>)}</select>
          </label>
          <label>Custo unitário (R$)<input name="custo" inputMode="decimal" placeholder="0,0000" defaultValue={editando?.custo_unitario.replace('.', ',')} required /></label>
          <label className="largo">Descrição (opcional)<input name="descricao" maxLength={300} defaultValue={editando?.descricao ?? ''} /></label>
        </div>
        {erro && <p role="alert" className="alerta" style={{ marginTop: 16 }}>{erro}</p>}
        <div className="acoes">
          <button>{editando ? 'Salvar alterações' : 'Cadastrar material'}</button>
          {editando && <button type="button" className="secundario" onClick={() => setEditando(null)}>Cancelar edição</button>}
        </div>
      </form>
    </section>

    <section className="folha">
      <h2>Catálogo</h2>
      <div className="filtros">
        <label>Buscar por nome<input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Ex.: MDF" /></label>
        <label>Situação
          <select value={situacao} onChange={(e) => setSituacao(e.target.value as Situacao)}>
            <option value="ativos">Ativos</option><option value="inativos">Inativos</option><option value="todos">Todos</option>
          </select>
        </label>
      </div>
      {itens.length === 0 ? <p className="vazio">Nenhum material encontrado.</p> : <div className="tabela-rolagem"><table>
        <thead><tr><th>Material</th><th>Unidade</th><th className="valor">Custo unitário</th><th>Situação</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{itens.map((item) => <tr key={item.id} className={item.ativo ? '' : 'linha-inativa'}>
          <td>{item.nome}{item.descricao && <small>{item.descricao}</small>}</td>
          <td data-label="Unidade">{item.unidade}</td>
          <td className="valor" data-label="Custo unitário">{exibirValor(item.custo_unitario)}</td>
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
