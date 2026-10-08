# Spec 014 — Cadastro pelo teclado

**Branch:** `spec/014-cadastro-pelo-teclado` (criada do `main`, com o 013 integrado)
**Data:** 2026-10-08
**Status:** fechada em 2026-10-08 (D031). Implementada e verificada em `evidencias/testes/014-cadastro-pelo-teclado-2026-10-08.md` (65 de 65 verificações; dez casos 10 de 10); falta a revisão humana do diff (B21)

## Contexto

O 013 (D030) deixou o Enter salvando e fechando, com o botão "Salvar e cadastrar outro" para continuar. A autora, ao usar, pediu agilidade também para quem prefere o teclado: cadastrar em sequência sem pegar o mouse e sair só quando quiser.

## Histórias e requisitos

US03, US05 e US06 (cadastro de material, serviço e cliente); RF08, RF11, RF17 (cadastro) e RNF05. Nenhum requisito novo, nenhuma regra de cálculo tocada.

## Clarificações

### Sessão 2026-10-08

- Q: O que o Enter faz? → A: no painel de **novo** cadastro, o Enter cadastra e abre o formulário em branco para o próximo, repetidamente. O painel só fecha com **Esc** ou com o **✕** (decidido pela autora, muda D030).
- Q: E o botão "Salvar e cadastrar outro"? → A: sai. O botão principal ("Cadastrar material/serviço/cliente") passa a ter o mesmo efeito do Enter, e "Cancelar" vira "Fechar" (já que itens podem ter sido salvos).
- Q: E na edição? → A: não muda: Enter e "Salvar alterações" salvam e fecham; "Cancelar" continua.
- Q: Continua valendo: foco no Nome, unidade e tipo de cobrança mantidos, confirmação "✓ nome cadastrado", erro mantém o painel e os dados? → A: sim, como no 013.
- Q: Enter repetido? → A: uma trava impede gravar o mesmo cadastro duas vezes enquanto o envio anterior não termina.
- Q: Uma dica na tela? → A: sim, no painel de novo cadastro: "Enter cadastra e abre um formulário em branco. Esc ou ✕ fecham o painel."

## Capacidade entregável

1. **Entrega:** em Materiais, Serviços e Clientes, o painel de novo cadastro aceita cadastros em sequência só com o teclado (digitar, Enter, digitar, Enter...) e fecha apenas com Esc ou ✕.
2. **Fica de fora:** Enter pulando de campo em campo; cadastro em tabela; importação de planilha; qualquer mudança de regra, API ou dado.
3. **Demonstração:** em Materiais, em 1366×768, abrir "+ Novo material", cadastrar três materiais seguidos só com o teclado, ver os três na lista e fechar com Esc. Repetir em Serviços e Clientes.

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| Enter no painel de novo cadastro grava, mantém o painel aberto, deixa o formulário em branco e leva o foco ao Nome | Percurso de tela (Edge + Playwright) |
| Três cadastros seguidos só com o teclado | Percurso de tela |
| Esc e ✕ fecham; o botão "Fechar" também | Percurso de tela |
| Enter repetido não duplica o cadastro | Percurso de tela |
| Erro: nada é gravado, o painel mantém os dados e mostra a mensagem | Percurso de tela |
| Na edição, Enter salva e fecha, sem dica de sequência, com "Cancelar" | Percurso de tela |
| RNF05 a 1366×768 e a 390 px, com o painel aberto | Percurso |
| `backend/` e `frontend/src/servicos/` sem mudança; dez casos de cálculo iguais | Revisão do diff + ensaio dos dez casos + suíte |

## Evidências

`evidencias/testes/014-cadastro-pelo-teclado-2026-10-08.md`, com capturas em `014-capturas/`.

## Perguntas em aberto

- Nenhuma.
