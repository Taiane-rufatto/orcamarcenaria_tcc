import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  calcularOrcamento, ErroCalculo, type EntradaCalculo, type ItemCalculo,
} from '../../src/dominio/orcamento/calculo'

// Os dez casos vêm do mesmo CSV conferido em planilha (qualidade-e-testes.md §3):
// assim o teste nunca diverge silenciosamente dos valores de referência.
const CSV = resolve(__dirname, '../../../evidencias/testes/casos-de-teste-referencia.csv')

// "MDF 18mm 2.5x289.90 + Fita de borda 30x1.2350" → itens; o último termo de cada parcela é "quantidade x valor".
function lerItens(texto: string, tipo: ItemCalculo['tipo']): ItemCalculo[] {
  if (texto === '-') return []
  return texto.split(' + ').map((parcela) => {
    const [quantidade, valorUnitario] = parcela.trim().split(' ').at(-1)!.split('x')
    return { tipo, quantidade, valorUnitario }
  })
}

// "Frete 120.00 + Ferragens diversas 45.50" → ['120.00', '45.50']
function lerAdicionais(texto: string): string[] {
  return texto === '-' ? [] : texto.split(' + ').map((parcela) => parcela.trim().split(' ').at(-1)!)
}

const [cabecalho, ...linhas] = readFileSync(CSV, 'utf-8').trim().split(/\r?\n/)
const colunas = cabecalho.split(';')
const casos = linhas.map((linha) => Object.fromEntries(linha.split(';').map((valor, i) => [colunas[i], valor])))

describe('casos de referência CT01–CT10 (regras-de-calculo.md §2)', () => {
  it('lê os dez casos do CSV', () => expect(casos).toHaveLength(10))

  it.each(casos.map((caso) => [caso.caso, caso]))('%s — diferença nula em todas as etapas', (_nome, caso) => {
    const resultado = calcularOrcamento({
      itens: [...lerItens(caso.itens_material, 'material'), ...lerItens(caso.itens_servico, 'servico')],
      custosAdicionais: lerAdicionais(caso.custos_adicionais),
      modoLucro: caso.modo_lucro as EntradaCalculo['modoLucro'],
      percentualLucro: caso.percentual,
      regraArredondamento: caso.regra_arredondamento as EntradaCalculo['regraArredondamento'],
    })

    expect(resultado).toMatchObject({
      subtotalMateriais: caso.subtotal_materiais,
      subtotalServicos: caso.subtotal_servicos,
      totalAdicionais: caso.total_adicionais,
      custoDiretoTotal: caso.custo_direto_total,
      precoBruto: caso.preco_bruto,
      valorLucro: caso.valor_lucro,
      ajusteArredondamento: caso.ajuste_arredondamento,
      precoFinal: caso.preco_final_referencia,
    })
  })
})

const base: EntradaCalculo = {
  itens: [{ tipo: 'material', quantidade: '1', valorUnitario: '100' }],
  custosAdicionais: [],
  modoLucro: 'markup',
  percentualLucro: '150',
  regraArredondamento: 'duas_casas',
}

describe('valores de linha e arredondamento meio para cima (RN-C02)', () => {
  it('arredonda cada linha a 2 casas: 4,5 × 1,2350 = 5,5575 → 5,56', () => {
    const resultado = calcularOrcamento({ ...base, itens: [{ tipo: 'material', quantidade: '4.5', valorUnitario: '1.2350' }] })
    expect(resultado.valoresLinha).toEqual(['5.56'])
  })

  it('aceita valor unitário zero em item de orçamento (RN10, D016)', () => {
    const resultado = calcularOrcamento({ ...base, itens: [{ tipo: 'material', quantidade: '2', valorUnitario: '0' }] })
    expect(resultado.precoFinal).toBe('0.00')
  })

  it('orçamento vazio resulta em zero, sem erro', () => {
    expect(calcularOrcamento({ ...base, itens: [] }).precoFinal).toBe('0.00')
  })
})

