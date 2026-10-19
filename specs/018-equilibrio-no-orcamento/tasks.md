# Tarefas — Spec 018 — Lucro mínimo e aviso no orçamento

Lista do que a spec pede, para distinguir o que foi feito do que falta. `[x]` feito e verificado; `[ ]` pendente.

- [x] Pesquisar como o mercado trata margem e preço (Omie, Sebrae)
- [x] Domínio `backend/src/dominio/equilibrio/equilibrio.ts` com testes de unidade (RN12, RN13)
- [x] Migração `010` (coluna `lucro_minimo`; remove as colunas da primeira ideia)
- [x] API `PUT /configuracoes/equilibrio` e campo `equilibrio` no orçamento
- [x] Tela: campo em Minha marcenaria e quadro "Quanto sobra de lucro" em frases simples
- [x] Testes de integração e de componente; PDF sem o aviso
- [x] Documentar D033, RF44–RF46, US17, RN12–RN13
- [ ] Conferir os 6 casos da evidência em planilha (autora)
- [ ] Percurso de tela no navegador, a 1366×768 e a 390 px (autora)
- [x] Aplicar a migração `010` na VPS, com backup antes (feito em 2026-10-18, junto das migrações 010 a 015)
- [ ] Revisar o diff e abrir o PR
