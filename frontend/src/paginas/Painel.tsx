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
        <input type="month" value={painel?.mes ?? ''} onChange={(e) => e.target.value && setMes(e.target.value)}
          onClick={(e) => { try { e.currentTarget.showPicker() } catch { /* navegador sem showPicker: segue o comportamento padrão */ } }} />
      </label>
    </section>

    {erro && <p role="alert" className="alerta">{erro}</p>}
    {!painel && !erro && <p>Carregando…</p>}

    {painel && <section className="folha card-painel">
      <h2>Meta do mês</h2>
      {painel.meta
        ? <>
          <p>Sua meta é {exibirMoeda(painel.meta.meta)}. Você aprovou {exibirMoeda(painel.meta.aprovado)} ({paraCampo(painel.meta.percentual)}%).
            {painel.meta.atingida ? ' Meta batida!' : <> Faltam {exibirMoeda(painel.meta.falta)}.</>}</p>
          <div className={`barra-meta ${painel.meta.atingida ? 'batida' : 'andamento'}`} role="progressbar" aria-label="Meta do mês"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(Number(painel.meta.percentual)))}>
            <span style={{ width: `${painel.meta.percentual}%` }} />
          </div>
        </>
        : <p className="ajuda">Defina uma meta do mês em <Link to="/minha-marcenaria">Minha marcenaria</Link> para acompanhar o quanto já foi aprovado.</p>}
    </section>}

    {painel && painel.enviados === 0 && <section className="folha card-painel">
      <p>Nenhum orçamento enviado neste mês.{painel.rascunhos > 0 && ` Você tem ${painel.rascunhos} em rascunho.`}</p>
    </section>}

    {painel && painel.enviados > 0 && <>
      <section className="folha card-painel">
        <h2>Aprovação</h2>
        <p>{painel.aprovados.quantidade} de {painel.enviados} orçamentos enviados foram aprovados
          {painel.taxaDeAprovacao !== null && <> ({paraCampo(painel.taxaDeAprovacao)}%)</>}.</p>
        <p className="ajuda">Os aprovados incluem os que estão em produção e os já entregues. Rascunhos ainda não foram enviados.</p>
        <dl className="indicadores">
          <div className="indicador positivo"><dt>Aprovados</dt><dd>{painel.aprovados.quantidade}</dd></div>
          <div className="indicador andamento"><dt>Em produção</dt><dd>{painel.aprovados.emProducao}</dd></div>
          <div className="indicador positivo"><dt>Entregues</dt><dd>{painel.aprovados.entregues}</dd></div>
          <div className="indicador negativo"><dt>Recusados</dt><dd>{painel.recusados}</dd></div>
          <div className="indicador negativo"><dt>Vencidos sem resposta</dt><dd>{painel.vencidos}</dd></div>
          <div className="indicador andamento"><dt>Esperando resposta</dt><dd>{painel.aguardando}</dd></div>
          {painel.rascunhos > 0 && <div className="indicador neutro"><dt>Rascunhos</dt><dd>{painel.rascunhos}</dd></div>}
        </dl>
      </section>

      <section className="folha card-painel">
        <h2>O que entrou</h2>
        {painel.aprovados.quantidade === 0
          ? <p className="ajuda">Nenhum orçamento aprovado neste mês ainda.</p>
          : <>
            <p>Você aprovou {exibirMoeda(painel.aprovados.valor)} em orçamentos, com {exibirMoeda(painel.aprovados.lucro)} de lucro
              {painel.aprovados.percentualDoPreco !== null && <> ({paraCampo(painel.aprovados.percentualDoPreco)}% do preço)</>}.</p>
          </>}
      </section>

      {hora && <section className="folha card-painel">
        <h2>Quanto você cobra pela mão de obra</h2>
        <p>A mão de obra somou {exibirMoeda(hora.maoDeObra)}
          {hora.percentualDoPreco !== null && <>, que é {paraCampo(hora.percentualDoPreco)}% do preço dos orçamentos enviados</>}.</p>
        {hora.valorMedioDaHora !== null
          ? <p>O valor médio da sua hora de serviço foi {exibirMoeda(hora.valorMedioDaHora)}
            {hora.valorMedioDaHoraNoMesAnterior !== null && <> (no mês anterior foi {exibirMoeda(hora.valorMedioDaHoraNoMesAnterior)}: {textoDaVariacao(hora.variacaoDaHora, { subindo: 'subiu', caindo: 'caiu', estavel: 'ficou igual' })})</>}.</p>
          : <p className="ajuda">Nenhum serviço cobrado por hora nos orçamentos deste mês.</p>}
      </section>}
    </>}

    {painel && painel.precos.length > 0 && <section className="folha card-painel">
      <h2>Preços dos materiais que você mais usa</h2>
      <p className="ajuda">Nos últimos 90 dias. O custo no início é o valor de 90 dias atrás (ou o primeiro registrado, se o material é mais novo). Se o custo sobe, vale rever o que você cobra.</p>
      <div className="tabela-rolagem">
        <table className="tabela-precos">
          <thead><tr><th>Material</th><th>Usado em</th><th className="valor">Custo no início</th><th className="valor">Custo agora</th><th>Variação</th></tr></thead>
          <tbody>{painel.precos.map((material) => <tr key={material.materialId}>
            <td>{material.nome}</td>
            <td>{material.usos} {material.usos === 1 ? 'orçamento' : 'orçamentos'}</td>
            <td className="valor">{material.custoAnterior !== null ? exibirCusto(material.custoAnterior) : '—'}</td>
            <td className="valor">{exibirCusto(material.custoAtual)}</td>
            <td><span className={`variacao ${material.variacao?.tendencia ?? 'sem-historico'}`}>
              {material.variacao ? textoDaVariacao(material.variacao, { subindo: 'Subindo', caindo: 'Caindo', estavel: 'Estável' }) : 'Sem histórico'}
            </span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>}
  </main>
}
