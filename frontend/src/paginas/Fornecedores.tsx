import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FiltroLista, RodapeLista } from '../componentes/FiltroLista'
import { PainelLateral } from '../componentes/PainelLateral'
import {
  criarFornecedor, editarFornecedor, inativarFornecedor, listarFornecedores, reativarFornecedor, tirarPadrao, usarComoPadrao,
  type Fornecedor,
} from '../servicos/fornecedores'
import type { Situacao } from '../servicos/catalogo'

// Cadastro de fornecedores (RF49, spec 020), no mesmo formato de clientes, materiais e serviços.
export function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState<Situacao>('ativos')
  // Painel lateral: fechado, criando (null) ou editando um fornecedor.
  const [painel, setPainel] = useState<{ editando: Fornecedor | null } | null>(null)
  const editando = painel?.editando ?? null
  const [erro, setErro] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  // Enter repetido não pode gravar o mesmo cadastro duas vezes enquanto o envio anterior não terminou.
  const salvando = useRef(false)

  // Mudar a versão dispara nova consulta (após salvar, inativar ou reativar).
  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao((v) => v + 1)

  useEffect(() => {
    let atual = true
    listarFornecedores(busca, situacao)
      .then((lista) => { if (atual) { setFornecedores(lista); setErro('') } })
      .catch((causa) => { if (atual) setErro(causa instanceof Error ? causa.message : 'Não foi possível carregar os fornecedores') })
    return () => { atual = false }
  }, [busca, situacao, versao])

  function abrir(fornecedor: Fornecedor | null) { setErro(''); setConfirmacao(''); setPainel({ editando: fornecedor }) }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando.current) return
    salvando.current = true
    const formulario = evento.currentTarget
    // Cadastro novo (Enter ou botão) mantém o painel aberto para o próximo; Esc ou ✕ fecham. Na edição, salva e fecha.
    const cadastrarOutro = !editando
    const dados = new FormData(formulario)
    const fornecedor = { nome: String(dados.get('nome')), telefone: String(dados.get('telefone') ?? ''), endereco: String(dados.get('endereco') ?? '') }
    try {
      if (editando) await editarFornecedor(editando.id, fornecedor)
      else await criarFornecedor(fornecedor)
      recarregar()
      if (cadastrarOutro) {
        setConfirmacao(`✓ ${fornecedor.nome.trim().toLocaleUpperCase('pt-BR')} cadastrado`); setErro('')
        formulario.reset()
        ;(formulario.elements.namedItem('nome') as HTMLInputElement).focus()
      } else setPainel(null)
    } catch (causa) { setConfirmacao(''); setErro(causa instanceof Error ? causa.message : 'Não foi possível salvar o fornecedor') } finally { salvando.current = false }
  }

  // Não há exclusão: o fornecedor inativo continua no histórico de preços dos materiais.
  async function inativar(fornecedor: Fornecedor) {
    if (!window.confirm(`Inativar "${fornecedor.nome}"? Ele não aparece para novos preços, mas continua no histórico dos materiais.`)) return
    try { await inativarFornecedor(fornecedor.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível inativar o fornecedor') }
  }

  // RF53: o fornecedor padrão já vem escolhido ao cadastrar material novo.
  async function alternarPadrao(fornecedor: Fornecedor) {
    try { await (fornecedor.padrao ? tirarPadrao() : usarComoPadrao(fornecedor.id)); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível mudar o fornecedor padrão') }
  }

  async function reativar(fornecedor: Fornecedor) {
    try { await reativarFornecedor(fornecedor.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível reativar o fornecedor') }
  }

  return <main className="pagina">
    <div className="cabecalho-pagina com-acao">
      <div>
        <h1>Fornecedores</h1>
        <p>As lojas e madeireiras onde você compra. Em cada material você diz de quem vem o preço. O fornecedor padrão já vem marcado no material novo.</p>
      </div>
      <button onClick={() => abrir(null)}>+ Novo fornecedor</button>
    </div>

    <FiltroLista busca={busca} situacao={situacao} exemplo="Nome do fornecedor…" aoBuscar={setBusca} aoFiltrar={setSituacao} />
    {erro && !painel && <p role="alert" className="alerta">{erro}</p>}

    <section className="folha lista">
      {fornecedores.length === 0 ? <p className="vazio">Nenhum fornecedor encontrado.</p> : <div className="tabela-rolagem"><table>
        <thead><tr><th>Fornecedor</th><th>Telefone</th><th>Situação</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{fornecedores.map((fornecedor) => <tr key={fornecedor.id} className={fornecedor.ativo ? '' : 'linha-inativa'}>
          <td><b>{fornecedor.nome}</b>{fornecedor.padrao && <> <span className="selo">Padrão</span></>}{fornecedor.endereco && <small>{fornecedor.endereco}</small>}</td>
          <td data-label="Telefone" className="secundaria">{fornecedor.telefone ?? '—'}</td>
          <td data-label="Situação"><span className={fornecedor.ativo ? 'selo' : 'selo inativo'}>{fornecedor.ativo ? 'Ativo' : 'Inativo'}</span></td>
          <td className="acoes-linha">{fornecedor.ativo ? <>
            <button className="discreto" onClick={() => alternarPadrao(fornecedor)}>{fornecedor.padrao ? 'Tirar padrão' : 'Usar como padrão'}</button>
            <button className="discreto" onClick={() => abrir(fornecedor)}>Editar</button>
            <button className="discreto inativar" onClick={() => inativar(fornecedor)}>Inativar</button>
          </> : <button className="discreto" onClick={() => reativar(fornecedor)}>Reativar</button>}</td>
        </tr>)}</tbody>
      </table></div>}
      <RodapeLista total={fornecedores.length} singular="fornecedor" plural="fornecedores" situacao={situacao} />
    </section>

    <PainelLateral titulo={editando ? `Editar "${editando.nome}"` : 'Novo fornecedor'} aberto={painel !== null} aoFechar={() => setPainel(null)}>
      <form key={editando?.id ?? 'novo'} onSubmit={salvar} className="formulario-painel">
        <label>Nome<input name="nome" defaultValue={editando?.nome} required autoFocus /></label>
        <label>Telefone (opcional)<input name="telefone" type="tel" maxLength={30} defaultValue={editando?.telefone ?? ''} /></label>
        <label>Endereço (opcional)<input name="endereco" maxLength={300} defaultValue={editando?.endereco ?? ''} /></label>
        {!editando && <p className="ajuda">Enter cadastra e abre um formulário em branco. Esc ou ✕ fecham o painel.</p>}
        {confirmacao && <p role="status" className="salvo">{confirmacao}</p>}
        {erro && <p role="alert" className="alerta">{erro}</p>}
        <div className="acoes">
          <button>{editando ? 'Salvar alterações' : 'Cadastrar fornecedor'}</button>
          <button type="button" className="secundario" onClick={() => setPainel(null)}>{editando ? 'Cancelar' : 'Fechar'}</button>
        </div>
      </form>
    </PainelLateral>
  </main>
}
