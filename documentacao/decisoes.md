# Decisões e Questões em Aberto

Registro cronológico das decisões de projeto (ADR simplificado) e das dúvidas que ainda dependem de resposta humana. Regra da metodologia: **divergência entre fontes não se resolve em silêncio** — decide-se aqui e atualiza-se a fonte canônica.

Formato: contexto → decisão → consequência → situação (`provisória` enquanto depender de confirmação, `firme` quando validada).

---

## D001 — Multi-tenant simples, um usuário por marcenaria
**Data:** 2026-09-02 · **Situação:** firme

**Contexto.** A proposta define o produto como SaaS, mas exclui do escopo "a operação com múltiplas empresas". As duas afirmações parecem conflitar.

**Decisão.** Interpretar assim: o sistema é multi-tenant — qualquer marcenaria cria sua conta e seus dados ficam isolados —, porém **um usuário pertence a uma única marcenaria** e não há troca de empresa dentro da sessão. É isso que a proposta exclui.

**Consequência.** Preserva a identidade SaaS para a banca sem ampliar o escopo. Gera RF04, RNF12 e os testes TI01–TI04. Papéis e equipes ficam como evolução futura.

---

## D002 — Margem e markup como modos explícitos e excludentes
**Data:** 2026-09-02 · **Situação:** provisória (confirmar na entrevista — Q1)

**Contexto.** A proposta cita "margem de lucro ou markup" sem definir qual das duas fórmulas o sistema aplica. São contas diferentes: com 30% sobre custo de R$ 1.931,10, margem dá R$ 2.758,71 e markup dá R$ 2.510,43.

**Decisão.** Implementar os dois modos, exigir escolha explícita na configuração (RF19) e exibir o rótulo do modo no memorial de cálculo. Padrão inicial: margem sobre o preço de venda, alinhado à definição do Sebrae (2020).

**Consequência.** A confusão entre os conceitos — apontada na justificativa da proposta como causa de prejuízo — vira um ponto de discussão da monografia em vez de um detalhe implícito. Custa um campo de configuração e dois casos de teste (CT03 e CT04).

---

## D003 — Arredondamento comercial sempre para cima
**Data:** 2026-09-02 · **Situação:** provisória (confirmar na entrevista — Q5)

**Contexto.** A proposta exige "critério de arredondamento" definido, mas não o especifica.

**Decisão.** Arredondamento de linha e de preço bruto: meio para cima, 2 casas. Arredondamento comercial do preço final: configurável entre duas casas, real inteiro e dezena — nas duas últimas, sempre **para cima**.

**Consequência.** O preço final nunca fica abaixo do valor exigido pela margem pretendida. A diferença aparece no memorial como "ajuste de arredondamento", mantendo o cálculo conferível manualmente.

---

## D004 — Valores congelados no item do orçamento
**Data:** 2026-09-02 · **Situação:** firme

**Contexto.** Se o item apenas referenciasse o material, reajustar um custo alteraria retroativamente orçamentos entregues ao cliente.

**Decisão.** Copiar descrição, unidade e valor unitário para o item no momento da inclusão (RN08); guardar também os totais no orçamento registrado.

**Consequência.** Um orçamento consultado meses depois reproduz exatamente o valor apresentado ao cliente — condição para a rastreabilidade exigida na validação.

---

## D005 — Cálculo apenas no servidor, em decimal exato
**Data:** 2026-09-02 · **Situação:** firme

**Contexto.** Duplicar a fórmula no front-end para "resposta instantânea" é comum e é justamente como surgem divergências de centavos entre tela, PDF e teste.

**Decisão.** Uma única implementação, no módulo de domínio do servidor, em tipo decimal exato. A interface apenas envia a composição e exibe o retorno. Proibido ponto flutuante binário em qualquer camada (RNF07, RNF08).

**Consequência.** Elimina a principal causa provável de reprovação no critério de diferença nula. Custo: uma chamada de rede a cada alteração de item.

---

## D006 — Custos adicionais recebem lucro
**Data:** 2026-09-02 · **Situação:** provisória (confirmar na entrevista — Q4)

**Contexto.** Frete e deslocamento podem ser repassados a custo ou entrar na base de lucro.

**Decisão.** Entram no custo direto total e, portanto, recebem lucro (RN04).

**Consequência.** Simplifica a fórmula e o memorial. Se o marceneiro repassar frete sem lucro na prática, será necessário um campo "não aplicar lucro" no custo adicional — mudança pequena, mas que exige nova Spec.

---

## D007 — Stack: Node.js + TypeScript, React + TypeScript, PostgreSQL, em projetos separados
**Data:** 2026-09-02 · **Situação:** firme

**Contexto.** A ata orienta a manter abertura técnica na proposta, mas a estrutura de pastas precisa ser criada para o desenvolvimento começar. A proposta já indicava React, Node.js e PostgreSQL como direção.

**Decisão.** Confirmar essa direção e organizar o repositório em `backend/` e `frontend/` separados, com o domínio de cálculo isolado em `backend/src/dominio/orcamento/`.

