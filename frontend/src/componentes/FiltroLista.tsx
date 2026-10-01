import type { Situacao } from '../servicos/catalogo'

const OPCOES: [Situacao, string][] = [['ativos', 'Ativos'], ['inativos', 'Inativos'], ['todos', 'Todos']]

// Busca por nome e filtro de situação dos cadastros, numa barra só (D026).
export function FiltroLista({ busca, situacao, exemplo, aoBuscar, aoFiltrar }: {
  busca: string; situacao: Situacao; exemplo: string
  aoBuscar: (valor: string) => void; aoFiltrar: (valor: Situacao) => void
}) {
  return <div className="filtro-lista">
    <label>Buscar<input type="search" value={busca} onChange={(e) => aoBuscar(e.target.value)} placeholder={exemplo} /></label>
    <div className="chips" role="group" aria-label="Situação">
      {OPCOES.map(([valor, rotulo]) => <button key={valor} type="button" className="chip"
        aria-pressed={situacao === valor} onClick={() => aoFiltrar(valor)}>{rotulo}</button>)}
    </div>
  </div>
}

// Rodapé da tabela: quantos registros a lista mostra, no filtro atual.
export function RodapeLista({ total, singular, plural, situacao }: { total: number; singular: string; plural: string; situacao: Situacao }) {
  const nome = total === 1 ? singular : plural
  const estado = situacao === 'todos' ? 'no total' : `${situacao === 'ativos' ? 'ativo' : 'inativo'}${total === 1 ? '' : 's'}`
  return <p className="rodape-lista">{total} {nome} {estado}</p>
}
