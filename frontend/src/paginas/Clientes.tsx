import { useEffect, useState, type FormEvent } from 'react'
import {
  criarCliente, editarCliente, inativarCliente, listarClientes, reativarCliente, type Cliente,
} from '../servicos/clientes'
import type { Situacao } from '../servicos/catalogo'

// Cadastro de clientes (US06, RF08–RF10), no mesmo formato de materiais e serviços.
export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState<Situacao>('ativos')
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [erro, setErro] = useState('')

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

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
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
      formulario.reset()
      setEditando(null)
      recarregar()
    } catch (causa) { setErro(causa instanceof Error ? causa.message : 'Não foi possível salvar o cliente') }
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
    <div className="cabecalho-pagina">
      <h1>Clientes</h1>
      <p>As pessoas para quem você faz orçamentos. Só o nome é obrigatório.</p>
    </div>

    <section className="folha">
      <h2>{editando ? `Editar "${editando.nome}"` : 'Novo cliente'}</h2>
      <form key={editando?.id ?? 'novo'} onSubmit={salvar}>
        <div className="campos">
          <label>Nome<input name="nome" defaultValue={editando?.nome} required /></label>
          <label>Telefone (opcional)<input name="telefone" type="tel" maxLength={30} defaultValue={editando?.telefone ?? ''} /></label>
          <label>E-mail (opcional)<input name="email" type="email" maxLength={200} defaultValue={editando?.email ?? ''} /></label>
          <label className="largo">Endereço (opcional)<input name="endereco" maxLength={300} defaultValue={editando?.endereco ?? ''} /></label>
        </div>
        {erro && <p role="alert" className="alerta" style={{ marginTop: 16 }}>{erro}</p>}
        <div className="acoes">
          <button>{editando ? 'Salvar alterações' : 'Cadastrar cliente'}</button>
          {editando && <button type="button" className="secundario" onClick={() => setEditando(null)}>Cancelar edição</button>}
        </div>
      </form>
    </section>

    <section className="folha">
      <h2>Meus clientes</h2>
      <div className="filtros">
        <label>Buscar por nome<input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Ex.: Maria" /></label>
        <label>Situação
          <select value={situacao} onChange={(e) => setSituacao(e.target.value as Situacao)}>
            <option value="ativos">Ativos</option><option value="inativos">Inativos</option><option value="todos">Todos</option>
          </select>
        </label>
      </div>
      {clientes.length === 0 ? <p className="vazio">Nenhum cliente encontrado.</p> : <div className="tabela-rolagem"><table>
        <thead><tr><th>Cliente</th><th>Telefone</th><th>E-mail</th><th>Situação</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{clientes.map((cliente) => <tr key={cliente.id} className={cliente.ativo ? '' : 'linha-inativa'}>
          <td>{cliente.nome}{cliente.endereco && <small>{cliente.endereco}</small>}</td>
          <td data-label="Telefone">{cliente.telefone ?? '—'}</td>
          <td data-label="E-mail">{cliente.email ?? '—'}</td>
          <td data-label="Situação"><span className={cliente.ativo ? 'selo' : 'selo inativo'}>{cliente.ativo ? 'Ativo' : 'Inativo'}</span></td>
          <td className="acoes-linha">{cliente.ativo && <>
            <button className="discreto" onClick={() => setEditando(cliente)}>Editar</button>
            <button className="discreto" onClick={() => inativar(cliente)}>Inativar</button>
          </>}{!cliente.ativo && <button className="discreto" onClick={() => reativar(cliente)}>Reativar</button>}</td>
        </tr>)}</tbody>
      </table></div>}
    </section>
  </main>
}
