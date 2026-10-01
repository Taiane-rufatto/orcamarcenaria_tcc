import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type OpcaoBusca = { valor: string; rotulo: string; detalhe?: string }

// Sem acento e em minúsculas: "lamina" acha "Lâmina", "mdf" acha "MDF".
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Campo de escolha com busca, no lugar do <select> nas listas longas (catálogo e clientes, D026).
// Filtra enquanto digita, em qualquer parte do nome; ↑↓ e Enter escolhem sem mouse. O valor escolhido
// vai no formulário por um campo oculto com o mesmo `name` que o <select> usava.
export function CampoBusca({ rotulo, name, opcoes, valorInicial = '', required, placeholder, vazio }: {
  rotulo: string; name: string; opcoes: OpcaoBusca[]; valorInicial?: string
  required?: boolean; placeholder?: string; vazio?: string
}) {
  const id = useId()
  const rotuloDe = (valor: string) => opcoes.find((o) => o.valor === valor)?.rotulo ?? ''
  const [valor, setValor] = useState(valorInicial)
  // Cópia síncrona do valor: ao escolher, o foco sai do campo antes de o estado novo chegar ao onBlur.
  const valorAtual = useRef(valorInicial)
  const [texto, setTexto] = useState(() => rotuloDe(valorInicial))
  const [aberto, setAberto] = useState(false)
  const [destaque, setDestaque] = useState(0)
  const campo = useRef<HTMLInputElement>(null)
  const lista = useRef<HTMLUListElement>(null)

  // Com o texto igual ao escolhido, mostra a lista toda; ao digitar, só o que contém o texto.
  const filtradas = useMemo(() => {
    if (texto === rotuloDe(valor)) return opcoes
    const busca = normalizar(texto.trim())
    return opcoes.filter((o) => normalizar(o.rotulo).includes(busca))
  }, [texto, valor, opcoes]) // eslint-disable-line react-hooks/exhaustive-deps

  // O formulário de incluir item chama reset() depois de salvar: o campo volta ao início junto.
  useEffect(() => {
    const formulario = campo.current?.form
    if (!formulario) return
    const limpar = () => { valorAtual.current = valorInicial; setValor(valorInicial); setTexto(rotuloDe(valorInicial)) }
    formulario.addEventListener('reset', limpar)
    return () => formulario.removeEventListener('reset', limpar)
  })

  useEffect(() => {
    lista.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [destaque, aberto])

  function escolher(opcao: OpcaoBusca) {
    valorAtual.current = opcao.valor
    setValor(opcao.valor)
    setTexto(opcao.rotulo)
    setAberto(false)
    // Leva o foco ao próximo campo do formulário (ex.: Quantidade), para seguir só no teclado.
    const elementos = Array.from(campo.current?.form?.elements ?? []) as HTMLElement[]
    const seguinte = elementos.slice(elementos.indexOf(campo.current!) + 1)
      .find((e) => !(e instanceof HTMLInputElement && e.type === 'hidden'))
    seguinte?.focus()
  }

  function desfazerTexto() { setAberto(false); setTexto(rotuloDe(valorAtual.current)) }

  function tecla(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      if (!aberto) { setAberto(true); return }
      const passo = evento.key === 'ArrowDown' ? 1 : -1
      setDestaque((d) => Math.min(Math.max(d + passo, 0), filtradas.length - 1))
    } else if (evento.key === 'Enter' && aberto) {
      evento.preventDefault() // Enter escolhe o item; não envia o formulário
      if (filtradas[destaque]) escolher(filtradas[destaque])
    } else if (evento.key === 'Escape' && aberto) {
      evento.preventDefault()
      desfazerTexto()
    }
  }

  return <div className="campo-busca">
    <label htmlFor={id}>{rotulo}</label>
    <input id={id} ref={campo} role="combobox" aria-expanded={aberto} aria-controls={`${id}-lista`} aria-autocomplete="list"
      aria-activedescendant={aberto && filtradas[destaque] ? `${id}-${destaque}` : undefined}
      value={texto} placeholder={placeholder} required={required} autoComplete="off"
      onChange={(e) => { setTexto(e.target.value); setAberto(true); setDestaque(0) }}
      onFocus={(e) => { e.target.select(); setAberto(true); setDestaque(Math.max(filtradas.findIndex((o) => o.valor === valor), 0)) }}
      onClick={() => setAberto(true)}
      onBlur={desfazerTexto} onKeyDown={tecla} />
    <input type="hidden" name={name} value={valor} />
    {aberto && <ul id={`${id}-lista`} ref={lista} role="listbox" className="campo-busca-lista">
      {filtradas.length === 0 && <li className="campo-busca-vazio">{opcoes.length === 0 ? vazio ?? 'Nenhum cadastro ativo' : 'Nada encontrado'}</li>}
      {filtradas.map((opcao, i) => <li key={opcao.valor} id={`${id}-${i}`} role="option" aria-selected={i === destaque}
        // mousedown em vez de click: escolhe antes de o campo perder o foco e desfazer o texto
        onMouseDown={(e) => { e.preventDefault(); escolher(opcao) }} onMouseEnter={() => setDestaque(i)}>
        <span>{opcao.rotulo}</span>{opcao.detalhe && <span className="campo-busca-detalhe">{opcao.detalhe}</span>}
      </li>)}
    </ul>}
  </div>
}