describe('multiplicador equivalente no markup (D018)', () => {
  it('markup 150% equivale a 2,50× o custo', () => {
    const resultado = calcularOrcamento(base)
    expect(resultado.multiplicadorEquivalente).toBe('2.50')
    expect(resultado.precoFinal).toBe('250.00')
  })

  it('markup 180% equivale a 2,80× o custo', () => {
    expect(calcularOrcamento({ ...base, percentualLucro: '180' }).multiplicadorEquivalente).toBe('2.80')
  })

  it('preserva percentual com casas decimais: 12,34% → 1,1234×', () => {
    expect(calcularOrcamento({ ...base, percentualLucro: '12.34' }).multiplicadorEquivalente).toBe('1.1234')
  })

  it('não existe no modo margem', () => {
    expect(calcularOrcamento({ ...base, modoLucro: 'margem', percentualLucro: '30' }).multiplicadorEquivalente).toBeNull()
  })
})

describe('validações de entrada (RN10, CN01–CN03)', () => {
  it.each([
    ['margem 100 (CN01)', { modoLucro: 'margem', percentualLucro: '100' }, 'A margem deve ser menor que 100%'],
    ['margem acima de 100', { modoLucro: 'margem', percentualLucro: '120' }, 'A margem deve ser menor que 100%'],
    ['margem negativa', { modoLucro: 'margem', percentualLucro: '-1' }, 'A margem não pode ser negativa'],
    ['markup negativo', { percentualLucro: '-0.01' }, 'O markup não pode ser negativo'],
    ['quantidade zero (CN02)', { itens: [{ tipo: 'material', quantidade: '0', valorUnitario: '10' }] }, 'A quantidade deve ser maior que zero'],
    ['quantidade negativa (CN02)', { itens: [{ tipo: 'material', quantidade: '-1', valorUnitario: '10' }] }, 'A quantidade deve ser maior que zero'],
    ['valor unitário negativo (CN03)', { itens: [{ tipo: 'servico', quantidade: '1', valorUnitario: '-5' }] }, 'O valor unitário não pode ser negativo'],
    ['custo adicional zero', { custosAdicionais: ['0'] }, 'O custo adicional deve ser maior que zero'],
  ] as const)('recusa %s', (_nome, alteracao, mensagem) => {
    expect(() => calcularOrcamento({ ...base, ...alteracao } as EntradaCalculo)).toThrow(new ErroCalculo(mensagem))
  })
})

// O domínio só aceita decimal simples com ponto ("12.50"). A vírgula é convertida antes, na API.
// Qualquer outro texto vira ErroCalculo (400), nunca NaN nem erro interno (500).
describe('formato dos números de entrada (regras-de-calculo.md §1)', () => {
  const comQuantidade = (quantidade: string): EntradaCalculo => ({ ...base, itens: [{ tipo: 'material', quantidade, valorUnitario: '10' }] })

  it.each(['NaN', 'Infinity', '-Infinity', '', ' ', '2,5', '0x10', '1e3', '+1', '1.', '.5', 'abc'])('recusa quantidade %j', (quantidade) => {
    expect(() => calcularOrcamento(comQuantidade(quantidade))).toThrow(new ErroCalculo('Quantidade inválida: use número com até 3 casas decimais'))
  })

  it.each([
    ['quantidade com 4 casas', comQuantidade('1.0001'), 'Quantidade inválida: use número com até 3 casas decimais'],
    ['valor unitário com 5 casas', { ...base, itens: [{ tipo: 'material', quantidade: '1', valorUnitario: '10.00001' }] }, 'Valor unitário inválido: use número com até 4 casas decimais'],
    ['custo adicional com 3 casas', { ...base, custosAdicionais: ['10.005'] }, 'Custo adicional inválido: use número com até 2 casas decimais'],
    ['percentual com 3 casas', { ...base, percentualLucro: '10.005' }, 'Percentual de lucro inválido: use número com até 2 casas decimais'],
    ['percentual NaN', { ...base, percentualLucro: 'NaN' }, 'Percentual de lucro inválido: use número com até 2 casas decimais'],
    ['custo adicional Infinity', { ...base, custosAdicionais: ['Infinity'] }, 'Custo adicional inválido: use número com até 2 casas decimais'],
  ] as const)('recusa %s', (_nome, entrada, mensagem) => {
    expect(() => calcularOrcamento(entrada as EntradaCalculo)).toThrow(new ErroCalculo(mensagem))
  })

  it('aceita o limite exato de casas de cada grandeza', () => {
    const resultado = calcularOrcamento({
      ...base,
      itens: [{ tipo: 'material', quantidade: '1.125', valorUnitario: '1.2350' }],
      custosAdicionais: ['0.01'],
      percentualLucro: '12.34',
    })
    expect(resultado.valoresLinha).toEqual(['1.39'])
  })
})
