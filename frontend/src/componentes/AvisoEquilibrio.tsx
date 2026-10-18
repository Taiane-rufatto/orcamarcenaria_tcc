import { Link } from 'react-router-dom'
import { exibirMoeda, paraCampo, type Equilibrio } from '../servicos/orcamentos'

// Quanto sobra de lucro e aviso de lucro mínimo (spec 018, RF46). Só mostra o que a API devolveu;
// nada é calculado aqui. Informa e não bloqueia: o preço do orçamento não muda por causa do aviso.
// Frases curtas e diretas, para quem não é da área financeira entender de relance.
export function AvisoEquilibrio({ equilibrio }: { equilibrio: Equilibrio | null }) {
  if (!equilibrio) return <p className="ajuda">Inclua os itens para ver quanto sobra de lucro.</p>

  return <>
    <p>Neste orçamento sobram <strong>{exibirMoeda(equilibrio.lucro)}</strong> de lucro, que é <strong>{paraCampo(equilibrio.percentualDoPreco)}%</strong> do preço.</p>
    {equilibrio.lucroMinimo === null && <p className="ajuda">
      Quer ser avisado quando o lucro ficar baixo? Defina o seu lucro mínimo em <Link to="/minha-marcenaria">Minha marcenaria</Link>.
    </p>}
    {equilibrio.lucroMinimo !== null && (equilibrio.abaixoDoMinimo
      ? <p role="status" className="alerta">Atenção: você quer pelo menos {paraCampo(equilibrio.lucroMinimo)}% de lucro e aqui sobra só {paraCampo(equilibrio.percentualDoPreco)}%. O preço continua o mesmo.</p>
      : <p role="status" className="aviso">Está bom: você quer pelo menos {paraCampo(equilibrio.lucroMinimo)}% de lucro.</p>)}
  </>
}
