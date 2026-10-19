import { useEffect, useRef, type ReactNode } from 'react'

// Painel à direita para criar e editar cadastros sem sair da lista (D026). Usa o <dialog> do navegador:
// ele prende o foco no painel, fecha com Esc e escurece o fundo sem código extra.
export function PainelLateral({ titulo, aberto, aoFechar, children }: {
  titulo: string; aberto: boolean; aoFechar: () => void; children: ReactNode
}) {
  const janela = useRef<HTMLDialogElement>(null)
  // Onde o clique começou: selecionar texto e soltar o mouse fora do painel não pode fechá-lo.
  const comecouNoFundo = useRef(false)

  useEffect(() => {
    const dialogo = janela.current
    if (!dialogo) return
    if (aberto && !dialogo.open) dialogo.showModal()
    if (!aberto && dialogo.open) dialogo.close()
  }, [aberto])

  return <dialog ref={janela} className="painel-lateral" aria-label={titulo} onClose={aoFechar}
    onMouseDown={(e) => { comecouNoFundo.current = e.target === janela.current }}
    onClick={(e) => { if (e.target === janela.current && comecouNoFundo.current) aoFechar() }}>
    {aberto && <div className="painel-conteudo">
      <div className="painel-topo">
        <h2>{titulo}</h2>
        <button type="button" className="discreto fechar" onClick={aoFechar} aria-label="Fechar">✕</button>
      </div>
      {children}
    </div>}
  </dialog>
}
