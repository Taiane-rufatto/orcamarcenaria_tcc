# Spec 016 — Análise das orientações de 08/10/2026

**Branch:** `spec/016-analise-orientacao`
**Data:** 2026-10-13
**Status:** aberta. **Spec de análise: não altera código, requisitos nem roadmap.** Produz uma proposta que a autora valida e reordena antes de qualquer incorporação.

## Contexto

Em 2026-10-08 a autora teve a reunião de orientação com o professor Muriel Mazzetto. O registro é a ata `2026-10-08 - Ata - Orientação de TCC - Taiane.pdf` e a transcrição TXT (guardar em `evidencias/orientacao/`). A própria ata fixa o método (§10): primeiro uma especificação de **análise** do que cabe no planejamento; depois a **validação humana** (a autora retira e reordena); só então a incorporação. Hipóteses de indicadores, fornecedores e integrações **continuam hipóteses** até serem selecionadas.

Estado de partida: incrementos 000–008 e 011–015 integrados em `main`; 009 aguarda o termo de consentimento (B06); 010 é o fechamento. Segundo a ata, a autora não vê funcionalidade pendente no planejamento atual.

## Histórias e requisitos

Nenhuma história nova é escrita aqui. A análise cruza as orientações com US e RF existentes (ver tabela) e aponta onde falta história ou requisito, sem criá-los.

## Capacidade entregável

1. **Entrega:** um documento de análise (`analise.md`, nesta pasta) com, para cada sugestão da ata: o que é, o problema do marceneiro que resolve, a que requisito existente se liga, tamanho estimado, dependências, conflito com decisões já tomadas e uma **recomendação** (agora / TCC II / descartar / perguntar ao pai). Fecha com um plano proposto, em ordem, para a autora validar.
2. **Fica de fora:** implementar qualquer sugestão; editar `requisitos.md`, `roadmap.md` ou `decisoes.md`; criar histórias; decidir pela autora. A **revisão de segurança** é outra spec (diagnóstico, 017), não faz parte desta.
3. **Demonstração:** `analise.md` revisado pela autora, com cada item marcado por ela (aceito, adiado, descartado) e a ordem final; só então os documentos canônicos são atualizados num passo posterior, registrado em `decisoes.md`.

## Sugestões da ata a analisar

Todas são **hipóteses a avaliar**, nunca escopo aprovado (ata §1 e §7).

