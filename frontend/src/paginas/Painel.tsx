import { useEffect, useState } from 'react'
import { consultarPainel, type PainelDoMes } from '../servicos/painel'
import { exibirMoeda, paraCampo } from '../servicos/orcamentos'

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

// "2026-10" → "outubro de 2026".
const nomeDoMes = (mes: string) => `${MESES[Number(mes.slice(5, 7)) - 1]} de ${mes.slice(0, 4)}`

// Painel do mês (spec 019, RF47, RF48): como foram os orçamentos do mês, em frases simples.
// Só exibe o que a API devolveu; nenhuma conta é feita aqui.
export function Painel() {
  const [mes, setMes] = useState<string | undefined>(undefined)
  const [painel, setPainel] = useState<PainelDoMes | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let atual = true
    consultarPainel(mes)
      .then((dados) => { if (atual) { setPainel(dados); setErro('') } })
      .catch((causa) => { if (atual) setErro(causa instanceof Error ? causa.message : 'Não foi possível carregar o painel') })
    return () => { atual = false }
  }, [mes])

  return <main className="pagina">
    <div className="cabecalho-pagina">
      <h1>Painel do mês</h1>
      <p>Como foram os seus orçamentos {painel ? `em ${nomeDoMes(painel.mes)}` : 'neste mês'}. Conta pela data de emissão.</p>
    </div>

    <section className="folha">
      <label>Mês
        <input type="month" value={painel?.mes ?? ''} onChange={(e) => e.target.value && setMes(e.target.value)} />
      </label>
    </section>

    {erro && <p role="alert" className="alerta">{erro}</p>}
    {!painel && !erro && <p>Carregando…</p>}

    {painel && painel.enviados === 0 && <section className="folha">
      <p>Nenhum orçamento enviado neste mês.{painel.rascunhos > 0 && ` Você tem ${painel.rascunhos} em rascunho.`}</p>
    </section>}

    {painel && painel.enviados > 0 && <>
      <section className="folha">
        <h2>Aprovação</h2>
        <p><strong>{painel.aprovados.quantidade} de {painel.enviados}</strong> orçamentos enviados foram aprovados
          {painel.taxaDeAprovacao !== null && <> (<strong>{paraCampo(painel.taxaDeAprovacao)}%</strong>)</>}.</p>
        <dl className="resumo">
          <div><dt>Aprovados</dt><dd>{painel.aprovados.quantidade}</dd></div>
          <div><dt>Recusados</dt><dd>{painel.recusados}</dd></div>
          <div><dt>Vencidos, sem resposta</dt><dd>{painel.vencidos}</dd></div>
          <div><dt>Esperando resposta</dt><dd>{painel.aguardando}</dd></div>
          {painel.rascunhos > 0 && <div><dt>Rascunhos (ainda não enviados)</dt><dd>{painel.rascunhos}</dd></div>}
        </dl>
      </section>

      <section className="folha">
        <h2>O que entrou</h2>
        {painel.aprovados.quantidade === 0
          ? <p className="ajuda">Nenhum orçamento aprovado neste mês ainda.</p>
          : <>
            <p>Você aprovou <strong>{exibirMoeda(painel.aprovados.valor)}</strong> em orçamentos, com <strong>{exibirMoeda(painel.aprovados.lucro)}</strong> de lucro
              {painel.aprovados.percentualDoPreco !== null && <> (<strong>{paraCampo(painel.aprovados.percentualDoPreco)}%</strong> do preço)</>}.</p>
          </>}
      </section>
    </>}
  </main>
}
