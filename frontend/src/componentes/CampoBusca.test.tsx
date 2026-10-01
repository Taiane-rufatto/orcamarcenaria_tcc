import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { CampoBusca } from './CampoBusca'

const opcoes = [
  { valor: '1', rotulo: 'MDF 18mm', detalhe: 'R$ 289,9000' },
  { valor: '2', rotulo: 'Lâmina de madeira nobre', detalhe: 'R$ 412,3300' },
  { valor: '3', rotulo: 'Mdf branco pérola', detalhe: 'R$ 160,0000' },
]

// o jsdom não implementa a rolagem até o item destacado
beforeAll(() => { Element.prototype.scrollIntoView = () => {} })
afterEach(cleanup)

function montar() {
  const { container } = render(<form><CampoBusca rotulo="Material" name="catalogoId" opcoes={opcoes} /></form>)
  return { campo: screen.getByRole('combobox'), oculto: container.querySelector('input[type=hidden]') as HTMLInputElement }
}

describe('CampoBusca', () => {
  it('filtra em qualquer parte do nome, sem diferenciar maiúsculas e acentos', () => {
    const { campo } = montar()
    fireEvent.change(campo, { target: { value: 'mdf' } })
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['MDF 18mmR$ 289,9000', 'Mdf branco pérolaR$ 160,0000'])
    fireEvent.change(campo, { target: { value: 'lamina' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })

  it('escolhe com as setas e Enter, e envia o valor no campo oculto', () => {
    const { campo, oculto } = montar()
    fireEvent.change(campo, { target: { value: 'mdf' } })
    fireEvent.keyDown(campo, { key: 'ArrowDown' })
    fireEvent.keyDown(campo, { key: 'Enter' })
    expect(oculto.value).toBe('3')
    expect((campo as HTMLInputElement).value).toBe('Mdf branco pérola')
  })
})