**Alternativa rejeitada.** Projeto único full-stack (Next.js ou Express com templates): menos configuração, porém a fronteira entre domínio e interface fica menos evidente — e é justamente essa fronteira que garante o cálculo em lugar único (RNF08) e sustenta a argumentação na banca.

**Consequência.** Duas instalações de dependências e dois processos em desenvolvimento. Em troca, o domínio é testável isoladamente com os dez casos de referência, sem banco nem navegador. Bibliotecas específicas (PDF, validação, acesso a banco, framework de teste) continuam abertas e são decididas no incremento que as exigir.

---

## D008 — Spec Kit como motor do ciclo
**Data:** 2026-09-02 · **Situação:** provisória — confirmar no incremento 000

**Contexto.** A ata apresenta Spec Kit e BMad Method como alternativas e recomenda escolher **uma** que a autora consiga operar com controle.

**Decisão.** Adotar Spec Kit, por estruturar explicitamente a passagem requisito → plano → tarefas → implementação, o que produz a rastreabilidade exigida na defesa.

**Consequência.** O ciclo Specify → Clarify → Plan → Tasks → Analyze → Implement passa a ser o procedimento padrão de cada incremento. Se a ferramenta se mostrar pesada para um projeto deste porte, a alternativa registrada é executar o mesmo ciclo manualmente com os templates em `specs/`.

---

## D009 — Skills próprias do projeto em `.claude/skills/`
**Data:** 2026-09-02 · **Situação:** firme

**Contexto.** A ata recomenda transformar procedimentos recorrentes em skills, mas apenas depois de compreendê-los, e alerta que skills vindas de outros projetos devem ser reescritas para não trazer instruções, nomes ou decisões alheias ao repositório.

**Decisão.** Criar três skills escritas especificamente para este projeto: `abrir-incremento`, `verificar-calculo` e `fechar-spec`. Nenhum conteúdo foi reaproveitado de skills de outros projetos — apenas a ideia de formato (frontmatter, etapas numeradas e lista de conferência final).

**Consequência.** Os três procedimentos que mais se repetem no TCC ficam padronizados e citáveis na monografia como parte do método. As skills devem ser revisadas ao fim do primeiro ciclo completo: procedimento que não se mostrar útil na prática é ajustado ou removido, não mantido por inércia.

---

## D010 — Bibliotecas e módulo do backend inicial
**Data:** 2026-09-18 · **Situação:** firme

**Contexto.** O incremento 000 precisava tornar executável a arquitetura aprovada em D007, preservando uma fronteira explícita entre HTTP, banco e o futuro domínio de cálculo.

**Decisão.** Usar Express para a API HTTP, `pg` para PostgreSQL, `decimal.js` para operações decimais exatas, Vitest para os testes e CommonJS como formato de módulos do backend. O `tsconfig` usa a resolução `node16`, compatível com TypeScript 7, enquanto o `type: "commonjs"` do pacote preserva a saída CommonJS. `tsx` executa TypeScript no desenvolvimento, sem introduzir uma etapa manual de compilação.

**Consequência.** A rota `/saude` verifica conjuntamente API e banco; valores `NUMERIC` do PostgreSQL permanecem texto na fronteira de infraestrutura até serem tratados pelo domínio em decimal exato. Os futuros cálculos continuam proibidos de usar `Number`.

---

## Questões em aberto (entrevista de levantamento — OE1)

Enquanto não respondidas, valem as decisões provisórias acima. Espelhadas em `BLOQUEIOS.md`.

| # | Pergunta | Impacto se a resposta for diferente do assumido |
|---|---|---|
| Q1 | Você calcula o lucro sobre o custo ou sobre o valor que o cliente paga? Qual percentual usa hoje? | Muda o padrão de D002 |
| Q2 | Como estima a mão de obra: por hora, por peça, por metro de móvel ou como percentual do material? | Pode exigir novo tipo de cobrança em `servico` (RF17) |
| Q3 | Material comprado em chapa e usado pela metade: cobra a chapa inteira ou só a parte usada? A sobra é aproveitada? | Pode antecipar o cálculo por aproveitamento, hoje fora do MVP |
| Q4 | Frete, deslocamento e instalação entram no preço com lucro ou são repassados a custo? | Muda D006 |
| Q5 | Costuma arredondar o preço final? Para real inteiro, dezena ou não arredonda? | Define o padrão de D003 |
| Q6 | Qual o prazo de validade que costuma dar ao orçamento? O que faz quando vence? | Ajusta RF22 e RN09 |
| Q7 | O que o cliente vê hoje: lista de itens com valores ou só o total? | Define o padrão de RF42 |
| Q8 | Quantos orçamentos faz por mês e quanto tempo leva em cada um? | Base de comparação para a observação de uso (RNF01) |
| Q9 | Já perdeu dinheiro por esquecer algum custo? Qual? | Evidência qualitativa forte para a justificativa da monografia |
| Q10 | Usa o computador na oficina ou apenas no escritório? Em qual tela? | Confirma ou revisa RNF05 |
