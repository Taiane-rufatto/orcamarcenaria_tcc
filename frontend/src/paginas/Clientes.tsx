import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FiltroLista, RodapeLista } from '../componentes/FiltroLista'
import { PainelLateral } from '../componentes/PainelLateral'
import {
  criarCliente, editarCliente, inativarCliente, listarClientes, reativarCliente, type Cliente,
} from '../servicos/clientes'
import type { Situacao } from '../servicos/catalogo'

// Cadastro de clientes (US06, RF08–RF10), no mesmo formato de materiais e serviços.
export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState<Situacao>('ativos')
  // Painel lateral: fechado, criando (null) ou editando um cliente.
  const [painel, setPainel] = useState<{ editando: Cliente | null } | null>(null)
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
    listarClientes(busca, situacao)
      .then((lista) => { if (atual) { setClientes(lista); setErro('') } })
      .catch((causa) => { if (atual) setErro(causa instanceof Error ? causa.message : 'Não foi possível carregar os clientes') })
    return () => { atual = false }
  }, [busca, situacao, versao])

  function abrir(cliente: Cliente | null) { setErro(''); setConfirmacao(''); setPainel({ editando: cliente }) }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando.current) return
    salvando.current = true
    const formulario = evento.currentTarget
    // Cadastro novo (Enter ou botão) mantém o painel aberto para o próximo; Esc ou ✕ fecham. Na edição, salva e fecha.
    const cadastrarOutro = !editando
    const dados = new FormData(formulario)
    const cliente = {
      nome: String(dados.get('nome')),
      telefone: String(dados.get('telefone') ?? ''),
      email: String(dados.get('email') ?? ''),
      endereco: String(dados.get('endereco') ?? ''),
    }
    try {
      if (editando) await editarCliente(editando.id, cliente)
      else await criarCliente(cliente)
      recarregar()
      if (cadastrarOutro) {
        setConfirmacao(`✓ ${cliente.nome.trim().toLocaleUpperCase('pt-BR')} cadastrado`); setErro('')
        formulario.reset()
        ;(formulario.elements.namedItem('nome') as HTMLInputElement).focus()
      } else setPainel(null)
    } catch (causa) { setConfirmacao(''); setErro(causa instanceof Error ? causa.message : 'Não foi possível salvar o cliente') } finally { salvando.current = false }
  }

  // RF10: não há exclusão. O cliente inativo continua ligado aos orçamentos que já tem.
  async function inativar(cliente: Cliente) {
    if (!window.confirm(`Inativar "${cliente.nome}"? Ele não aparecerá para novos orçamentos, mas os orçamentos que já tem continuam com o nome dele.`)) return
    try { await inativarCliente(cliente.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível inativar o cliente') }
  }

  async function reativar(cliente: Cliente) {
    try { await reativarCliente(cliente.id); recarregar() }
    catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível reativar o cliente') }
  }

  return <main className="pagina">
    <div className="cabecalho-pagina com-acao">
      <div>
        <h1>Clientes</h1>
        <p>As pessoas para quem você faz orçamentos. Só o nome é obrigatório.</p>
      </div>
      <button onClick={() => abrir(null)}>+ Novo cliente</button>
    </div>

    <FiltroLista busca={busca} situacao={situacao} exemplo="Nome do cliente…" aoBuscar={setBusca} aoFiltrar={setSituacao} />
    {erro && !painel && <p role="alert" className="alerta">{erro}</p>}

    <section className="folha lista">
      {clientes.length === 0 ? <p className="vazio">Nenhum cliente encontrado.</p> : <div className="tabela-rolagem"><table>
        <thead><tr><th>Cliente</th><th>Telefone</th><th>E-mail</th><th>Situação</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{clientes.map((cliente) => <tr key={cliente.id} className={cliente.ativo ? '' : 'linha-inativa'}>
          <td><b>{cliente.nome}</b>{cliente.endereco && <small>{cliente.endereco}</small>}</td>
          <td data-label="Telefone" className="secundaria">{cliente.telefone ?? '—'}</td>
          <td data-label="E-mail" className="secundaria">{cliente.email ?? '—'}</td>
          <td data-label="Situação"><span className={cliente.ativo ? 'selo' : 'selo inativo'}>{cliente.ativo ? 'Ativo' : 'Inativo'}</span></td>
          <td className="acoes-linha">{cliente.ativo ? <>
            <button className="discreto" onClick={() => abrir(cliente)}>Editar</button>
            <button className="discreto inativar" onClick={() => inativar(cliente)}>Inativar</button>
          </> : <button className="discreto" onClick={() => reativar(cliente)}>Reativar</button>}</td>
        </tr>)}</tbody>
      </table></div>}
      <RodapeLista total={clientes.length} singular="cliente" plural="clientes" situacao={situacao} />
    </section>

    <PainelLateral titulo={editando ? `Editar "${editando.nome}"` : 'Novo cliente'} aberto={painel !== null} aoFechar={() => setPainel(null)}>
      <form key={editando?.id ?? 'novo'} onSubmit={salvar} className="formulario-painel">
        <label>Nome<input name="nome" defaultValue={editando?.nome} required autoFocus /></label>
        <label>Telefone (opcional)<input name="telefone" type="tel" maxLength={30} defaultValue={editando?.telefone ?? ''} /></label>
        <label>E-mail (opcional)<input name="email" type="email" maxLength={200} defaultValue={editando?.email ?? ''} /></label>
        <label>Endereço (opcional)<input name="endereco" maxLength={300} defaultValue={editando?.endereco ?? ''} /></label>
        {!editando && <p className="ajuda">Enter cadastra e abre um formulário em branco. Esc ou ✕ fecham o painel.</p>}
        {confirmacao && <p role="status" className="salvo">{confirmacao}</p>}
        {erro && <p role="alert" className="alerta">{erro}</p>}
        <div className="acoes">
          <button>{editando ? 'Salvar alterações' : 'Cadastrar cliente'}</button>
          <button type="button" className="secundario" onClick={() => setPainel(null)}>{editando ? 'Cancelar' : 'Fechar'}</button>
        </div>
      </form>
    </PainelLateral>
  </main>
}
