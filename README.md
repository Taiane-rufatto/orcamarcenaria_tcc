# OrçaMarcenaria

Aplicação web (SaaS) para elaboração de orçamentos em pequenas marcenarias.

Trabalho de Conclusão de Curso — Bacharelado em Sistemas de Informação, Centro Universitário Mater Dei (UNIMATER), Pato Branco/PR, 2026.
Autora: Taiane Queirós Rufatto · Orientador: Prof. Me. Muriel Mazzetto

## O problema

Em marcenarias de pequeno porte, o orçamento é feito manualmente a cada pedido: levantam-se materiais, mão de obra e demais gastos sem padronização de regras nem registro organizado. Isso consome tempo e permite que custos fiquem de fora do preço.

## O que o sistema faz

O marceneiro cadastra uma vez seus materiais e serviços com os respectivos custos. A partir desse catálogo, compõe o orçamento selecionando itens e quantidades, lança custos adicionais, aplica seu percentual de lucro e obtém o preço final calculado por regras documentadas — com memorial de cálculo conferível na mão e PDF para entregar ao cliente.

## Estado

Baseline de engenharia concluída; desenvolvimento ainda não iniciado. Ver `ESTADO_ATUAL.md`.

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [documentacao/contexto-e-escopo.md](documentacao/contexto-e-escopo.md) | Problema, usuários, escopo, premissas, restrições e critérios de sucesso |
| [documentacao/requisitos.md](documentacao/requisitos.md) | RF01–RF43 e RNF01–RNF26, com rastreabilidade aos objetivos da proposta |
| [documentacao/historias-de-usuario.md](documentacao/historias-de-usuario.md) | US01–US16 com critérios de aceitação |
| [documentacao/regras-de-calculo.md](documentacao/regras-de-calculo.md) | RN01–RN11, precisão decimal e exemplo completo de conferência manual |
| [documentacao/arquitetura.md](documentacao/arquitetura.md) | Diagramas C4, modelo de dados, multi-tenant e riscos |
| [documentacao/qualidade-e-testes.md](documentacao/qualidade-e-testes.md) | Estratégia de testes, os 10 casos de validação e a matriz de verificação |
| [documentacao/roadmap.md](documentacao/roadmap.md) | Marcos, 11 incrementos e calendário até a defesa |
| [documentacao/decisoes.md](documentacao/decisoes.md) | Decisões (D001–D008) e questões em aberto |
| [documentacao/roteiro-entrevista.md](documentacao/roteiro-entrevista.md) | Roteiro da entrevista de levantamento (OE1) |

## Governança do trabalho com IA

O desenvolvimento segue a metodologia incremental assistida por IA orientada na disciplina: documentação versionada como memória do projeto, ciclo por Spec, validação humana e rastreabilidade.

| Arquivo | Papel |
|---|---|
| [AGENTS.md](AGENTS.md) | Regras que todo agente deve seguir neste repositório |
| [ESTADO_ATUAL.md](ESTADO_ATUAL.md) | O que está pronto e qual o próximo passo |
| [HANDOFF.md](HANDOFF.md) | Como uma nova sessão assume o trabalho |
| [BLOQUEIOS.md](BLOQUEIOS.md) | O que depende de decisão humana |

Rotinas reutilizáveis (skills), escritas para este projeto:

| Skill | Quando usar |
|---|---|
| [abrir-incremento](.claude/skills/abrir-incremento/SKILL.md) | Ao iniciar um incremento do roadmap |
| [verificar-calculo](.claude/skills/verificar-calculo/SKILL.md) | Sempre que a mudança tocar em valores |
| [fechar-spec](.claude/skills/fechar-spec/SKILL.md) | Ao encerrar um incremento |

## Estrutura

```
.
├── documentacao/       # contexto durável do projeto (fonte de verdade)
│   └── fontes/         # proposta, ata e metodologia originais (.docx)
├── specs/              # uma pasta por incremento (criada pelo fluxo do Spec Kit)
├── backend/            # API Node.js + TypeScript; concentra o cálculo
│   └── src/dominio/    # regras RN01–RN11 — implementação única e testável
├── frontend/           # React + TypeScript (Vite); exibe, não calcula
├── evidencias/         # testes, entrevista e avaliação de uso
├── .claude/skills/     # rotinas do projeto para o agente de IA
└── .vscode/            # configuração compartilhada do editor
```

Cada pasta principal tem um README explicando o que vai — e o que não vai — dentro dela.

## Stack

Node.js + TypeScript (backend), React + TypeScript com Vite (frontend), PostgreSQL. Decisão registrada em D007. Bibliotecas específicas são escolhidas no incremento que as exigir.

## Como começar (para a autora)

1. Criar o repositório no GitHub e commitar esta documentação **antes de qualquer código** — ela é a linha de base a ser comparada ao final do projeto.
2. Abrir a pasta no VS Code e instalar as extensões recomendadas (o editor sugere ao abrir).
3. Realizar a entrevista com o roteiro e responder Q1–Q10 em `decisoes.md`.
4. Instalar o Spec Kit (D008) e inicializar os projetos `backend/` e `frontend/` — incremento 000.
5. Abrir a Spec 001 com a rotina `abrir-incremento` e rodar o primeiro ciclo completo.

## Referências da proposta

BOF, G. C. et al. *Proposta de planejamento e controle da produção em uma marcenaria: um estudo de caso.* Aracruz: FAACZ, 2019.
SEBRAE. *Guia prático de precificação para os pequenos negócios.* Salvador: Sebrae/BA, 2020.
FARIA, L. S. et al. *Análise de custos em uma empresa de pré-moldados da região do Alto Paranaíba.* Ponta Grossa: APREPRO, 2020.
AGUIAR, H. H. D. *SAMP: um sistema de apoio a fábricas do segmento de móveis planejados.* Cornélio Procópio: UTFPR, 2015.
SCHENKEL, I. G. *Classificação dos custos em uma indústria de móveis: um estudo de caso em uma empresa de móveis planejados.* Lages: UNIFACVEST, 2023.
