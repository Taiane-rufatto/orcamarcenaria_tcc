# Evidências

Tudo que comprova o que o sistema faz. É o material citado na monografia e apresentado na defesa — por isso cada arquivo precisa de **data, versão ou commit e quem executou**.

## Organização

| Pasta | Conteúdo |
|---|---|
| `testes/` | Casos de referência do cálculo, resultados de cada execução e defeitos encontrados |
| `entrevista/` | Notas da entrevista de levantamento, já anonimizadas (`entrevista-AAAA-MM-DD.md`) |
| `avaliacao-de-uso/` | Registro do roteiro de tarefas com o proprietário, questionário e observações |

## Arquivos já prontos

- `testes/casos-de-teste-referencia.csv` — os dez casos com valores de referência calculados pelas regras canônicas, para conferência em planilha antes da execução no sistema.
- `testes/resultado-casos-de-teste.md` — formulário a preencher a cada execução.

## Regras

1. **Nenhum dado real de cliente** (RNF15): nomes, valores comerciais e propostas identificáveis são substituídos por dados fictícios já na anotação, não depois.
2. Evidência é registro do que aconteceu — inclusive do que falhou. Caso reprovado permanece registrado, com a correção e a data da reexecução.
3. Declarar os limites: o que a execução prova e o que não prova (ambiente local, um único navegador, um único participante).
4. Nada de captura de tela contendo senha, token ou conteúdo de `.env`.
