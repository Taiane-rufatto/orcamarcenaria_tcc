# Plano — Orçamento em PDF

## Resumo

`GET /orcamentos/:id/pdf?itens=sim|nao` devolve `application/pdf` de um orçamento registrado. O conteúdo é montado por uma função pura a partir do orçamento já consultado (D019) e dos dados da marcenaria; o PDFKit só o desenha (D023). O orçamento ganha `observacoes`.

## Verificação da constitution

- **Cálculo:** o PDF não calcula; o extenso é escrito a partir do texto decimal, dígito a dígito, sem `Number`.
- **Isolamento:** a consulta reaproveita `consultarOrcamento` (filtrada pela sessão).
- **RF42:** teste varre todo o conteúdo em busca de valores e palavras de custo.

## Desenho

| Parte | Arquivo | Conteúdo |
|---|---|---|
| Migração | `backend/migracoes/006-observacoes.sql` | `orcamento.observacoes VARCHAR(1000)` |
| Extenso | `backend/src/infra/pdf/extenso.ts` | `"2760.00"` → `"dois mil, setecentos e sessenta reais"` |
| Conteúdo | `backend/src/infra/pdf/conteudo-orcamento.ts` | função pura: orçamento + marcenaria + opção → blocos de texto e linhas de itens |
| Desenho | `backend/src/infra/pdf/desenhar-orcamento.ts` | PDFKit, A4, fontes padrão, cores da identidade (D014) |
| Caso de uso | `aplicacao/orcamento/` | exige situação ≠ rascunho (409) |
| Rota | `api/rotas/orcamentos.ts` | `GET /orcamentos/:id/pdf`, `Content-Disposition: attachment; filename="orcamento-12.pdf"` |
| Marcenaria | `infra/repositorios/` | leitura de nome e responsável pela sessão |
| Tela | `servicos/orcamentos.ts`, `Orcamento.tsx` | campo Observações no rascunho; "Baixar PDF" com a escolha fora de rascunho, baixado com o token (fetch → blob) |

## Riscos

| Risco | Mitigação |
|---|---|
| Acentos nas fontes padrão | Fontes padrão do PDF usam WinAnsi, que cobre o português; verificar no PDF de exemplo |
| Extenso errado em casos de borda | Tabela de casos conferidos à mão (1,00; 0,50; 1.000,00; 1.001,00; 2.760,00; 1.000.000,00; 21,01) |
| Vazar custo no PDF | Teste de varredura do conteúdo nas duas opções |
