import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RotaProtegida } from './RotaProtegida'

describe('RotaProtegida', () => {
  beforeEach(() => sessionStorage.clear())

  it('redireciona para entrada quando não há sessão (TI04)', () => {
    render(<MemoryRouter initialEntries={['/orcamentos']}><Routes>
      <Route element={<RotaProtegida />}><Route path="/orcamentos" element={<p>Área interna</p>} /></Route>
      <Route path="/entrar" element={<p>Entrada</p>} />
    </Routes></MemoryRouter>)
    expect(screen.getByText('Entrada')).toBeTruthy()
  })
})
