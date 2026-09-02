---
name: fechar-spec
description: Fecha uma spec do OrçaMarcenaria — audita cada tarefa contra evidência real, verifica o cálculo quando houver valor envolvido, atualiza a documentação canônica e os documentos de estado, registra decisões e prepara o próximo incremento. Use ao terminar a implementação de um incremento, antes de abrir o seguinte, ou quando pedirem para revisar, auditar ou encerrar uma spec.
---

# Fechar uma spec

Testes verdes não fecham uma spec. Ela fecha quando cada tarefa tem evidência de que entregou o que prometeu, a documentação reflete o que ficou decidido e a próxima sessão consegue continuar sem reconstruir contexto.

Executar as seis etapas na ordem. Nenhuma é opcional.

---

## 1. Auditar tarefa por tarefa

Percorrer a lista de tarefas da spec e, para cada uma, confrontar o que ela prometia com o que foi de fato executado.

| Situação encontrada | O que fazer |
|---|---|
| Implementada, mas nunca exercitada | Executar agora e anexar a saída |
| Verificada por leitura quando a evidência pedia execução | Executar, ou declarar o limite na própria tarefa |
| Evidência inviável no ambiente disponível | Reescrever a tarefa explicando o motivo; **não** marcar como cumprida |
| Cumprida "porque uma tarefa parecida passou" | Não vale. Verificar individualmente |

Suíte verde prova que o conjunto não quebrou; não prova que cada tarefa entregou seu comportamento.

## 2. Verificar o cálculo, se houver valor envolvido

Se a spec tocou em qualquer valor monetário, quantidade, percentual, totalizador ou arredondamento, executar integralmente a rotina de `verificar-calculo` antes de seguir. Isso inclui mudanças indiretas: alteração de esquema, de serialização, de formatação na tela ou de geração de PDF.

Spec que mexeu em preço e não tem execução dos dez casos registrada em `evidencias/testes/` não fecha.

## 3. Verificar isolamento e requisitos

- Se a spec criou consulta a dados, executar os testes de isolamento TI01 a TI04 (`documentacao/qualidade-e-testes.md` §4). Consulta sem filtro por marcenaria é defeito grave, mesmo que nenhum teste funcional acuse.
- Atualizar a matriz de verificação de requisitos (§6 do mesmo documento), marcando o que passou a estar verificado e o que continua pendente.
- Requisito citado na spec que não foi fechado precisa aparecer explicitamente como pendente, com destino: próximo incremento ou fora do escopo.

## 4. Atualizar a documentação canônica

Procurar em `documentacao/` tudo que a implementação contradisse ou detalhou:

- valores, limites e padrões que mudaram;
- nomes de campo, unidades e situações que ficaram diferentes do descrito;
- passos que na prática se mostraram outros;
- riscos que só apareceram executando.

Documentação desatualizada é o defeito mais caro deste projeto: ela é a memória que todas as próximas sessões consultam, e a comparação entre a linha de base e a versão final faz parte da entrega acadêmica.

Registrar em `documentacao/decisoes.md` toda decisão tomada durante a spec, no formato do arquivo: contexto, decisão, consequência e situação. Decisão que mudou um requisito também exige atualizar `documentacao/requisitos.md` e citar o impacto nas specs seguintes. Decisão provisória que a implementação confirmou passa a firme; a que se mostrou errada é substituída, mantendo a original registrada.

## 5. Atualizar os documentos de estado

Os quatro arquivos da raiz descrevem **estado**, não contrato, e envelhecem a cada spec. Percorrer todos e confrontar cada afirmação com a realidade:

| Arquivo | O que revalidar |
|---|---|
| `ESTADO_ATUAL.md` | O que está pronto, o incremento corrente, o próximo passo concreto |
| `BLOQUEIOS.md` | Bloqueios resolvidos saem para o histórico; novos entram dizendo o que destravam |
| `HANDOFF.md` | O que foi feito, o que não foi, achados caros de redescobrir, perguntas para a autora |
| `README.md` | Estrutura e links, se a árvore de diretórios mudou |

Documento de estado errado é pior que ausente: a próxima sessão confia nele e age sobre uma realidade que não existe mais.

Um achado só entra no `HANDOFF.md` se for caro de redescobrir — algo que apareceu executando, não lendo.

## 6. Encerrar e preparar o próximo

- Commit final referenciando a spec e os requisitos fechados.
- Conferir que nenhum segredo, credencial ou dado real de cliente entrou em código, log ou evidência.
- Escrever, em três linhas, o que a autora precisa entender para defender este incremento em banca. Se não for possível escrever isso com clareza, o incremento não está compreendido — e código não compreendido é passivo.
- Abrir o próximo incremento com a rotina `abrir-incremento`, ou parar aqui se houver bloqueio que dependa de decisão humana, ação da autora ou disponibilidade do marceneiro. Nesses casos, registrar em `BLOQUEIOS.md` o que falta, quem resolve e o que aquilo destrava, e seguir por outra frente não bloqueada.

---

## Antes de declarar fechada

- [ ] cada tarefa auditada contra evidência real, sem generalização
- [ ] rotina de verificação do cálculo executada, se houve valor envolvido
- [ ] testes de isolamento executados, se houve consulta a dados
- [ ] matriz de verificação de requisitos atualizada
- [ ] documentação canônica atualizada com o que a implementação mudou
- [ ] decisões registradas em `decisoes.md`, com consequência e situação
- [ ] `ESTADO_ATUAL.md`, `BLOQUEIOS.md`, `HANDOFF.md` e `README.md` revalidados
- [ ] evidências gravadas em `evidencias/` com data e versão
- [ ] nenhum segredo ou dado real de cliente no repositório
- [ ] resumo em três linhas do que a autora precisa saber defender
- [ ] próximo incremento aberto ou bloqueio registrado
