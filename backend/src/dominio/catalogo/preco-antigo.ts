import Decimal from 'decimal.js'

// Alerta de preço antigo (spec 020, RN15): o custo de um material que não é atualizado ou confirmado
// há mais de 30 dias pode estar desatualizado. É só um aviso; nunca muda custo nem orçamento.
// O prazo é fixo (30 dias): o professor citou duas semanas ou um mês apenas como exemplo.
export const PRAZO_PRECO_ANTIGO_DIAS = 30

// `dias` = dias inteiros desde a última atualização, calculados pelo banco.
export const precoEstaAntigo = (dias: number): boolean => dias > PRAZO_PRECO_ANTIGO_DIAS

// O custo do material no catálogo mudou depois de entrar no orçamento? (spec 023.) Compara como decimal:
// "289.9" e "289.9000" são o mesmo custo. Só avisa; o valor do item (RN08) não muda sozinho.
export const custoDoCatalogoMudou = (custoAtual: string, valorNoOrcamento: string): boolean =>
  !new Decimal(custoAtual).eq(valorNoOrcamento)
