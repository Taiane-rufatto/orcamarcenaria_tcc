# Contexto e Escopo

- **Projeto:** OrçaMarcenaria — SaaS para elaboração de orçamentos em pequenas marcenarias
- **Autora:** Taiane Queirós Rufatto (RA 12419778)
- **Orientador:** Prof. Me. Muriel Mazzetto — Bacharelado em Sistemas de Informação, UNIMATER
- **Documento:** baseline de engenharia, versão 1.0 — derivado da proposta de TCC aprovada
- **Status:** linha de base inicial, sujeita a revisão após a entrevista de levantamento (ver `BLOQUEIOS.md`)

## 1. Problema

Em pequenas marcenarias, o orçamento é elaborado manualmente a partir do levantamento de materiais, mão de obra e demais gastos de cada projeto sob encomenda. Como cada móvel é diferente, o cálculo é refeito do zero a cada pedido, sem padronização das regras, sem registro organizado dos custos utilizados e sem histórico consultável. Isso consome tempo e permite que gastos sejam esquecidos na composição do preço — o que, segundo Faria et al. (2020) e Sebrae (2020), leva à precificação abaixo do custo real.

## 2. Pergunta de pesquisa

Como uma aplicação web pode apoiar a composição, o cálculo e o registro de orçamentos em uma pequena marcenaria, com base em regras previamente definidas para materiais, serviços, custos e margem?

## 3. Objetivo do produto

Permitir que o marceneiro cadastre uma vez seus materiais e serviços com os respectivos custos e, a partir desse catálogo, componha um orçamento selecionando itens e quantidades, obtendo o preço final calculado por regras documentadas, auditáveis e reproduzíveis manualmente.

## 4. Usuários

| Perfil | Descrição | Uso principal |
|---|---|---|
| Marceneiro proprietário | Dono da marcenaria, cadastra-se no sistema, mantém catálogo e emite orçamentos. Usuário único da conta no escopo deste TCC. | Todo o fluxo |
| Cliente da marcenaria | Pessoa que recebe o orçamento. **Não acessa o sistema.** | Recebe o PDF |
| Pesquisadora / banca | Avalia evidências de teste e rastreabilidade. | Documentação e evidências |

## 5. Contexto de uso

Marcenaria de pequeno porte, 1 a 5 pessoas, sem ERP, sem departamento administrativo. O orçamento costuma ser elaborado no escritório ou na oficina, em computador, frequentemente com o cliente presente ou logo após a visita de medição. Conexão de internet pode ser instável — o sistema não pode depender de operações longas nem perder dados de um orçamento em edição.

## 6. Escopo

### 6.1 Dentro do escopo (MVP do TCC)

1. Cadastro e autenticação de conta da marcenaria (multi-tenant simples: uma conta por marcenaria, um usuário por conta).
2. Cadastro de clientes (apenas para identificar a proposta).
3. Cadastro de materiais, com unidade de medida e custo unitário.
4. Cadastro de serviços / mão de obra, com unidade (hora ou unidade) e valor unitário.
5. Configuração da marcenaria: modo de aplicação de lucro (margem ou markup), percentual padrão, regra de arredondamento e prazo de validade padrão.
6. Composição do orçamento: seleção de itens de material e de serviço, quantidades, custos adicionais de valor fixo, percentual de lucro do orçamento.
7. Cálculo do orçamento conforme `regras-de-calculo.md`, com totais parciais e preço final.
8. Registro, listagem, consulta e edição de orçamentos, com situação (rascunho, enviado, aprovado, recusado, vencido) e validade.
9. Geração do orçamento em PDF para entrega ao cliente.
10. Evidências de validação: casos de teste funcionais dos cálculos e roteiro de avaliação exploratória de uso.

### 6.2 Fora do escopo (declarado na proposta)

Controle de estoque; compras e pedidos a fornecedores; contas a pagar/receber; emissão de documentos fiscais (NF-e/NFS-e); processamento de pagamentos; operação de um usuário sobre múltiplas empresas; painel gerencial e relatórios analíticos; ordem de produção e cronograma de obra; portal de acesso para o cliente; aplicativo móvel nativo.

