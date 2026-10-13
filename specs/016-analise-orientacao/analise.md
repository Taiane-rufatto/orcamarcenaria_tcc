# Análise das orientações de 08/10/2026

**Spec:** 016 · **Data:** 2026-10-13 · **Status:** proposta do agente, **aguardando validação da autora** (marcar a coluna "Autora").
Fonte: ata e transcrição da reunião com o professor Muriel Mazzetto (guardadas só no computador da autora).

## Regra de leitura

A ata deixa claro que tudo abaixo é **hipótese a avaliar**, não escopo aprovado. O professor disse que o diferencial pode **começar** no TCC I e continuar no TCC II, sem exigir controle financeiro completo, e pediu para não inflar. A recomendação segue isso: poucos incrementos pequenos, cada um demonstrável, sem tocar no cálculo.

Prazo: defesa em novembro/2026. Faltam cerca de três a quatro semanas, com a última reservada para imprevistos e para a redação.

## Recomendação em uma frase

Fazer agora: o **diagnóstico de segurança** e, em seguida, **o diferencial em versão enxuta** (meta mensal e horas disponíveis, aviso no orçamento quando o valor por hora fica abaixo do necessário, e painel do mês com taxa de conversão). Depois os **ajustes de uso**, o **CPF/CNPJ** e, se sobrar prazo, **fornecedor com histórico de preço** e **duplicar**. Deixar para o TCC II: relatórios completos, estados de produção, lista de compras e integrações.

> **Decisão da autora (2026-10-13):** o diferencial (ponto de equilíbrio, S7) entra no TCC I, com as horas vindo de um **campo no orçamento** e escopo de **aviso no orçamento + painel do mês**.

## Análise por sugestão

Tamanho: P = menos de um dia, M = um a dois dias, G = mais de dois dias.

| # | Sugestão | Requisito | Tam. | Mexe no cálculo? | Recomendação | Autora |
|---|---|---|---|---|---|---|
| S1 | CPF/CNPJ no cliente | RF08 | P | Não | **Agora** (020). Campo opcional; só nome continua obrigatório. Validar dígitos; sair no PDF só se a autora quiser | |
| S2 | Texto de apoio na descrição do serviço (quando incluir montagem, acabamento) | RF17 | P | Não | **Agora** (020). Só texto de ajuda e exemplo no campo; sem regra de preço | |
| S3 | Fornecedor vinculado ao material | RF11 | M | Não | **Agora, se houver prazo** (021), na forma mínima que o professor chamou de "pelo menos isso": saber de quem vem o preço. Um cadastro simples de fornecedor (nome, telefone) e o material aponta para um | |
| S4 | Histórico de atualização de custo (data, valor, fornecedor) | **RF16, hoje pós-TCC** | M | Não: o orçamento já guarda o valor da época (RN08) | **Agora, se houver prazo** (021). Promover o RF16; registrar a decisão em `decisoes.md` | |
| S5 | Alerta de preço antigo | S4 | P | Não | **Agora, se houver prazo** (021), com um prazo fixo configurável (padrão 30 dias). Os prazos da conversa eram só exemplos | |
| S6 | Lista interna de compras por fornecedor | RF41 | M | Não | **TCC II.** Depende do S3 estar em uso. O PDF do cliente continua sem custo (RF42) | |
| S7 | Ponto de equilíbrio e alerta de orçamento abaixo do necessário | novo | G | Não altera o preço; só compara. A conta fica no domínio (decimal.js) | **Agora (018 e 019), versão enxuta.** Entradas novas: meta mensal e horas disponíveis (configuração) e horas estimadas (campo opcional no orçamento). Saída: aviso se o valor por hora está abaixo do necessário e painel do mês. **Decisão da autora** | **Aceito** |
| S8 | Relatórios (variação de preço, materiais frequentes) | S4 | M a G | Não | **TCC II**, salvo o painel do mês (019). Com o S4 gravando histórico, os dados começam a se acumular | |
| S9 | Estados "em produção" e "entregue" | RF34–RF39, D020 | M | Não | **TCC II.** Mexe nas situações e na RN09. **Já agora:** conversão com as situações existentes, dentro do painel do mês (019) | |
| S10 | Duplicar orçamento | **RF40, pós-TCC** | M | Não: recalcula pelo mesmo domínio (D019) | **Agora, se sobrar prazo** (022). O desenho já está em `roadmap.md` §5.1. É o que de fato resolve o "não posso editar depois de enviar" | |
| S11 | Separar "registrar" de "enviar" | D020, RN09 | M | Não | **Manter como está.** Com a duplicação (S10) o problema prático some, e rever a D020 é caro. Registrar a justificativa | |
| S12 | Descrição do arredondamento mais clara | RF21 | P | Não, só texto | **Agora** (020). Mostrar exemplo ao lado de cada opção (R$ 2,50 → R$ 3,00; dezena → R$ 10,00) | |
| S13 | Forma de pagamento | — | — | — | **Manter em observação.** O pai disse que basta; um módulo financeiro foge do escopo | |
| S14 | Busca de orçamento por número | RF37 | P | Não | **Agora** (020) | |
| S15 | Logo no PDF | RF05, RF41 | M | Não | **TCC II.** Exige upload e armazenamento de arquivo | |
| S16 | Busca de preço por API do Google | — | G | Não | **Descartar para o TCC I.** Nome da API, limite e aderência não foram verificados | |
| S17 | Cotação por WhatsApp | — | M | Não | **TCC II**, depende do S3 | |
| — | Mensagem de quantidade negativa | achado do 008 | P | Não | **Agora** (020) | |
| — | Diagnóstico de segurança (login e dados) | RNF11–RNF15 | M | Não | **Primeiro de tudo** (017), só diagnóstico, sem corrigir | |

