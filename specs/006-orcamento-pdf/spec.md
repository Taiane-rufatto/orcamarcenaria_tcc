# Spec 006 — Orçamento em PDF para o cliente

**Branch:** `spec/006-orcamento-pdf`  
**Data:** 2026-09-28  
**Status:** implementada e verificada em 2026-09-28; fechamento pendente da revisão do diff pela autora (B16)

## Clarificações

### Sessão 2026-09-28

- Q: Como mostrar os itens sem revelar custo e lucro? → A: o PDF nunca mostra valor por item; ao baixar, escolhe-se entre "itens com quantidades e preço final" (padrão provisório até a Q7) e "apenas o preço final" (D022).
- Q: Rascunho gera PDF? → A: não; só orçamento registrado, que tem número (D022, US14).
- Q: O que é o "campo de observações"? → A: um texto digitado no orçamento em rascunho e impresso no PDF (D022).
- Q: Qual biblioteca? → A: PDFKit no servidor, com o conteúdo montado por uma função testável e o desenho à parte (D023).

### Sessão 2026-09-28 (revisão após uso)

- A autora gerou um PDF sem observações: o texto fora digitado e o orçamento registrado sem clicar em salvar, e o texto se perdeu. → Textos com botão próprio, aviso de pendência e gravação automática ao registrar.
- Q: O PDF deve seguir o modelo que o proprietário já usa ("Orçamento referente a… estando incluídos os seguintes itens", marcadores, "Ferragens e acabamentos:")? → A: sim; dois campos, **especificações** (alto do PDF, com marcadores e subtítulos) e **observações** (fim); a lista de materiais e serviços do sistema só entra se marcada ao baixar. Responde à Q7 (D022).

## Capacidade entregável

1. **Entrega:** no rascunho, o marceneiro escreve as especificações (o que está incluído) e as observações. No orçamento registrado, clica em "Baixar PDF" e recebe um PDF no formato do modelo do proprietário: marcenaria, cliente, número, datas, especificações, preço final em número e por extenso, observações e validade — e, se marcar, a lista de materiais e serviços só com quantidades. Nenhum custo, percentual ou lucro aparece.
2. **Fica de fora:** telefone, e-mail, CNPJ e endereço da marcenaria (RF05, incremento 007); logotipo; envio por e-mail ou link (pós-TCC); valores por item (D022).
3. **Demonstração:** registrar o orçamento do exemplo §4 com especificações e baixar o PDF padrão e o com lista: ambos mostram "R$ 2.760,00 (dois mil, setecentos e sessenta reais)" e nenhum contém R$ 724,75, "markup", "margem", "lucro" ou "custo".

## Histórias e critérios verificáveis

### US14 — Gerar o orçamento em PDF

Cobertura: RF41, RF42, RF43, RNF19.

- O conteúdo tem marcenaria (nome e responsável), cliente (nome e, se houver, telefone, e-mail e endereço), número, emissão, validade, descrição do projeto, itens com quantidade e unidade, preço final em número e por extenso e observações (RF41). *Verificação:* teste de unidade do conteúdo + inspeção visual.
- Nas duas opções, nenhum texto do PDF contém valor unitário, valor de linha, subtotais, custo direto, lucro, percentual, multiplicador, "markup", "margem" ou "custo" (RF42). *Verificação:* teste de unidade que percorre todo o conteúdo gerado a partir do CT03.
- "Apenas o preço final" omite a lista de itens (RF42). *Verificação:* teste de unidade.
- O preço final é o gravado pelo domínio (D019), sem recalcular. *Verificação:* teste de integração com o CT03 (R$ 2.760,00).
- O preço por extenso está correto para centavos, milhares, "um real", zero centavos e valores até milhões. *Verificação:* testes de unidade com casos conferidos à mão.
- A tela do orçamento registrado oferece "Baixar PDF" com a escolha (RF43); o rascunho não oferece e a API recusa (409). *Verificação:* integração + percurso de tela.
- PDF de orçamento com dez itens é gerado em menos de 5 segundos (RNF19). *Verificação:* integração medindo o tempo.
- Outra marcenaria recebe 404 (TI02). *Verificação:* integração.
- Observações editáveis em rascunho (até 1.000 caracteres), travadas depois do registro (RF39). *Verificação:* integração.

## Regras e restrições

- Nenhuma regra de cálculo muda. O PDF lê os totais gravados; o extenso é só formatação do texto decimal.
- `marcenaria_id` vem apenas da sessão.
- Evidências com dados fictícios (RNF15).

## Evidências previstas

- Unidade: conteúdo do PDF (RF41, RF42) e extenso.
- Integração: download, recusa em rascunho, tempo (RNF19), isolamento, observações.
- Regressão dos dez casos; PDFs de exemplo conferidos visualmente; validação manual. Registro em `evidencias/testes/006-pdf-AAAA-MM-DD.md`.

## Perguntas em aberto

- Nenhuma. A Q7 foi respondida pelo modelo de orçamento do proprietário (D022).
