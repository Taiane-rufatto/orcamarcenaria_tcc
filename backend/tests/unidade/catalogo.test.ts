import { describe, expect, it } from 'vitest'
import { materialSchema, servicoSchema } from '../../src/api/validacoes/catalogo'

const material = { nome: 'MDF 18 mm', unidade: 'ch', custoUnitario: '1,2350' }

describe('validações de material', () => {
  it('preserva 1,2350 como texto decimal, sem ponto flutuante', () => {
    const resultado = materialSchema.parse(material)
    expect(resultado.custoUnitario).toBe('1.2350')
    expect(typeof resultado.custoUnitario).toBe('string')
  })

  it.each(['', '0', '0,0000', '-1', 'abc', '1,23456', '1,2,3'])('rejeita custo %j', (custoUnitario) => {
    expect(materialSchema.safeParse({ ...material, custoUnitario }).success).toBe(false)
  })

  it('aceita as oito unidades canônicas e rejeita outras', () => {
    for (const unidade of ['un', 'm', 'm²', 'ml', 'ch', 'kg', 'L', 'pç']) {
      expect(materialSchema.safeParse({ ...material, unidade }).success).toBe(true)
    }
    expect(materialSchema.safeParse({ ...material, unidade: 'cm' }).success).toBe(false)
  })

  it('exige nome e limita a descrição a 300 caracteres', () => {
    expect(materialSchema.safeParse({ ...material, nome: '   ' }).success).toBe(false)
    expect(materialSchema.safeParse({ ...material, descricao: 'a'.repeat(300) }).success).toBe(true)
    expect(materialSchema.safeParse({ ...material, descricao: 'a'.repeat(301) }).success).toBe(false)
  })
})

describe('validações de serviço', () => {
  const servico = { nome: 'Montagem', tipoCobranca: 'hora', valorUnitario: '80,5' }

  it('aceita cobrança por hora ou unidade e normaliza o valor', () => {
    expect(servicoSchema.parse(servico).valorUnitario).toBe('80.5')
    expect(servicoSchema.safeParse({ ...servico, tipoCobranca: 'unidade' }).success).toBe(true)
  })

  it('rejeita cobrança desconhecida e valor zero', () => {
    expect(servicoSchema.safeParse({ ...servico, tipoCobranca: 'dia' }).success).toBe(false)
    expect(servicoSchema.safeParse({ ...servico, valorUnitario: '0' }).success).toBe(false)
  })
})
