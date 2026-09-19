# Roadmap

Versão 1.0 · Organiza a evolução do produto em **marcos** e, dentro deles, em **incrementos**. Cada incremento é uma capacidade entregável e gera uma Spec (`specs/NNN-nome/`), conforme a metodologia incremental adotada.

Regra: nenhuma funcionalidade nova é implementada direto no chat. Ela entra primeiro aqui, é agrupada em uma capacidade e só então vira Spec.

## 1. Marcos

| Marco | Objetivo | Janela |
|---|---|---|
| M0 — Preparação | Baseline documental, repositório, governança e entrevista de levantamento | Setembro/2026 |
| M1 — Fundação | Conta, acesso e catálogo utilizáveis | Início de outubro/2026 |
| M2 — Núcleo do orçamento | Composição, cálculo, registro e clientes — o coração do TCC | Outubro/2026 |
| M3 — Entrega e validação | PDF, configurações, testes formais e avaliação de uso | Novembro/2026 |
| M4 — Fechamento acadêmico | Consolidação de evidências, documentação final e defesa | Novembro/2026 |

## 2. Incrementos

Prioridade e dependência definem a ordem. Um incremento só é aberto quando o anterior está fechado conforme a Definição de Pronto (`qualidade-e-testes.md` §7).

| # | Incremento (capacidade entregável) | Marco | Depende de | Histórias | Requisitos principais |
|---|---|---|---|---|---|
| 000 | Baseline e ambiente: repositório, documentação, governança, escolha da stack e projeto vazio executável | M0 | — | — | RNF20, RNF23 |
| 001 | Conta e acesso isolados: cadastro de marcenaria, login, logout, troca de senha, isolamento multi-tenant | M1 | 000 | US01, US02 | RF01–RF04, RF06, RNF11–RNF13 |
| 002 | Catálogo de materiais e serviços: cadastro, listagem, busca, edição e inativação | M1 | 001 | US03, US04, US05 | RF11–RF13, RF15, RF17–RF18 |
| 003 | Composição e cálculo do orçamento: itens, custos adicionais, lucro, memorial de cálculo | M2 | 002 | US07, US08, US09, US10, US11 | RF14, RF23–RF31, RN01–RN11 |
| 004 | Registro e acompanhamento: número, situações, validade, listagem e consulta | M2 | 003 | US12, US13 | RF32, RF34–RF39 |
| 005 | Clientes: cadastro, busca, inativação e vínculo com o orçamento | M2 | 001 | US06 | RF08–RF10 |
| 006 | Orçamento em PDF para o cliente | M3 | 004 | US14 | RF41–RF43, RNF19 |
| 007 | Configurações da marcenaria: dados da empresa, modo de lucro, percentual padrão, arredondamento e validade | M3 | 003 | — | RF05, RF19–RF22 |
| 008 | Validação formal do cálculo: suíte automatizada e execução dos 10 casos com registro de evidências | M3 | 006, 007 | US15 | RNF06, RNF21 |
| 009 | Avaliação exploratória de uso com o proprietário | M3 | 008 | US16 | RNF01, OE7 |
| 010 | Fechamento: matriz de verificação, documentação final comparada à linha de base, evidências organizadas | M4 | 009 | — | OE8, RNF22 |

### Observações de sequenciamento

- **003 antes de 005** é proposital: o cálculo é o risco central do TCC e precisa ser atacado cedo, com cliente provisório fixo se necessário. Cadastro de cliente é trabalho conhecido e de baixo risco.
- **007 depois de 003**: o cálculo já nasce lendo configuração, mas o incremento 003 pode usar valores padrão fixos (margem, arredondamento) até que a tela de configuração exista.
- **008 depois de 006 e 007**: os casos de teste formais exigem o sistema completo, inclusive arredondamentos configuráveis.

## 3. Calendário pretendido

Baseado no cronograma da proposta (implementação em outubro e novembro, defesa em novembro de 2026).

| Período | Foco | Entregável verificável |
|---|---|---|
| 1ª quinzena de setembro | Incremento 000 + entrevista de levantamento (OE1) | Repositório com baseline versionado; notas da entrevista; requisitos revisados |
| 2ª quinzena de setembro | Fechamento da stack; Spec 001 executada | Login funcionando com isolamento testado |
| 1ª quinzena de outubro | Incrementos 002 e 003 | Catálogo + cálculo com memorial conferível |
| 2ª quinzena de outubro | Incrementos 004 e 005 | Orçamento registrado, listado e vinculado a cliente |
| 1ª quinzena de novembro | Incrementos 006 e 007 | PDF entregável e configurações |
| 2ª quinzena de novembro | Incrementos 008, 009 e 010 | Evidências de teste, avaliação de uso e documentação final |
| Ao longo de todo o período | Fundamentação teórica e redação da monografia | Capítulos em progresso |

**Folga deliberada:** o calendário reserva a última semana para imprevistos. Se houver atraso, os primeiros itens a sair são RF26 (itens avulsos), RF42 (opção de PDF resumido) e RF36 (vencimento automático), nessa ordem — nenhum deles compromete o critério central de validação.

## 4. Marcos acadêmicos vinculados

| Evento | Quando | O que precisa estar pronto |
|---|---|---|
| Apresentação do andamento | Novembro/2026 | Incrementos 001–005 fechados; cálculo demonstrável |
| Defesa do TCC | Novembro/2026 | Todos os incrementos; evidências dos 10 casos; avaliação de uso; documentação final comparada à linha de base |

## 5. Evolução pós-TCC (não implementar agora)

Registrado para a seção de trabalhos futuros e para dar destino às ideias que surgirem durante o desenvolvimento, sem contaminar o escopo:

- Duplicação e versionamento de orçamento (RF40)
- Desconto comercial no fechamento (RF33)
- Múltiplos usuários e papéis por marcenaria
- Histórico de variação de custo dos materiais (RF16)
- Cálculo de aproveitamento de chapa / plano de corte
- Rateio de custos indiretos por hora produtiva
- Envio do orçamento por e-mail ou link
- Recuperação de senha (RF07)
- Painel com indicadores de aprovação e ticket médio

> Toda ideia nova recebida durante o desenvolvimento vai para esta lista **primeiro**. Se for essencial ao TCC, é promovida a incremento com registro em `decisoes.md`; caso contrário, permanece aqui.
