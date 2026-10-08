# Evidências — Spec 015: nomes em maiúsculas

**Data:** 2026-10-08
**Branch:** `spec/015-nomes-em-maiusculas` (sobre o 014) · **Ambiente:** local (Windows 11, PostgreSQL 17 local) · **Navegador:** Microsoft Edge dirigido por Playwright, 1366×768

## Suítes automatizadas

| Verificação | Resultado |
|---|---|
| `backend/npx vitest run` | 14 arquivos, 143 testes aprovados (um novo: D032, em `catalogo.test.ts`) |
| `frontend/npm test`, `tsc -b`, `eslint src` | 14 testes aprovados; sem avisos |

Nove testes antigos esperavam o nome como digitado (`'João Fictício'`, `'MDF 18 mm'`, `'Corte e usinagem'` do item copiado do catálogo etc.). Foram atualizados para a forma em maiúsculas, que é a mudança pretendida; as entradas dos testes continuam em caixa mista, o que prova a conversão. Os testes do cálculo (CT01–CT10, CT03/CT04 pela API) passaram sem alteração.

O novo teste cobre: `'  fita de borda 22mm  '` → `FITA DE BORDA 22MM`; `Fita de Borda 22MM` → 409; serviço `instalação e ajuste` → `INSTALAÇÃO E AJUSTE`; cliente `joão da silva` → `JOÃO DA SILVA`; edição `maria çã` → `MARIA ÇÃ`; busca `fita` acha o material.

## Migração `009-nomes-em-maiusculas.sql`

| Verificação | Resultado |
|---|---|
| Backup do banco local antes de aplicar | feito (`pg_dump`, fora do repositório) |
| Nomes que mudariam no local | 60 materiais, 23 serviços, 27 clientes; **0 colisões** |
| Aplicada no banco local | depois: 0 materiais, 0 serviços e 0 clientes fora de maiúsculas |
| Idempotente | segunda execução sem alterar nada |
| Conversão de acentos pelo banco | `instalação é ü ñ` → `INSTALAÇÃO É Ü Ñ` (local); conferido também no PostgreSQL da VPS (C.UTF-8), só leitura |
| Trava de colisão | num banco de teste, em transação desfeita, `zzdup` e `ZZDUP` na mesma marcenaria: a migração parou com "material: ZZDUP (2 cadastros)" e nada foi alterado |
| Impacto na VPS (leitura) | 6 materiais, 3 serviços e 4 clientes mudariam; 0 colisões. **Aplicada na VPS depois**: backup do banco, `atualizar.sh main` e conferência (0 nomes fora de maiúsculas; os serviços ficaram `AJUDANTE`, `CORTE E USINAGEM`, `FRETE`, `MONTAGEM`; havia 4 serviços e não 3 na hora da publicação) |

## Ensaio pela tela

Conta de ensaio própria ("Marcenaria Ensaio 015", dados fictícios). 11 verificações aprovadas:
- o campo Nome mostra maiúsculas ao digitar (`text-transform`);
- a confirmação mostra `✓ MDF BRANCO 18MM INSTALAÇÃO cadastrado`;
- `Mdf Branco 18MM Instalação` é recusado com "Já existe um cadastro com este nome";
- listas de materiais, serviços e clientes em maiúsculas, com acentos; edição de cliente também converte;
- no orçamento, o campo com busca acha o material digitando `mdf branco` (sem diferenciar caixa) e o item incluído leva o nome em maiúsculas;
- a descrição do projeto (`armário de cozinha`) continua como digitada;
- nenhum erro de página ou de console, além do 409 esperado.

## O que esta execução prova e o que não prova

- **Prova:** a conversão acontece na API (vale em qualquer tela e no PDF), a migração é segura (backup, trava, idempotência) e o cálculo não mudou.
- **Não prova:** os dez casos não foram relançados pela tela nesta spec (o cálculo e o front de valores não mudaram; os testes de CT01–CT10 do backend passaram). O PDF não foi regenerado e conferido visualmente. O ensaio foi automatizado e só no Edge.
- **Efeitos aceitos (D032):** itens de orçamentos já registrados mantêm a descrição antiga; nomes de cliente em orçamentos existentes (e no PDF) passam a aparecer em maiúsculas; "Mdf" e "MDF" passam a ser o mesmo nome.
