import { Link } from 'react-router-dom'
import { exibirMoeda, paraCampo, type Equilibrio } from '../servicos/orcamentos'

// Lucro real e aviso de lucro mínimo (spec 018, RF46). Só mostra o que a API devolveu; nada é calculado aqui.
// Informa e não bloqueia: o preço do orçamento não muda por causa do aviso.
export function AvisoEquilibrio({ equilibrio }: { equilibrio: Equilibrio | null }) {
  if (!equilibrio) return <p className="ajuda">Inclua os itens para ver quanto sobra de lucro neste orçamento.</p>

  return <>
    <dl className="memorial">
      <div><dt>Lucro depois de pagar tudo</dt><dd>{exibirMoeda(equilibrio.lucro)}</dd></div>
      <div><dt>Isso é do preço de venda</dt><dd>{paraCampo(equilibrio.percentualDoPreco)}%</dd></div>
      {equilibrio.lucroMinimo && <div><dt>Seu lucro mínimo</dt><dd>{paraCampo(equilibrio.lucroMinimo)}%</dd></div>}
    </dl>
    {equilibrio.lucroMinimo === null && <p className="ajuda">
      Quer um aviso quando o lucro ficar baixo demais? Defina o lucro mínimo em <Link to="/minha-marcenaria">Minha marcenaria</Link>.
    </p>}
    {equilibrio.lucroMinimo !== null && (equilibrio.abaixoDoMinimo
      ? <p role="status" className="alerta">O lucro ficou abaixo do mínimo que você definiu. O preço continua o mesmo; confira o percentual de lucro ou os custos.</p>
      : <p role="status" className="aviso">O lucro está dentro do mínimo que você definiu.</p>)}
  </>
}
