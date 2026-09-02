# Specs

Uma pasta por incremento do roadmap, criada **no momento em que o incremento entra no ciclo** — não antes. Pastas vazias antecipadas só produzem ruído.

## Convenção de nome

```
specs/NNN-nome-curto/
```

`NNN` é o número do incremento em `documentacao/roadmap.md` §2 e `nome-curto` descreve a capacidade entregue, não a tecnologia. Exemplos alinhados ao roadmap:

```
specs/001-conta-e-acesso/
specs/002-catalogo/
specs/003-composicao-e-calculo/
```

A branch de trabalho segue o mesmo nome: `spec/001-conta-e-acesso`.

## Conteúdo de cada spec

Gerado pelo fluxo do Spec Kit (Specify → Clarify → Plan → Tasks → Analyze → Implement):

| Arquivo | Papel |
|---|---|
| `spec.md` | O que será entregue, limites, critérios de aceitação |
| `plan.md` | Como será feito: componentes, riscos, estratégia de teste |
| `tasks.md` | Tarefas pequenas e verificáveis, cada uma com sua evidência |

## Regras

1. Toda spec cita histórias (US) e requisitos (RF/RNF) por ID. Requisito tocado e não fechado aparece como pendente, com destino.
2. Regras de cálculo são **referenciadas**, nunca reescritas com variação local — a fonte é `documentacao/regras-de-calculo.md`.
3. Todo critério de aceitação declara como se verifica.
4. Abrir uma spec: rotina `abrir-incremento`. Fechar: rotina `fechar-spec`. Ambas em `.claude/skills/`.
5. Uma spec só fecha cumprindo a Definição de Pronto (`documentacao/qualidade-e-testes.md` §7).
