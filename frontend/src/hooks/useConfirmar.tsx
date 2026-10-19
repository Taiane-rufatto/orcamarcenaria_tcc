import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

type Pedido = { titulo: string; texto: string; rotulo: string }

// Confirmação na própria tela, no lugar do window.confirm do navegador ("localhost diz"). Uso:
//   const { confirmar, dialogo } = useConfirmar()
//   if (!await confirmar({ titulo, texto, rotulo })) return
// e `{dialogo}` em qualquer ponto do JSX da página. Usa o <dialog> do navegador: Esc cancela e o foco fica preso nele.
export function useConfirmar(): { confirmar: (pedido: Pedido) => Promise<boolean>; dialogo: ReactNode } {
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const janela = useRef<HTMLDialogElement>(null)
  const resposta = useRef<((confirmou: boolean) => void) | null>(null)

  const confirmar = useCallback((novo: Pedido) => new Promise<boolean>((resolver) => {
    resposta.current = resolver
    setPedido(novo)
  }), [])

  useEffect(() => {
    const dialogo = janela.current
    if (pedido && dialogo && !dialogo.open) dialogo.showModal()
  }, [pedido])

  function responder(confirmou: boolean) {
    const dialogo = janela.current
    if (dialogo?.open) dialogo.close()
    setPedido(null)
    resposta.current?.(confirmou)
    resposta.current = null
  }

  const dialogo = <dialog ref={janela} className="confirmacao" aria-label={pedido?.titulo}
    onCancel={(e) => { e.preventDefault(); responder(false) }}
    onMouseDown={(e) => { if (e.target === janela.current) responder(false) }}>
    {pedido && <div className="confirmacao-conteudo">
      <h2>{pedido.titulo}</h2>
      <p>{pedido.texto}</p>
      <div className="acoes">
        <button type="button" onClick={() => responder(true)}>{pedido.rotulo}</button>
        <button type="button" className="secundario" onClick={() => responder(false)} autoFocus>Cancelar</button>
      </div>
    </div>}
  </dialog>

  return { confirmar, dialogo }
}
