import { ErroHttp } from '../../api/erros/erro-http'
import { lerCliente } from '../../infra/repositorios/cliente-repositorio'
import { lerDadosMarcenaria } from '../../infra/repositorios/configuracao-repositorio'
import { montarConteudoPdf } from '../../infra/pdf/conteudo-orcamento'
import { desenharOrcamento } from '../../infra/pdf/desenhar-orcamento'
import { consultarOrcamento } from './orcamento'

// PDF do orçamento para o cliente (US14, RF41–RF43, D022). Lê o orçamento já calculado e gravado
// (D019) pela mesma consulta da tela, e passa ao conteúdo só o que o cliente pode ver.
export async function gerarPdfOrcamento(marcenariaId: string, id: string, mostrarItens: boolean) {
  const orcamento = await consultarOrcamento(marcenariaId, id) // 404 para outra marcenaria
  if (orcamento.situacao === 'rascunho' || orcamento.numero === null) {
    throw new ErroHttp(409, 'Registre o orçamento antes de gerar o PDF')
  }
  const [cliente, marcenaria] = await Promise.all([lerCliente(orcamento.clienteId, marcenariaId), lerDadosMarcenaria(marcenariaId)])
  if (!cliente || !marcenaria) throw new ErroHttp(404, 'Orçamento não encontrado')

  const conteudo = montarConteudoPdf({
    numero: orcamento.numero,
    descricaoProjeto: orcamento.descricaoProjeto,
    dataEmissao: orcamento.dataEmissao,
    dataValidade: orcamento.dataValidade,
    especificacoes: orcamento.especificacoes,
    observacoes: orcamento.observacoes,
    precoFinal: orcamento.memorial.precoFinal,
    itens: orcamento.itens.map((item) => ({ descricao: item.descricao, quantidade: item.quantidade, unidade: item.unidade })),
    cliente,
    marcenaria,
  }, mostrarItens)
  return { nomeArquivo: conteudo.nomeArquivo, pdf: await desenharOrcamento(conteudo) }
}