## Plano proposto, em ordem

| # | Incremento | Itens | Tamanho | Observação |
|---|---|---|---|---|
| 017 | Diagnóstico de segurança | — | M | Só relatório e lista de pontos de atenção, como pediu o professor. A autora decide depois quais corrigir. Rodar com o modelo mais capaz disponível |
| 018 | **Meta mensal e aviso de equilíbrio no orçamento** (diferencial, parte 1) | S7 | G | Configuração: meta mensal e horas disponíveis. Orçamento: campo opcional "horas estimadas". Ao montar o orçamento, mostrar o valor por hora e avisar se está abaixo do necessário para a meta. A conta mora no domínio, com decimal.js e casos de teste conferidos à mão |
| 019 | **Painel do mês** (diferencial, parte 2) | S7, S8 e S9 (partes) | M | Aprovado no mês contra a meta; orçamentos enviados, aprovados, recusados e vencidos; taxa de conversão. Só com as situações que já existem |
| 020 | Ajustes de uso e cadastro | S1, S2, S12, S14, mensagem de quantidade | M no total | Cinco melhorias pequenas, uma migração (CPF/CNPJ) |
| 021 | Fornecedor e histórico de preço do material | S3, S4, S5 | M a G | Só se houver prazo. Promove o RF16 |
| 022 | Duplicar orçamento | S10 | M | Só se sobrar prazo |

Cada um segue o mesmo ciclo dos anteriores: spec curta, testes, evidência em `evidencias/testes/`, revisão do diff e PR. A suíte de cálculo (CT01–CT10) roda em todos, para provar que nada mudou.

### Como o diferencial funciona (versão enxuta, a detalhar na spec 018)

1. **Entradas.** Em "Minha marcenaria": quanto a marcenaria precisa que sobre por mês e quantas horas produtivas tem por mês. No orçamento: horas estimadas (opcional).
2. **Conta.** Valor necessário por hora = meta ÷ horas disponíveis. Valor do orçamento por hora = parte do preço que sobra para a marcenaria ÷ horas estimadas. Se o segundo for menor que o primeiro, aparece o aviso. Sem horas informadas, o aviso não aparece (nada é inventado).
3. **Regra de ouro.** O preço do orçamento **não muda**: o indicador só compara e avisa. Assim o critério central do TCC (cálculo conferido nos dez casos) fica protegido.
4. **A definir na spec 018 com a autora:** qual parte do preço entra na comparação (lucro, ou preço menos materiais), já que o professor falou em "pagar o material e ainda manter a meta". O valor de R$ 20 mil da conversa era só um exemplo.
5. **Validar com o professor** que essa leitura simplificada do ponto de equilíbrio atende ao que ele chamou de "visão de saúde do negócio".

## O que fica para o TCC II (e como apresentar)

Relatórios completos (S8), estados de produção e entrega (S9), lista de compras (S6), logo (S15), WhatsApp (S17). Do ponto de equilíbrio (S7) fica para o TCC II o que passar da versão enxuta: custos operacionais detalhados, várias metas e projeções. Na apresentação do TCC I eles aparecem como **proposta de continuidade**, nunca como função pronta (ata §10).

O 018 e o 019 já mostram o diferencial funcionando com dados reais; o texto explica que o TCC II o aprofunda.

## Riscos

- **Tempo.** Seis incrementos em três a quatro semanas, mais a redação. Cortar na ordem inversa: 022, 021, 020. O 018 e o 019 são a prioridade, junto com o 017.
- **Diferencial inflado.** O ponto de equilíbrio pode virar um módulo financeiro. Limite fixo: uma meta mensal, horas disponíveis e horas por orçamento; nada de contas a pagar, fluxo de caixa ou previsão.
- **Inflar o escopo.** Fornecedor e histórico podem virar um ERP. Limite fixo: fornecedor com nome e telefone; histórico só de custo unitário; nada de estoque, pedido ou comparação entre vários fornecedores.
- **Dados do pai.** O valor da meta e das horas é dele (ou fictício na demonstração); o prazo do alerta e quem é fornecedor de quê, no 021, também vêm da conversa com ele. Construir a forma mínima e ajustar depois; não esperar.
- **Cálculo.** Nenhum item altera `backend/src/dominio/orcamento/`. O 019 muda o custo do catálogo, mas os itens já registrados guardam o valor da época (RN08).

## Decisões da autora

Marcar na coluna "Autora" da tabela (aceito, adiado, descartado) e confirmar:
1. Esta ordem (017 a 022) e este corte. *(Diferencial no TCC I: aceito em 2026-10-13.)*
2. O CPF/CNPJ sai no PDF do cliente? (S1)
3. Prazo padrão do alerta de preço antigo: 30 dias serve? (S5)
4. Qual parte do preço entra na comparação com a meta (item 4 do diferencial)? Decidir na spec 018.

Só depois disso `requisitos.md`, `roadmap.md` e `decisoes.md` são atualizados (D033 em diante).
