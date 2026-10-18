import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { consultarPainel, type PainelDoMes, type Variacao } from '../servicos/painel'
import { exibirMoeda, paraCampo } from '../servicos/orcamentos'

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

// "2026-10" → "outubro de 2026".
const nomeDoMes = (mes: string) => `${MESES[Number(mes.slice(5, 7)) - 1]} de ${mes.slice(0, 4)}`

// Só exibição: "289.9000" → "R$ 289,90". Custo de material pode ter até 4 casas; zeros a mais não aparecem.
function exibirCusto(valor: string): string {
  const [inteiro, decimais = ''] = valor.split('.')
  return exibirMoeda(`${inteiro}.${decimais.replace(/0+$/, '').padEnd(2, '0')}`)
}

// "subiu 8,00%", "caiu 7,41%" ou "ficou igual". A API já decidiu a tendência; aqui só vira texto.
function textoDaVariacao(variacao: Variacao, verbos: { subindo: string; caindo: string; estavel: string }): string {
  if (!variacao) return 'sem histórico para comparar'
  if (variacao.tendencia === 'estavel') return verbos.estavel
  const percentual = paraCampo(variacao.percentual.replace('-', ''))
  return `${variacao.tendencia === 'subindo' ? verbos.subindo : verbos.caindo} ${percentual}%`
}

// Painel do mês (specs 019 e 024): a visão de saúde do negócio, em frases simples. Só exibe o que a API devolveu;
// nenhuma conta é feita aqui.
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

  const hora = painel?.cobranca

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

    {painel && <section className="folha">
      <h2>Meta do mês</h2>
      {painel.meta
        ? <>
          <p>Sua meta é <strong>{exibirMoeda(painel.meta.meta)}</strong>. Você aprovou <strong>{exibirMoeda(painel.meta.aprovado)}</strong> (<strong>{paraCampo(painel.meta.percentual)}%</strong>).
            {painel.meta.atingida ? ' Meta batida!' : <> Faltam <strong>{exibirMoeda(painel.meta.falta)}</strong>.</>}</p>
        </>
        : <p className="ajuda">Defina uma meta do mês em <Link to="/minha-marcenaria">Minha marcenaria</Link> para acompanhar o quanto já foi aprovado.</p>}
    </section>}

    {painel && painel.enviados === 0 && <section className="folha">
      <p>Nenhum orçamento enviado neste mês.{painel.rascunhos > 0 && ` Você tem ${painel.rascunhos} em rascunho.`}</p>
    </section>}

    {painel && painel.enviados > 0 && <>
      <section className="folha">
        <h2>Aprovação</h2>
        <p><strong>{painel.aprovados.quantidade} de {painel.enviados}</strong> orçamentos enviados foram aprovados
          {painel.taxaDeAprovacao !== null && <> (<strong>{paraCampo(painel.taxaDeAprovacao)}%</strong>)</>}.</p>
        <dl className="resumo">
          <div><dt>Aprovados (com os em produção e entregues)</dt><dd>{painel.aprovados.quantidade}</dd></div>
          <div><dt>Em produção</dt><dd>{painel.aprovados.emProducao}</dd></div>
          <div><dt>Entregues</dt><dd>{painel.aprovados.entregues}</dd></div>
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

      {hora && <section className="folha">
        <h2>Quanto você cobra pela mão de obra</h2>
        <p>A mão de obra somou <strong>{exibirMoeda(hora.maoDeObra)}</strong>
          {hora.percentualDoPreco !== null && <>, que é <strong>{paraCampo(hora.percentualDoPreco)}%</strong> do preço dos orçamentos enviados</>}.</p>
        {hora.valorMedioDaHora !== null
          ? <p>O valor médio da sua hora de serviço foi <strong>{exibirMoeda(hora.valorMedioDaHora)}</strong>
            {hora.valorMedioDaHoraNoMesAnterior !== null && <> (no mês anterior foi {exibirMoeda(hora.valorMedioDaHoraNoMesAnterior)}: {textoDaVariacao(hora.variacaoDaHora, { subindo: 'subiu', caindo: 'caiu', estavel: 'ficou igual' })})</>}.</p>
          : <p className="ajuda">Nenhum serviço cobrado por hora nos orçamentos deste mês.</p>}
      </section>}
    </>}

    {painel && painel.precos.length > 0 && <section className="folha">
      <h2>Preços dos materiais que você mais usa</h2>
      <p className="ajuda">Nos últimos 90 dias. Se o custo do material sobe, vale rever o que você cobra.</p>
      <ul className="historico">{painel.precos.map((material) => <li key={material.materialId}>
        <strong>{material.nome}</strong> · usado em {material.usos} {material.usos === 1 ? 'orçamento' : 'orçamentos'} ·{' '}
        {textoDaVariacao(material.variacao, { subindo: 'subindo', caindo: 'caindo', estavel: 'estável' })}
        {material.variacao && material.variacao.tendencia !== 'estavel' && material.custoAnterior !== null &&
          <> (de {exibirCusto(material.custoAnterior)} para {exibirCusto(material.custoAtual)})</>}
      </li>)}</ul>
    </section>}
  </main>
}
