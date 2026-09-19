import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RotaProtegida } from './componentes/RotaProtegida'
import { Cadastro } from './paginas/Cadastro'
import { Entrar } from './paginas/Entrar'
import { Orcamentos } from './paginas/Orcamentos'

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/cadastro" element={<Cadastro />} />
    <Route path="/entrar" element={<Entrar />} />
    <Route element={<RotaProtegida />}><Route path="/orcamentos" element={<Orcamentos />} /></Route>
    <Route path="*" element={<Navigate to="/entrar" replace />} />
  </Routes></BrowserRouter>
}
