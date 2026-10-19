import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useConfirmar } from '../hooks/useConfirmar'
import { FiltroLista, RodapeLista } from '../componentes/FiltroLista'
import { PainelLateral } from '../componentes/PainelLateral'
import {
  confirmarPrecoMaterial, criarMaterial, editarMaterial, exibirValor, historicoMaterial, inativarMaterial, listarMateriais,
  reativarMaterial, type LinhaHistorico, type Material, type Situacao,
} from '../servicos/catalogo'
import { listarFornecedores, type Fornecedor } from '../servicos/fornecedores'

const UNIDADES = ['un', 'm', 'm²', 'ml', 'ch', 'kg', 'L', 'pç']

// Só exibição: "há 12 dias". Os dias vêm prontos da API; a tela não calcula datas.
const haQuantosDias = (dias: number) => dias === 0 ? 'hoje' : dias === 1 ? 'ontem' : `há ${dias} dias`
const exibirDataHora = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

export function Materiais() {
  const { confirmar, dialogo } = useConfirmar()
  const [itens, setItens] = useState<Material[]>([])
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState<Situacao>('ativos')
  // Painel lateral: fechado, criando (null) ou editando um material.
  const [painel, setPainel] = useState<{ editando: Material | null } | null>(null)
  const editando = painel?.editando ?? null
  const [erro, setErro] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  // Spec 020: fornecedores ativos para escolher no material e histórico de preço do material aberto.
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [historico, setHistorico] = useState<LinhaHistorico[]>([])
  // RF53: material novo já vem com o fornecedor padrão marcado; a pessoa só troca quando for outro.
  const padrao = fornecedores.find((f) => f.padrao)
  // Enter repetido não pode gravar o mesmo cadastro duas vezes enquanto o envio anterior não terminou.
  const salvando = useRef(false)

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

  useEffect(() => {
    let atual = true
    listarFornecedores('', 'ativos').then((lista) => { if (atual) setFornecedores(lista) }).catch(() => { /* a lista do material continua funcionando sem fornecedores */ })
    return () => { atual = false }
  }, [versao])

  function abrir(material: Material | null) {
    setErro(''); setConfirmacao(''); setHistorico([]); setPainel({ editando: material })
    if (material) historicoMaterial(material.id).then(setHistorico).catch(() => { /* o histórico é só consulta */ })
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando.current) return
    salvando.current = true
    const formulario = evento.currentTarget
    // Cadastro novo (Enter ou botão) mantém o painel aberto para o próximo; Esc ou ✕ fecham. Na edição, salva e fecha.
    const cadastrarOutro = !editando
    const dados = new FormData(formulario)
    const material = {
      nome: String(dados.get('nome')),
      descricao: String(dados.get('descricao') ?? ''),
      unidade: String(dados.get('unidade')),
      custoUnitario: String(dados.get('custo')),
      fornecedorId: String(dados.get('fornecedorId') ?? ''), // vazio = sem fornecedor
    }
    try {
      if (editando) await editarMaterial(editando.id, material)
      else await criarMaterial(material)
      recarregar()
      if (cadastrarOutro) {
        setConfirmacao(`✓ ${material.nome.trim().toLocaleUpperCase('pt-BR')} cadastrado`); setErro('')
        formulario.reset()
        // a unidade escolhida vale para o próximo, que costuma ser parecido
        ;(formulario.elements.namedItem('unidade') as HTMLSelectElement).value = material.unidade
        ;(formulario.elements.namedItem('fornecedorId') as HTMLSelectElement).value = material.fornecedorId
        ;(formulario.elements.namedItem('nome') as HTMLInputElement).focus()
      } else setPainel(null)
    } catch (causa) { setConfirmacao(''); setErro(causa instanceof Error ? causa.message : 'Não foi possível salvar o material') } finally { salvando.current = false }
  }

  async function inativar(item: Material) {
    if (!await confirmar({ titulo: `Inativar "${item.nome}"?`, texto: 'O registro é preservado, mas sai da lista de ativos.', rotulo: 'Inativar' })) return
    try { await inativarMaterial(item.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível inativar o material') }
  }

  // Spec 020 (RF51): "o preço continua o mesmo" renova a data sem mudar o custo.
  async function confirmarPreco(item: Material) {
    try { await confirmarPrecoMaterial(item.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível confirmar o preço') }
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
        <thead><tr><th>Material</th><th>Unidade</th><th className="valor">Custo unitário (R$)</th><th>Fornecedor</th><th>Preço atualizado</th><th>Situação</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{itens.map((item) => <tr key={item.id} className={item.ativo ? '' : 'linha-inativa'}>
          <td><b>{item.nome}</b>{item.descricao && <small>{item.descricao}</small>}</td>
          <td data-label="Unidade" className="secundaria">{item.unidade}</td>
          <td className="valor" data-label="Custo unitário">{exibirValor(item.custo_unitario)}</td>
          <td data-label="Fornecedor" className="secundaria">{item.fornecedor_nome ?? '—'}</td>
          <td data-label="Preço atualizado">
            {haQuantosDias(item.dias_desde_atualizacao)}
            {item.preco_antigo && item.ativo && <> <span className="selo enviado">Preço antigo</span> <button className="discreto" onClick={() => confirmarPreco(item)}>Continua o mesmo</button></>}
          </td>
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
      <form key={editando?.id ?? `novo-${padrao?.id ?? ''}`} onSubmit={salvar} className="formulario-painel">
        <label>Nome<input name="nome" defaultValue={editando?.nome} required autoFocus /></label>
        <label>Unidade
          <select name="unidade" defaultValue={editando?.unidade ?? 'un'}>{UNIDADES.map((u) => <option key={u}>{u}</option>)}</select>
        </label>
        <label>Custo unitário (R$)<input name="custo" inputMode="decimal" placeholder="0,0000" defaultValue={editando?.custo_unitario.replace('.', ',')} required /></label>
        <label>Fornecedor (opcional)
          <select name="fornecedorId" defaultValue={editando ? editando.fornecedor_id ?? '' : padrao?.id ?? ''}>
            <option value="">Sem fornecedor</option>
            {editando?.fornecedor_id && !fornecedores.some((f) => f.id === editando.fornecedor_id) &&
              <option value={editando.fornecedor_id}>{editando.fornecedor_nome} (inativo)</option>}
            {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </label>
        {editando && <p className="ajuda">Orçamentos que já usam este material mantêm o custo antigo; o novo vale para os próximos.</p>}
        <label>Descrição (opcional)<input name="descricao" maxLength={300} defaultValue={editando?.descricao ?? ''} /></label>
        {!editando && <p className="ajuda">Enter cadastra e abre um formulário em branco. Esc ou ✕ fecham o painel.</p>}
        {editando && historico.length > 0 && <details className="historico-preco">
          <summary>Histórico de preço ({historico.length})</summary>
          <ul className="historico">{historico.map((linha) => <li key={linha.registrado_em}>
            {exibirDataHora(linha.registrado_em)} · {exibirValor(linha.custo_unitario)}{linha.fornecedor_nome && ` · ${linha.fornecedor_nome}`}
          </li>)}</ul>
        </details>}
        {confirmacao && <p role="status" className="salvo">{confirmacao}</p>}
        {erro && <p role="alert" className="alerta">{erro}</p>}
        <div className="acoes">
          <button>{editando ? 'Salvar alterações' : 'Cadastrar material'}</button>
          <button type="button" className="secundario" onClick={() => setPainel(null)}>{editando ? 'Cancelar' : 'Fechar'}</button>
        </div>
      </form>
    </PainelLateral>
    {dialogo}
  </main>
}
