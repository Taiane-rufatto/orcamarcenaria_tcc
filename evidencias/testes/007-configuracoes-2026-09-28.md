# Evidências — Spec 007: configurações da marcenaria

**Data:** 2026-09-28
**Branch:** `spec/007-configuracoes`
**Ambiente:** local (Windows 11, Node.js 24, PostgreSQL 17), banco `orcamarcenaria_teste` · **Navegador:** Microsoft Edge

## Regressão do cálculo (`verificar-calculo`)

| Verificação | Resultado |
|---|---|
| Domínio do cálculo | Única mudança: a verificação dos limites do lucro virou a função exportada `validarLucro`, com o mesmo código; nenhuma fórmula mudou |
| Ponto flutuante | Nenhum `Number`, `parseFloat` ou `parseInt` em valor, quantidade ou percentual. Ocorrências: porta do servidor e `validadeDias` (número de dias, não valor) |
| CT01–CT10 | 10 de 10 com diferença nula (45 testes de unidade do domínio) |
| CT03, CT04, CT06 pela configuração | Orçamento criado sem informar lucro, com a configuração em margem 30%/dezena, markup 30%/dezena e markup 50%/real inteiro: R$ 2.760,00, R$ 2.520,00 e R$ 934,00 |

## Requisitos da spec

| Critério | Verificação | Resultado |
|---|---|---|
| Padrões iniciais: markup 150% (2,50×), duas casas, 10 dias (D024) | Integração | Aprovado |
| RF19–RF21: padrões aplicados ao orçamento novo | Integração + tela | Aprovado |
| RF22: validade em branco = emissão + dias; informada vale mais; anterior à emissão recusada | Integração + tela (15 dias → 16/10/2026) | Aprovado |
| Não retroativo: mudar a configuração não altera orçamento existente | Integração (consulta idêntica antes e depois) | Aprovado |
| Edição de rascunho sem lucro mantém o do orçamento (antes voltava a 150%) | Integração | Aprovado |
| Margem ≥ 100, markup negativo, `1e3`, regra inválida, 0 e 366 dias, dias fracionados recusados | Integração; margem pela função do domínio | Aprovado |
| RF05: dados editáveis, CNPJ com 14 dígitos, contatos no PDF só quando preenchidos | Integração + unidade do conteúdo do PDF + PDF conferido | Aprovado |
| Isolamento: configuração de uma marcenaria não afeta outra | Integração | Aprovado |

## Automático

| Verificação | Resultado |
|---|---|
| `npm run migrar` (teste e principal) | migrações 001–007 aplicadas |
| `backend/npx vitest run` | 13 arquivos, 139 testes aprovados, **três execuções seguidas** |
| `backend/npm run build`; `frontend`: `npm test`, `build`, `lint` | aprovados (13 testes de frontend) |

## Percurso no navegador (Edge, 1280 e 390 px)

Padrões iniciais exibidos com o multiplicador; CNPJ "123" e margem 100% recusados com mensagem; dados e padrões salvos; orçamento novo com validade em branco nasce com margem 30%, dezena e 15 dias e chega a R$ 2.760,00; PDF com CNPJ, telefone e endereço; troca de senha na página nova; seis páginas com 390 px e o menu de cinco itens quebrando linha; sem erro de página.

## Defeitos encontrados e corrigidos

1. Com a suíte inteira rodando em paralelo (e o sistema da autora aberto), o primeiro teste de integração de cada arquivo às vezes passava dos 5 s padrão e falhava ao acaso (7 de 139 numa execução). Causa: cadastro de conta com bcrypt, lento de propósito. Corrigido com `testTimeout` de 20 s em `backend/vitest.config.ts`; três execuções seguidas sem falha. O RNF19 tem teste de tempo próprio, então o limite maior não esconde lentidão real.
2. Botão "Salvar textos" desativado usava cursor de espera e parecia "carregando" (relatado pela autora). Agora mostra "✓ Textos salvos" e o botão só aparece com alteração pendente.
3. Página "Minha marcenaria" ficava sem título quando a configuração não carregava. Corrigido.
4. Editar um rascunho sem informar o lucro o fazia voltar a 150% (defeito latente desde o 003, pelos `default` da validação). Corrigido: campos omitidos mantêm o valor do orçamento.

## Validação manual da autora

A autora informou em 2026-09-28 que finalizou a validação do 007 (dados da marcenaria, padrões, orçamento com validade em branco e PDF). Registro por declaração da autora.

## O que não prova

Ambiente apenas local e apenas Edge.
