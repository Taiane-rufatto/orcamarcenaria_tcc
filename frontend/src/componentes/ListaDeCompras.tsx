import { useEffect, useState } from 'react'
import { exibirNumero, listaDeCompras, textoDaLista, type GrupoDeCompra } from '../servicos/orcamentos'

// Lista de compras do orçamento (spec 023, RF58): os materiais agrupados por fornecedor, para ligar e comprar.
// `versao` muda quando os itens mudam, para a lista ser buscada de novo.
export function ListaDeCompras({ id, versao }: { id: string; versao: string }) {
  const [grupos, setGrupos] = useState<GrupoDeCompra[] | null>(null)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let atual = true
    listaDeCompras(id)
      .then((lista) => { if (atual) setGrupos(lista.grupos) })
      .catch(() => { if (atual) setGrupos([]) })
    return () => { atual = false }
  }, [id, versao])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(textoDaLista(grupos ?? []))
      setAviso('✓ Lista copiada')
    } catch { setAviso('Não foi possível copiar; selecione o texto e copie à mão.') }
  }

  if (!grupos || grupos.length === 0) return null

  return <section className="folha">
    <h2>Lista de compras</h2>
    <p className="ajuda">Os materiais deste orçamento por fornecedor, para você ligar e comprar. É só para você: não vai no PDF do cliente.</p>
    {grupos.map((grupo) => <div key={grupo.fornecedor?.id ?? 'sem-fornecedor'}>
      <h3>{grupo.fornecedor?.nome ?? 'Sem fornecedor cadastrado'}</h3>
      {grupo.fornecedor && (grupo.fornecedor.telefone || grupo.fornecedor.endereco) &&
        <p className="ajuda">{[grupo.fornecedor.telefone, grupo.fornecedor.endereco].filter(Boolean).join(' · ')}</p>}
      <ul className="historico">{grupo.itens.map((item, i) => <li key={i}>{exibirNumero(item.quantidade)} {item.unidade} · {item.descricao}</li>)}</ul>
    </div>)}
    <div className="acoes">
      <button type="button" className="secundario" onClick={copiar}>Copiar lista</button>
      {aviso && <span className="salvo" role="status">{aviso}</span>}
    </div>
  </section>
}
