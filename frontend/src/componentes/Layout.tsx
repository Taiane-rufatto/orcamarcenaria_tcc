import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { sair } from '../servicos/autenticacao'
import { Marca } from './Marca'

// Estrutura comum das telas internas: menu lateral fixo com a marca e a saída (D026).
export function Layout() {
  const navegar = useNavigate()

  async function encerrar() {
    await sair()
    navegar('/entrar')
  }

  return <div className="app">
    <aside className="lateral">
      <Link to="/orcamentos" className="marca-link" aria-label="OrçaMarcenaria — início"><Marca /></Link>
      <nav className="menu" aria-label="Principal">
        <NavLink to="/orcamentos" className={({ isActive }) => isActive ? 'ativo' : ''}>Orçamentos</NavLink>
        <NavLink to="/materiais" className={({ isActive }) => isActive ? 'ativo' : ''}>Materiais</NavLink>
        <NavLink to="/servicos" className={({ isActive }) => isActive ? 'ativo' : ''}>Serviços</NavLink>
        <NavLink to="/clientes" className={({ isActive }) => isActive ? 'ativo' : ''}>Clientes</NavLink>
        <NavLink to="/minha-marcenaria" className={({ isActive }) => isActive ? 'ativo' : ''}>Minha marcenaria</NavLink>
      </nav>
      <button className="botao-sair secundario" onClick={encerrar}>Sair</button>
    </aside>
    <Outlet />
  </div>
}
