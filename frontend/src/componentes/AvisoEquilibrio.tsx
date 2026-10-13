import { Link } from 'react-router-dom'
import { exibirMoeda, type Equilibrio } from '../servicos/orcamentos'

// Aviso de equilíbrio (spec 018, RF46). Só mostra o que a API devolveu; nada é calculado aqui.
// Informa e não bloqueia: o preço do orçamento não muda por causa do aviso.
export function AvisoEquilibrio({ equilibrio, horasEstimadas }: { equilibrio: Equilibrio | null; horasEstimadas: string | null }) {
  if (!equilibrio) {
    return <p className="ajuda">
      {horasEstimadas === null
        ? 'Informe as horas estimadas deste trabalho para ver se ele paga o mês. A meta fica em '
        : 'Falta a meta do mês para avaliar este orçamento. Ela fica em '}
      <Link to="/minha-marcenaria">Minha marcenaria</Link>.
    </p>
  }
  return <>
    <dl className="memorial">
      <div><dt>Sobra após materiais e custos adicionais</dt><dd>{exibirMoeda(equilibrio.contribuicao)}</dd></div>
      <div><dt>Este orçamento rende por hora</dt><dd>{exibirMoeda(equilibrio.valorPorHora)}</dd></div>
      <div><dt>Você precisa por hora</dt><dd>{exibirMoeda(equilibrio.necessarioPorHora)}</dd></div>
    </dl>
    {equilibrio.abaixoDoNecessario
      ? <p role="status" className="alerta">O valor por hora ficou abaixo do que você precisa para fechar o mês. O preço continua o mesmo; confira as horas, o lucro ou os custos.</p>
      : <p role="status" className="aviso">O valor por hora cobre o que você precisa para fechar o mês.</p>}
  </>
}
