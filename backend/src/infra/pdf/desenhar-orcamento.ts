import PDFDocument from 'pdfkit'
import type { ConteudoPdf } from './conteudo-orcamento'

// Desenho do PDF com PDFKit (D023). Só posiciona o conteúdo já montado; não decide o que aparece.
// A4, fontes padrão do PDF (cobrem os acentos do português) e as cores da identidade visual (D014).

const VERDE = '#1e4d38'
const LARANJA = '#e8722d'
const TINTA = '#17261d'
const SUAVE = '#4f5d52'
const LINHA = '#d9d1bf'
const MARGEM = 50
const LARGURA = 595.28 - MARGEM * 2

export function desenharOrcamento(conteudo: ConteudoPdf): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: MARGEM, info: { Title: conteudo.titulo } })
  const partes: Buffer[] = []
  doc.on('data', (parte: Buffer) => partes.push(parte))
  const pronto = new Promise<Buffer>((resolver) => doc.on('end', () => resolver(Buffer.concat(partes))))

  // Cabeçalho: marcenaria à esquerda, número e datas à direita, régua laranja embaixo.
  const topo = doc.y
  doc.font('Helvetica-Bold').fontSize(18).fillColor(VERDE).text(conteudo.marcenaria[0], MARGEM, topo, { width: LARGURA * 0.6 })
  doc.font('Helvetica').fontSize(10).fillColor(SUAVE)
  for (const linha of conteudo.marcenaria.slice(1)) doc.text(linha, { width: LARGURA * 0.6 })
  const fimEsquerda = doc.y

  doc.font('Helvetica-Bold').fontSize(14).fillColor(TINTA).text(conteudo.titulo, MARGEM, topo, { width: LARGURA, align: 'right' })
  doc.font('Helvetica').fontSize(10).fillColor(SUAVE)
  for (const { rotulo, valor } of conteudo.datas) doc.text(`${rotulo}: ${valor}`, { width: LARGURA, align: 'right' })

  const regua = Math.max(fimEsquerda, doc.y) + 12
  doc.moveTo(MARGEM, regua).lineTo(MARGEM + LARGURA, regua).lineWidth(2).strokeColor(LARANJA).stroke()
  doc.y = regua + 16

  secao(doc, 'Cliente')
  doc.font('Helvetica-Bold').fontSize(11).fillColor(TINTA).text(conteudo.cliente[0])
  doc.font('Helvetica').fontSize(10).fillColor(SUAVE)
  for (const linha of conteudo.cliente.slice(1)) doc.text(linha)
  doc.moveDown()

  if (conteudo.especificacoes) {
    // Como no modelo do proprietário: "Orçamento referente a <projeto>, estando incluídos…" e o texto dele.
    secao(doc, 'Especificações do orçamento')
    const [antes, depois] = conteudo.especificacoes.introducao.split(conteudo.projeto)
    doc.font('Helvetica').fontSize(11).fillColor(TINTA).text(antes, { continued: true })
      .font('Helvetica-Bold').text(conteudo.projeto, { continued: true })
      .font('Helvetica').text(depois)
    doc.moveDown(0.5)
    for (const linha of conteudo.especificacoes.linhas) {
      if (linha.tipo === 'espaco') { doc.moveDown(0.5); continue }
      if (linha.tipo === 'subtitulo') { doc.moveDown(0.3); doc.font('Helvetica-Bold').fontSize(11).text(linha.texto, MARGEM, doc.y, { width: LARGURA }); continue }
      if (linha.tipo === 'marcador') { doc.font('Helvetica').fontSize(11).text(`•  ${linha.texto}`, MARGEM + 10, doc.y, { width: LARGURA - 10 }); continue }
      doc.font('Helvetica').fontSize(11).text(linha.texto, MARGEM, doc.y, { width: LARGURA })
    }
    doc.x = MARGEM
    doc.moveDown()
  } else {
    secao(doc, 'Projeto')
    doc.font('Helvetica').fontSize(11).fillColor(TINTA).text(conteudo.projeto)
    doc.moveDown()
  }

  if (conteudo.itens) {
    secao(doc, 'Materiais e serviços')
    const colunaQuantidade = MARGEM + LARGURA - 110
    for (const item of conteudo.itens) {
      if (doc.y > 760) doc.addPage()
      const y = doc.y
      doc.font('Helvetica').fontSize(10).fillColor(TINTA).text(item.descricao, MARGEM, y, { width: LARGURA - 120 })
      const fim = doc.y
      doc.text(item.quantidade, colunaQuantidade, y, { width: 110, align: 'right' })
      doc.y = Math.max(fim, doc.y) + 4
      doc.moveTo(MARGEM, doc.y).lineTo(MARGEM + LARGURA, doc.y).lineWidth(0.5).dash(2, { space: 2 }).strokeColor(LINHA).stroke().undash()
      doc.y += 5
    }
    doc.x = MARGEM
    doc.moveDown()
  }

  // Preço final: número em destaque e o valor por extenso logo abaixo (RF41).
  if (doc.y > 700) doc.addPage()
  const caixa = doc.y
  doc.rect(MARGEM, caixa, LARGURA, 62).fillColor('#e0ebe2').fill()
  doc.font('Helvetica-Bold').fontSize(11).fillColor(VERDE).text('Preço final', MARGEM + 14, caixa + 12)
  doc.fontSize(18).text(conteudo.precoFinal, MARGEM, caixa + 10, { width: LARGURA - 14, align: 'right' })
  doc.font('Helvetica').fontSize(10).fillColor(TINTA).text(`(${conteudo.precoPorExtenso})`, MARGEM + 14, caixa + 38, { width: LARGURA - 28 })
  doc.x = MARGEM
  doc.y = caixa + 62 + 20

  if (conteudo.observacoes) {
    secao(doc, 'Observações')
    doc.font('Helvetica').fontSize(10).fillColor(TINTA).text(conteudo.observacoes, { width: LARGURA })
    doc.moveDown()
  }

  doc.font('Helvetica').fontSize(9).fillColor(SUAVE).text(conteudo.rodape, MARGEM, doc.y + 10, { width: LARGURA, align: 'center' })
  doc.end()
  return pronto
}

function secao(doc: PDFKit.PDFDocument, titulo: string) {
  doc.x = MARGEM
  doc.font('Helvetica-Bold').fontSize(9).fillColor(SUAVE).text(titulo.toUpperCase(), { characterSpacing: 1 })
  doc.moveDown(0.3)
}
