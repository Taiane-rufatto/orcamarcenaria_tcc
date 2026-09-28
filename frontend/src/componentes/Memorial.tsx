import { exibirMoeda, type Memorial as DadosMemorial, type ModoLucro } from '../servicos/orcamentos'

// Memorial de cálculo (RF31, US11) na ordem e com os rótulos de regras-de-calculo.md §5.
// Cada linha exibe um valor devolvido pela API; nenhum é calculado aqui, nem o multiplicador (D018).
export function Memorial({ memorial, modoLucro, percentualLucro }: { memorial: DadosMemorial; modoLucro: ModoLucro; percentualLucro: string }) {
  const percentual = `${percentualLucro.replace('.', ',')}%`
  const lucro = modoLucro === 'markup'
    ? `Lucro (markup ${percentual} · ${memorial.multiplicadorEquivalente!.replace('.', ',')}× o custo)`
    : `Lucro (margem ${percentual} sobre o preço)`

  return <dl className="memorial">
    <div><dt>Materiais</dt><dd>{exibirMoeda(memorial.subtotalMateriais)}</dd></div>
    <div><dt>Serviços e mão de obra</dt><dd>{exibirMoeda(memorial.subtotalServicos)}</dd></div>
    <div><dt>Custos adicionais</dt><dd>{exibirMoeda(memorial.totalAdicionais)}</dd></div>
    <div className="subtotal"><dt>Custo direto total</dt><dd>{exibirMoeda(memorial.custoDiretoTotal)}</dd></div>
    <div><dt>{lucro}</dt><dd>{exibirMoeda(memorial.valorLucro)}</dd></div>
    <div><dt>Ajuste de arredondamento</dt><dd>{exibirMoeda(memorial.ajusteArredondamento)}</dd></div>
    <div className="final"><dt>Preço final</dt><dd>{exibirMoeda(memorial.precoFinal)}</dd></div>
  </dl>
}