| # | Sugestão (ata) | Liga-se a | Observação inicial |
|---|---|---|---|
| S1 | CPF ou CNPJ no cadastro de cliente (§4) | RF08, US06 | Pequeno. Cuidado com o limite "não virar CRM". Decidir se sai no PDF |
| S2 | Descrição do serviço com orientação de quando incluir (montagem, acabamento) (§4) | RF17 | O campo de descrição já existe; talvez seja só texto de apoio |
| S3 | Cadastro simples de fornecedor, vinculado ao material e ao preço cotado (§7) | RF11, RF16 | Novo cadastro e nova tabela. Depende de ouvir o pai |
| S4 | Histórico de atualização de custo: data, valor, fornecedor (§7) | **RF16 (hoje pós-TCC)** | Conflita com `roadmap.md` §5; promover exige registro em `decisoes.md` |
| S5 | Alerta de preço antigo, com confirmar ou atualizar (§7) | S4 | Regra de prazo indefinida (duas semanas e um mês eram só exemplos) |
| S6 | Duas saídas: orçamento do cliente e lista interna de compras por fornecedor (§7) | RF41, S3 | Mexer no PDF segue a regra do domínio de conteúdo (`montarConteudoPdf`); a lista interna **pode** mostrar custo, o PDF do cliente não (RF42) |
| S7 | Visão simplificada de ponto de equilíbrio e alerta de orçamento abaixo do necessário (§6) | RN, configuração | Maior risco: exige custo operacional, meta mensal e horas disponíveis, dados que o sistema não tem. É o "diferencial" proposto |
| S8 | Relatórios: variação de preço, materiais frequentes, cobrança dos serviços (§7) | S4, S7 | Depende de S4 |
| S9 | Estados "em produção" e "entregue" e taxa de conversão (§7) | RF34–RF39, D020 | Mexe nas situações do orçamento (RN09) e no 004 |
| S10 | Duplicar orçamento (§5) | **RF40 (pós-TCC, §5.1 do roadmap já detalhado)** | Já tem desenho escolhido; é a opção "duplicar para ajustar" |
| S11 | Separar "registrar" de "enviar" (§5) | D020, RN09 | Já em "Para ver no futuro" (`ESTADO_ATUAL.md`); exige rever D020 |
| S12 | Descrição do arredondamento mais clara (§5) | RF21 | Texto de tela; não toca no cálculo |
| S13 | Forma de pagamento: área própria ou observação em texto (§5) | — | Hoje é observação; o pai diz que basta. Recomendação inicial: manter |
| S14 | Busca de orçamento por número e outros filtros (§5) | RF37 | Pequeno |
| S15 | Logo da marcenaria no PDF (§5) | RF05, RF41 | Opcional |
| S16 | Busca externa de preços por API do Google (§7) | — | **Não verificado:** nome da API, limite gratuito e aderência. Só exploratório |
| S17 | Envio de cotação por WhatsApp (§7) | — | Idem; depende de S3 |

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| Toda sugestão da ata aparece em `analise.md`, sem omitir nenhuma da tabela acima | Conferência item a item contra a ata (§4–§7) |
| Cada item traz requisito de origem, dependências, tamanho e recomendação | Leitura do documento |
| Itens que contradizem decisão ou lista pós-TCC (S4, S10, S11) citam a decisão e o que muda | Conferência com `decisoes.md` e `roadmap.md` §5 |
| Nenhum valor ou prazo da ata é tratado como dado do projeto (R$ 20 mil, MDF R$ 300, duas semanas, 10 mil requisições) | Leitura: aparecem como exemplos ilustrativos |
| Cálculo, banco e telas intactos | `git diff main` desta branch só toca `specs/016-*`, `evidencias/orientacao/` e, no fechamento, `ESTADO_ATUAL.md`/`HANDOFF.md`/`BLOQUEIOS.md` |
| A autora marcou cada item e fixou a ordem | Tabela de decisão preenchida por ela em `analise.md` |

## Regras e restrições

- Preço continua calculado só em `backend/src/dominio/orcamento/` (AGENTS.md). Qualquer item que crie indicador financeiro (S7, S8) deve dizer **de onde vêm os números** e não duplicar conta de preço fora do domínio.
- Nada entra no roadmap sem a validação da autora e uma entrada em `decisoes.md`.
- A autora precisa entender e defender cada item. Cada recomendação vem justificada em português simples.
- Apresentar à banca só o que está funcional e verificado; hipótese aparece como continuidade (ata §10).

## Evidências

- `evidencias/orientacao/` com o PDF da ata e a transcrição (a autora coloca os arquivos; o agente não os reproduz).
- `specs/016-analise-orientacao/analise.md` com a proposta e as decisões da autora.

## Fora do escopo

Implementar qualquer sugestão; spec de segurança (017); entrevista com o pai e coleta com outras marcenarias; bibliografia (Sebrae e outros); plano de negócio, assinatura, preço do software.

## Perguntas em aberto

1. **Formato do TCC I em novembro:** só apresentação ou também documento? O Muriel ficou de confirmar com o professor Anderson. Não assumir "só PowerPoint".
2. **Termo de consentimento (B06):** resolvido em 2026-10-13: a autora decidiu não enviar o termo. O 009 não depende mais dele; falta registrar a justificativa e rever o RNF16.
3. **Data da apresentação (B07)** e da próxima orientação: não definidas.
4. **Perguntas para o pai (marceneiro):** como cobra serviço, quanto tempo leva, se compraria de mais de um fornecedor, se faria sentido guardar preço por fornecedor. As respostas decidem S3–S8.
5. **Qual é o diferencial do TCC II:** indicadores (S7) ou fornecedores e histórico (S3–S5)? A autora escolhe depois de ouvir o pai.
