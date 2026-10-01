import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './componentes/Layout'
import { RotaProtegida } from './componentes/RotaProtegida'
import { Cadastro } from './paginas/Cadastro'
import { Clientes } from './paginas/Clientes'
import { Entrar } from './paginas/Entrar'
import { EsqueciSenha } from './paginas/EsqueciSenha'
import { Orcamento } from './paginas/Orcamento'
import { Orcamentos } from './paginas/Orcamentos'
import { Materiais } from './paginas/Materiais'
import { MinhaMarcenaria } from './paginas/MinhaMarcenaria'
import { RedefinirSenha } from './paginas/RedefinirSenha'
import { Servicos } from './paginas/Servicos'

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/cadastro" element={<Cadastro />} />
    <Route path="/entrar" element={<Entrar />} />
    <Route path="/esqueci-senha" element={<EsqueciSenha />} />
    <Route path="/redefinir-senha" element={<RedefinirSenha />} />
    <Route element={<RotaProtegida />}>
      <Route element={<Layout />}>
        <Route path="/orcamentos" element={<Orcamentos />} />
        <Route path="/orcamentos/:id" element={<Orcamento />} />
        <Route path="/materiais" element={<Materiais />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/minha-marcenaria" element={<MinhaMarcenaria />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/entrar" replace />} />
  </Routes></BrowserRouter>
}
