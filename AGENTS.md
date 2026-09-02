# AGENTS.md — Regras operacionais para agentes de IA

Este arquivo é lido **antes de qualquer trabalho** neste repositório. Mantenha-o curto: histórico e justificativas vão para os documentos próprios, não para cá.

## 1. Projeto

OrçaMarcenaria — aplicação web SaaS para elaboração de orçamentos em pequenas marcenarias. É o TCC de Taiane Queirós Rufatto (Sistemas de Informação, UNIMATER, 2026), orientado pelo Prof. Me. Muriel Mazzetto. O trabalho será defendido em banca: **rastreabilidade e compreensão humana do que foi feito valem mais do que velocidade de entrega.**

## 2. Fontes de verdade

Ordem de precedência em caso de conflito:

1. `documentacao/fontes/` — proposta aprovada, ata de orientação e metodologia (originais, não editar)
2. `documentacao/requisitos.md` e `documentacao/regras-de-calculo.md`
3. `documentacao/arquitetura.md`, `historias-de-usuario.md`, `qualidade-e-testes.md`, `roadmap.md`
4. `documentacao/decisoes.md` — resolve divergências; sempre datado
5. Código

Divergência entre fontes **não se resolve em silêncio**: registre em `decisoes.md` (ou em `BLOQUEIOS.md`, se depender de decisão humana) e pergunte.

## 3. Antes de começar qualquer tarefa

1. Ler `ESTADO_ATUAL.md`, `BLOQUEIOS.md` e a Spec corrente em `specs/`.
2. Confirmar a qual incremento do `roadmap.md` a tarefa pertence. Não existe trabalho fora de incremento.
3. Se a tarefa não estiver coberta por uma Spec, **pare e proponha** abrir uma — não implemente direto.

## 4. Regras invioláveis do cálculo

1. As regras de cálculo vivem em **um único módulo de domínio no servidor** (`backend/src/dominio/orcamento/`). Nenhuma outra camada recalcula preço — o `frontend/` apenas exibe o que a API devolveu.
2. Proibido ponto flutuante binário (`float`, `double`, `Number`) em valor monetário, quantidade ou percentual. Somente decimal exato.
3. Alterar qualquer fórmula exige: atualizar `regras-de-calculo.md`, registrar em `decisoes.md` e reexecutar os 10 casos de `qualidade-e-testes.md`.
4. O memorial de cálculo (RF31) precisa continuar reproduzível na mão. Otimização que torne o cálculo opaco é regressão.

## 5. Regras invioláveis de dados

1. Toda consulta a dados de negócio filtra por `marcenaria_id` obtido **da sessão**, nunca de parâmetro enviado pelo cliente.
2. Não há exclusão física: cadastros são inativados.
3. Nenhum dado real de cliente, valor comercial ou proposta identificável entra no repositório. Fixtures e exemplos usam dados fictícios.
4. Segredos e credenciais ficam em variáveis de ambiente; `.env` nunca é versionado.

## 6. Ciclo de trabalho

Motor: **Spec Kit** (ver D008). Para cada incremento: Specify → Clarify → Plan → Tasks → Analyze → Implement → Testes → Fechamento.

Rotinas do projeto em `.claude/skills/` — use-as, não improvise substituto:

| Skill | Quando |
|---|---|
| `abrir-incremento` | Ao começar um incremento do roadmap |
| `verificar-calculo` | Sempre que a mudança tocar em valor, quantidade, percentual, totalizador ou arredondamento |
| `fechar-spec` | Ao terminar a implementação, antes de abrir o próximo incremento |

- Uma branch por incremento: `spec/NNN-nome-curto`.
- Commits em português, referenciando a Spec e o requisito: `feat(003): calcula subtotal de materiais (RF29, RN01)`.
- Nunca fechar uma Spec sem cumprir a Definição de Pronto (`qualidade-e-testes.md` §7).

## 7. Como se comportar

- **Pergunte antes de assumir.** Ambiguidade de requisito vira pergunta ou item em `BLOQUEIOS.md`, não uma escolha silenciosa.
- **Escopo é limite rígido.** Ideia nova vai para `roadmap.md` §5, não para o código. O prazo do TCC é dezembro-limite e não há folga para escopo extra.
- **Entregue pouco e verificável.** Prefira uma fatia completa e testada a várias pela metade.
- **Explique o que fez.** Ao final de cada tarefa: o que mudou, por quê, o que foi testado e o que ficou pendente. A autora precisa ser capaz de defender cada linha em banca — código que ela não entende é passivo, não entrega.
- **Não gere volume desnecessário.** Nada de arquivos, abstrações, camadas ou testes decorativos que ninguém pediu.
- **Não invente fontes acadêmicas.** Referências bibliográficas só entram se verificadas pela autora.

## 8. Idioma e convenções

- Documentação, interface, mensagens de erro e commits em **português do Brasil**.
- Nomes de domínio em português (`orcamento`, `material`, `servico`, `custo_adicional`); termos técnicos consagrados podem ficar em inglês.
- Formato monetário exibido: `R$ 1.234,56`. Entrada aceita vírgula decimal.

## 9. Ao encerrar a sessão

Atualizar `ESTADO_ATUAL.md`, `HANDOFF.md` e `BLOQUEIOS.md`. Se algo aprendido deve valer para as próximas sessões, registrar no documento correto — não neste arquivo, salvo se for regra operacional permanente.
