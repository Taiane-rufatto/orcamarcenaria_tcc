import { z } from 'zod'
import { UNIDADES } from './catalogo'

// Números continuam texto (AGENTS §4.2). Aceita vírgula decimal (AGENTS §8) e normaliza para ponto,
// que é o único formato que o domínio aceita. Os limites de dígitos acompanham as colunas NUMERIC,
// para que um valor grande vire mensagem clara e não erro interno do banco.
function decimal(inteiros: number, casas: number, mensagem: string) {
  return z
    .string(mensagem)
    .trim()
    .transform((valor) => valor.replace(',', '.'))
    .pipe(z.string().regex(new RegExp(`^\\d{1,${inteiros}}(\\.\\d{1,${casas}})?$`), mensagem))
}
const maiorQueZero = (valor: string) => /[1-9]/.test(valor)

const quantidade = decimal(9, 3, 'Informe a quantidade com até 3 casas decimais')
  .refine(maiorQueZero, 'A quantidade deve ser maior que zero')
const valorUnitario = decimal(8, 4, 'Informe o valor unitário, sem sinal negativo, com até 4 casas decimais')
const valorCustoAdicional = decimal(10, 2, 'Informe o valor do custo adicional com até 2 casas decimais')
  .refine(maiorQueZero, 'O custo adicional deve ser maior que zero')
// NUMERIC(5,2): até 999,99%. O limite da margem (< 100) é conferido pelo domínio.
export const percentualLucro = decimal(3, 2, 'Informe o percentual de lucro com até 2 casas decimais (máximo 999,99)')

const texto = (mensagem: string) => z.string(mensagem).trim().min(1, mensagem)
const data = z.iso.date('Informe uma data válida')
const tipo = z.enum(['material', 'servico'], 'Informe se o item é material ou serviço')

export const cabecalhoSchema = z
  .object({
    clienteId: z.uuid('Selecione o cliente'),
    descricaoProjeto: texto('Informe a descrição do projeto'),
    dataEmissao: data,
    // Campos omitidos: na criação vêm da configuração da marcenaria (D024; validade = emissão + dias);
    // na edição de um rascunho, mantêm o valor atual do orçamento.
    dataValidade: data.optional(),
    modoLucro: z.enum(['margem', 'markup'], 'Selecione margem ou markup').optional(),
    percentualLucro: percentualLucro.optional(),
    regraArredondamento: z.enum(['duas_casas', 'real_inteiro', 'dezena'], 'Selecione a regra de arredondamento').optional(),
    especificacoes: z.string().trim().max(4000, 'As especificações devem ter até 4.000 caracteres').optional(),
    observacoes: z.string().trim().max(1000, 'As observações devem ter até 1.000 caracteres').optional(),
  })

export const itemSchema = z.discriminatedUnion('origem', [
  z.object({ origem: z.literal('catalogo'), tipo, catalogoId: z.uuid('Item do catálogo não encontrado ou inativo'), quantidade }),
  z.object({
    origem: z.literal('avulso'),
    tipo,
    descricao: texto('Informe a descrição do item'),
    unidade: z.enum([...UNIDADES, 'h'], 'Selecione uma unidade válida'),
    quantidade,
    valorUnitario,
  }),
], 'Informe se o item vem do catálogo ou é avulso')

export const alteracaoItemSchema = z.object({ quantidade, valorUnitario })

export const custoAdicionalSchema = z.object({
  descricao: texto('Informe a descrição do custo adicional'),
  valor: valorCustoAdicional,
})

// ---------- Spec 004 ----------

// Campo de filtro vazio ("") vale como ausente, para a tela poder enviar o formulário inteiro.
const opcional = <T extends z.ZodType>(schema: T) => z.preprocess((v) => (v === '' ? undefined : v), schema.optional())

export const filtrosListagemSchema = z.object({
  busca: opcional(z.string()),
  situacao: opcional(z.enum(['rascunho', 'enviado', 'aprovado', 'recusado', 'vencido'], 'Situação inválida')),
  de: opcional(data),
  ate: opcional(data),
})

// Só aprovado e recusado são escolhidos pelo usuário; enviado vem do registro e vencido é automático (RN09).
export const mudancaSituacaoSchema = z.object({
  situacao: z.enum(['aprovado', 'recusado'], 'Escolha aprovado ou recusado'),
})
