# Spec 015 — Nomes em maiúsculas

**Branch:** `spec/015-nomes-em-maiusculas` (criada sobre `spec/014-cadastro-pelo-teclado`; integrar o 014 primeiro)
**Data:** 2026-10-08
**Status:** fechada em 2026-10-08 (D032). Implementada e verificada em `evidencias/testes/015-nomes-em-maiusculas-2026-10-08.md`; migração aplicada no banco local; **falta publicar na VPS (com backup) e a revisão humana do diff (B22)**

## Contexto

Nomes de materiais, serviços e clientes ficam misturados (`mdf 18mm`, `Mdf 18MM`, `MDF 18mm`), o que atrapalha a leitura da lista, o campo com busca e o PDF. A autora pediu para padronizar em maiúsculas, já ao cadastrar.

## Histórias e requisitos

US03, US05 e US06; RF08, RF11 e RF17 (o nome passa a ser gravado em maiúsculas); RNF26 (português: acentos preservados). Nenhuma regra de cálculo tocada.

## Clarificações

### Sessão 2026-10-08

- Q: Visual ou gravado? → A: **gravado** (na API, para valer em todas as telas e no PDF), com o campo Nome já exibindo maiúsculas ao digitar.
- Q: Onde vale? → A: **só o nome** de material, serviço e cliente, ao cadastrar e ao editar. Descrição do projeto, descrição de itens avulsos, observações e especificações continuam como a pessoa digita.
- Q: E os cadastros que já existem? → A: uma migração converte todos; backup do banco antes de aplicar na VPS. Fica a decisão da autora, que escolheu converter.
- Q: E se dois nomes viram o mesmo em maiúsculas (ex.: "mdf" e "MDF" na mesma marcenaria)? → A: a migração **para sem alterar nada** e lista os casos; a autora decide qual manter. No local e na VPS não há colisões.
- Q: Itens já incluídos em orçamentos? → A: guardam a descrição da época (RN08) e **não são alterados**. O nome do cliente aparece sempre pelo cadastro, então muda junto, inclusive no PDF.
- Q: E o "nome único"? → A: passa a valer sem diferenciar maiúscula de minúscula, porque o nome é gravado em maiúsculas: "Mdf" e "MDF" são o mesmo nome e dão "Já existe um cadastro com este nome".
- Q: Acentos? → A: preservados e convertidos (`ç→Ç`, `ã→Ã`); conferido no banco local e no da VPS.

## Capacidade entregável

1. **Entrega:** ao cadastrar ou editar material, serviço ou cliente, o nome é gravado em maiúsculas; o campo Nome já mostra maiúsculas ao digitar, a confirmação e as listas também; os cadastros existentes são convertidos.
2. **Fica de fora:** textos livres (descrição do projeto, itens avulsos, observações, especificações); nome da marcenaria e do usuário; alterar descrições de itens de orçamentos já registrados.
3. **Demonstração:** em Materiais, digitar `mdf branco 18mm instalação`, apertar Enter e ver `MDF BRANCO 18MM INSTALAÇÃO` na confirmação e na lista; tentar cadastrar `Mdf Branco 18MM Instalação` e ver "Já existe um cadastro com este nome".

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| A API grava o nome em maiúsculas (com acentos) em material, serviço e cliente, no cadastro e na edição | Testes de integração (`catalogo.test.ts`) |
| Mesmo nome com outra grafia recebe 409 | Teste de integração + percurso de tela |
| Campo Nome, confirmação e listas mostram maiúsculas | Percurso de tela (Edge + Playwright) |
| Textos livres não mudam | Percurso de tela (descrição do projeto) |
| Migração converte os nomes existentes, é idempotente e para se houver colisão | Execução local duas vezes + teste da trava em transação desfeita + conferência na VPS (só leitura) |
| Cálculo inalterado | Suíte do backend, inclusive CT01–CT10 |

## Regras e restrições

- A conversão fica em um único ponto do backend (`nomeEmMaiusculas`, em `validacoes/catalogo.ts`), usado também pelo cliente.
- Nenhuma mudança em regra de cálculo, rotas ou esquema de tabelas; só a migração `009` (dados).

## Evidências

`evidencias/testes/015-nomes-em-maiusculas-2026-10-08.md`, com capturas em `015-capturas/`.

## Perguntas em aberto

- Nenhuma.
