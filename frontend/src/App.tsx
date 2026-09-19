import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './componentes/Layout'
import { RotaProtegida } from './componentes/RotaProtegida'
import { Cadastro } from './paginas/Cadastro'
import { Entrar } from './paginas/Entrar'
import { Orcamentos } from './paginas/Orcamentos'
import { Materiais } from './paginas/Materiais'
import { Servicos } from './paginas/Servicos'

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/cadastro" element={<Cadastro />} />
    <Route path="/entrar" element={<Entrar />} />
    <Route element={<RotaProtegida />}>
      <Route element={<Layout />}>
        <Route path="/orcamentos" element={<Orcamentos />} />
        <Route path="/materiais" element={<Materiais />} />
        <Route path="/servicos" element={<Servicos />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/entrar" replace />} />
  </Routes></BrowserRouter>
}
