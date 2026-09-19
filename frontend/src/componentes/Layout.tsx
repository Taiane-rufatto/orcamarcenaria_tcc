import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { sair } from '../servicos/autenticacao'
import { Marca } from './Marca'

// Estrutura comum das telas internas: cabeçalho com régua, menu e saída.
export function Layout() {
  const navegar = useNavigate()

  async function encerrar() {
    await sair()
    navegar('/entrar')
  }

  return <>
    <header className="topo">
      <div className="topo-conteudo">
        <Link to="/orcamentos" className="marca-link" aria-label="OrçaMarcenaria — início"><Marca /></Link>
        <nav className="menu" aria-label="Principal">
          <NavLink to="/orcamentos" className={({ isActive }) => isActive ? 'ativo' : ''}>Orçamentos</NavLink>
          <NavLink to="/materiais" className={({ isActive }) => isActive ? 'ativo' : ''}>Materiais</NavLink>
          <NavLink to="/servicos" className={({ isActive }) => isActive ? 'ativo' : ''}>Serviços</NavLink>
        </nav>
        <button className="botao-sair" onClick={encerrar}>Sair</button>
      </div>
    </header>
    <Outlet />
  </>
}
