# Spec 029 — Ajustes de uso: lista de materiais, selo de valor ajustado, meta de vendas, painel e filtro de situação

**Branch:** `spec/029-ajustes-de-uso-e-painel`
**Data:** 2026-11-17
**Status:** implementada e verificada por testes automatizados em 2026-11-17 (D045). **Integrada em `main` (PR #24) e publicada na VPS em 2026-11-17. Falta o percurso de tela pela autora.**
Origem: uso do sistema pela autora, em 2026-11-17, depois da publicação da spec 028, e conversa com o proprietário sobre o significado da meta do mês. Só tela e texto, com uma exceção pequena na API (filtro por várias situações) e uma contagem nova no painel.

## Contexto

Com o fornecedor oculto (spec 026, D041), a lista de compras por fornecedor ficou sem sentido: mostrava "Sem fornecedor cadastrado" e não havia como resolver. Usando o sistema, a autora encontrou ainda mensagens que confundem: o selo "Valor ajustado" aparecendo em item que está no preço do catálogo, a "meta do mês" sem dizer o que mede, o card "Aprovados" ao lado de "Em produção" e "Entregues" parecendo uma soma, o prazo do "Preço antigo" sem explicação e o filtro de situação que só aceitava uma por vez.

## Histórias e requisitos

US20, US21, US22; RF37, RF51, RF58, RF61; RN20 (texto) e RN21 (nova). Decisão D045.

## O que muda

1. **Lista de materiais para copiar (RF58).** A seção "Lista de compras por fornecedor" sai da tela do orçamento (o componente e a API continuam no código, como o fornecedor). No card **Itens** entra o botão **"Copiar lista de materiais"**: copia só os materiais (quantidade, unidade e nome), sem fornecedor e sem valores, com o cabeçalho "Lista de compras · <projeto>". Serviço não entra. O botão aparece em qualquer situação do orçamento, se houver material.
2. **Selo "Valor ajustado neste orçamento" (RN21).** Só aparece quando o valor do item é diferente do custo **atual** do catálogo. Antes, comparava com o custo do dia em que o item entrou no primeiro orçamento e continuava aparecendo depois de "Usar o novo custo" e ao duplicar. Só muda o que a tela mostra; preço e memorial não mudam.
3. **Explicação do "Preço antigo" (RF51).** Linha de ajuda na página Materiais e dica (`title`) nos dois selos: o preço aparece como antigo quando não é atualizado nem confirmado há **mais de 30 dias** (RN15); "Continua o mesmo" confirma e reinicia a contagem.
4. **Meta de vendas (RF61, RN20).** O nome passa a "Meta de vendas do mês", com o texto "Você fechou R$ X em orçamentos aprovados" e a ajuda "Soma os orçamentos aprovados emitidos neste mês, independentemente de pagamento". Confirmado com o proprietário: a meta é sobre o que se vende. **O mês é o da emissão do orçamento** (D045).
5. **Aprovação no painel (RF47).** Os cards deixam de misturar totais e partes: **Entram na meta de vendas** (Somente aprovados, Aprovados e em produção, Aprovados e entregues) e **Não entram na meta de vendas** (Esperando resposta, Recusados, Vencidos sem resposta, Rascunhos). Cada orçamento enviado cai em um só card. A API passa a devolver `aprovados.soAprovados` (orçamentos na situação "aprovado", sem produção nem entrega); a tela não subtrai nada.
6. **Filtro de situação com várias opções (RF37).** Na lista de orçamentos, o `<select>` vira botões que ligam e desligam cada situação; nenhum ligado mostra todas. A API aceita `?situacao=aprovado,em_producao` (lista separada por vírgula, sem repetição; uma inválida dá 400); o formato de uma situação só continua valendo.

## Capacidade entregável

1. **Entrega:** os seis itens acima. Sem migração de banco.
2. **Fica de fora:** guardar a data de aprovação para contar a meta pelo mês da aprovação (descartado, D045); religar fornecedor e lista por fornecedor; "Abrir no WhatsApp" e cotação (TCC II); meta por lucro ou ponto de equilíbrio (TCC II); persistir o filtro de situação na URL.
3. **Demonstração:** abrir um orçamento com materiais e copiar a lista para o WhatsApp; usar "Usar o novo custo" e ver o selo de ajuste sumir; ver o painel com os dois grupos; marcar Aprovado e Em produção juntos na lista de orçamentos.

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| Texto copiado: só materiais, "quantidade unidade nome", cabeçalho com o projeto; vazio sem material | `frontend/src/servicos/orcamentos.test.ts` |
| Item no custo atual do catálogo não é "ajustado" (depois de "Usar o novo custo" também); valor digitado diferente do catálogo continua sendo | `backend/tests/integracao/compras.test.ts` |
| `soAprovados` conta só a situação "aprovado"; os seis grupos somam os enviados | `backend/tests/unidade/painel.test.ts`, `backend/tests/integracao/painel.test.ts` |
| Painel: dois grupos e a ordem dos cards; frase da meta de vendas | `frontend/src/paginas/Painel.test.tsx` |
| Filtro: duas situações juntas, repetida conta uma vez, inválida 400, formato antigo, campos vazios | `backend/tests/integracao/registro.test.ts` |
| Requisição envia a lista separada por vírgula; nenhuma marcada envia vazio | `frontend/src/servicos/orcamentos.test.ts` |
| Cálculo, PDF e demais telas inalterados | Suíte do backend inteira (CT01–CT10) e do frontend |
| Visual dos botões, dos grupos do painel e da lista copiada no WhatsApp | Percurso de tela (pendente) |

## Evidências

`evidencias/testes/029-ajustes-de-uso-e-painel-2026-11-17.md`.

## Perguntas em aberto

Nenhuma. A contagem da meta pelo mês da emissão e a ausência da data de aprovação foram decididas pela autora (D045).
