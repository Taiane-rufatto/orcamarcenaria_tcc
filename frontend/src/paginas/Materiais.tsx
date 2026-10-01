import { useEffect, useState, type FormEvent } from 'react'
import { FiltroLista, RodapeLista } from '../componentes/FiltroLista'
import { PainelLateral } from '../componentes/PainelLateral'
import {
  criarMaterial, editarMaterial, exibirValor, inativarMaterial, listarMateriais, reativarMaterial,
  type Material, type Situacao,
} from '../servicos/catalogo'

const UNIDADES = ['un', 'm', 'm²', 'ml', 'ch', 'kg', 'L', 'pç']

export function Materiais() {
  const [itens, setItens] = useState<Material[]>([])
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState<Situacao>('ativos')
  // Painel lateral: fechado, criando (null) ou editando um material.
  const [painel, setPainel] = useState<{ editando: Material | null } | null>(null)
  const editando = painel?.editando ?? null
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

  function abrir(material: Material | null) { setErro(''); setPainel({ editando: material }) }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    const material = {
      nome: String(dados.get('nome')),
      descricao: String(dados.get('descricao') ?? ''),
      unidade: String(dados.get('unidade')),
      custoUnitario: String(dados.get('custo')),
    }
    try {
      if (editando) await editarMaterial(editando.id, material)
      else await criarMaterial(material)
      setPainel(null)
      recarregar()
    } catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível salvar o material') }
  }

  async function inativar(item: Material) {
    if (!window.confirm(`Inativar "${item.nome}"? O registro é preservado, mas sai da lista de ativos.`)) return
    try { await inativarMaterial(item.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível inativar o material') }
  }

  async function reativar(item: Material) {
    try { await reativarMaterial(item.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível reativar o material') }
  }

  return <main className="pagina">
    <div className="cabecalho-pagina com-acao">
      <div>
        <h1>Materiais</h1>
        <p>Chapas, ferragens e insumos que você usa nos orçamentos, com o custo de cada unidade.</p>
      </div>
      <button onClick={() => abrir(null)}>+ Novo material</button>
    </div>

    <FiltroLista busca={busca} situacao={situacao} exemplo="Nome do material…" aoBuscar={setBusca} aoFiltrar={setSituacao} />
    {erro && !painel && <p role="alert" className="alerta">{erro}</p>}

    <section className="folha lista">
      {itens.length === 0 ? <p className="vazio">Nenhum material encontrado.</p> : <div className="tabela-rolagem"><table>
        <thead><tr><th>Material</th><th>Unidade</th><th className="valor">Custo unitário (R$)</th><th>Situação</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{itens.map((item) => <tr key={item.id} className={item.ativo ? '' : 'linha-inativa'}>
          <td><b>{item.nome}</b>{item.descricao && <small>{item.descricao}</small>}</td>
          <td data-label="Unidade" className="secundaria">{item.unidade}</td>
          <td className="valor" data-label="Custo unitário">{exibirValor(item.custo_unitario)}</td>
          <td data-label="Situação"><span className={item.ativo ? 'selo' : 'selo inativo'}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
          <td className="acoes-linha">{item.ativo ? <>
            <button className="discreto" onClick={() => abrir(item)}>Editar</button>
            <button className="discreto inativar" onClick={() => inativar(item)}>Inativar</button>
          </> : <button className="discreto" onClick={() => reativar(item)}>Reativar</button>}</td>
        </tr>)}</tbody>
      </table></div>}
      <RodapeLista total={itens.length} singular="material" plural="materiais" situacao={situacao} />
    </section>

    <PainelLateral titulo={editando ? `Editar "${editando.nome}"` : 'Novo material'} aberto={painel !== null} aoFechar={() => setPainel(null)}>
      <form key={editando?.id ?? 'novo'} onSubmit={salvar} className="formulario-painel">
        <label>Nome<input name="nome" defaultValue={editando?.nome} required autoFocus /></label>
        <label>Unidade
          <select name="unidade" defaultValue={editando?.unidade ?? 'un'}>{UNIDADES.map((u) => <option key={u}>{u}</option>)}</select>
        </label>
        <label>Custo unitário (R$)<input name="custo" inputMode="decimal" placeholder="0,0000" defaultValue={editando?.custo_unitario.replace('.', ',')} required /></label>
        {editando && <p className="ajuda">Orçamentos que já usam este material mantêm o custo antigo; o novo vale para os próximos.</p>}
        <label>Descrição (opcional)<input name="descricao" maxLength={300} defaultValue={editando?.descricao ?? ''} /></label>
        {erro && <p role="alert" className="alerta">{erro}</p>}
        <div className="acoes">
          <button>{editando ? 'Salvar alterações' : 'Cadastrar material'}</button>
          <button type="button" className="secundario" onClick={() => setPainel(null)}>Cancelar</button>
        </div>
      </form>
    </PainelLateral>
  </main>
}
