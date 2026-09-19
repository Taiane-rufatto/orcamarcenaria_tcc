import { Navigate, Outlet } from 'react-router-dom'
import { tokenAtual } from '../servicos/autenticacao'
export function RotaProtegida() { return tokenAtual() ? <Outlet /> : <Navigate to="/entrar" replace /> }