### 6.3 Fora do escopo do MVP, registrado como evolução futura

Cálculo de aproveitamento de chapa (plano de corte); múltiplos usuários e papéis por marcenaria; duplicação/versionamento de orçamento; upload de imagens do projeto; envio automático por e-mail ou WhatsApp; importação de tabela de preços de fornecedor; tributos e regime tributário.

> A distinção entre 6.2 e 6.3 é intencional: 6.2 delimita a pesquisa perante a banca; 6.3 alimenta a seção de trabalhos futuros da monografia e o roadmap pós-TCC.

## 7. Premissas

- **P1** — O proprietário da marcenaria familiar está disponível para a entrevista de levantamento e para a avaliação exploratória de uso.
- **P2** — Os custos de materiais e serviços são informados pelo próprio marceneiro; o sistema não consulta preços de fornecedores.
- **P3** — O ambiente de desenvolvimento e demonstração é local; a hospedagem em VPS é complementar e não condiciona a comprovação de funcionamento.
- **P4** — Todos os dados reais usados como referência serão anonimizados; a base de demonstração usa dados fictícios.

## 8. Restrições

- **R1** — Prazo: implementação entre outubro e novembro de 2026 (cronograma da proposta), com defesa em novembro.
- **R2** — Equipe de uma pessoa, sem orçamento financeiro: apenas ferramentas gratuitas ou com plano gratuito.
- **R3** — Navegadores-alvo: Google Chrome e Mozilla Firefox, versões atuais.
- **R4** — O cálculo precisa ser reproduzível manualmente por terceiros (exigência metodológica da validação).
- **R5** — Desenvolvimento assistido por IA conduzido pela metodologia incremental do orientador: documentação versionada, ciclo por Spec, validação humana e rastreabilidade.

## 9. Critérios de sucesso do TCC

| # | Critério | Como será medido |
|---|---|---|
| S1 | Fluxo completo executável | Do cadastro de material ao registro do orçamento, sem intervenção manual em banco |
| S2 | Cálculo correto | 10/10 casos de teste com diferença nula após arredondamento (`qualidade-e-testes.md`) |
| S3 | Aderência aos requisitos | 100% dos RF de prioridade "Essencial" implementados e verificados |
| S4 | Uso pelo profissional | Roteiro de 5 tarefas concluído pelo proprietário, com registro de erros e dúvidas |
| S5 | Rastreabilidade | Histórico Git, Specs, testes e decisões permitindo reconstruir como cada requisito virou código |

## 10. Glossário do domínio

| Termo | Significado neste projeto |
|---|---|
| Orçamento | Documento que reúne itens, quantidades e valores para um projeto de móvel, com preço final e validade |
| Item de orçamento | Linha do orçamento referente a um material ou a um serviço, com quantidade e valor unitário congelados |
| Custo adicional | Gasto de valor fixo lançado direto no orçamento (frete, deslocamento, ferragens diversas) |
| Custo direto total | Soma de materiais, serviços e custos adicionais, antes do lucro |
| Margem de lucro | Percentual calculado **sobre o preço de venda** (divisor) |
| Markup | Multiplicador aplicado **sobre o custo** |
| Preço final | Valor apresentado ao cliente, após aplicação do lucro e do arredondamento |
| Catálogo | Conjunto de materiais e serviços cadastrados pela marcenaria |
| Marcenaria (tenant) | Conta isolada no SaaS; nenhum dado atravessa contas |

## 11. Fontes deste documento

- `fontes/PROPOSTA_TCC_Taiane.docx` — proposta aprovada (fonte canônica de escopo, objetivos e método)
- `fontes/Ata_Segunda_Orientacao_Coletiva_TCCs.docx` — orientações do professor sobre documentação e desenvolvimento
- `fontes/Metodologia_Incremental_Desenvolvimento_Assistido_por_IA.docx` — metodologia de desenvolvimento adotada

> Regra: divergência entre este baseline e a proposta deve ser resolvida explicitamente em `decisoes.md`, nunca em silêncio.
