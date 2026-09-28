# Spec 007 — Configurações da marcenaria

**Branch:** `spec/007-configuracoes`
**Data:** 2026-09-28
**Status:** implementada e verificada em 2026-09-28; fechamento pendente da revisão do diff pela autora (B17)

## Clarificações

### Sessão 2026-09-28

- Q: Qual o prazo de validade padrão (Q6)? → A: 10 dias (D024).
- Q: Onde ficam as configurações? → A: página "Minha marcenaria", que recebe também o "Alterar senha" (D024).
- Q: A configuração altera orçamentos existentes? → A: não; vale só para orçamentos novos (arquitetura §5.2.3, D024).

## Capacidade entregável

1. **Entrega:** na página "Minha marcenaria", o marceneiro edita os dados da empresa (nome, responsável, telefone, e-mail, CNPJ e endereço), que passam a sair no PDF, e define os padrões do orçamento: forma de lucro, percentual, arredondamento e validade em dias. Cada orçamento novo já nasce com esses padrões e com a validade preenchida.
2. **Fica de fora:** logotipo no PDF; vários usuários ou papéis (pós-TCC); aplicar a nova configuração a orçamentos já criados.
3. **Demonstração:** configurar margem 30% e arredondamento à dezena, criar um orçamento com os itens do exemplo §4 sem mexer no lucro e obter R$ 2.760,00; o PDF mostra o telefone e o CNPJ da marcenaria; um orçamento criado antes continua com os valores dele.

## Requisitos e critérios verificáveis

| Requisito | Critério | Verificação |
|---|---|---|
| RF05 | Dados da marcenaria editáveis; nome e responsável obrigatórios; CNPJ opcional com 14 dígitos; aparecem no PDF quando preenchidos | Integração + unidade do conteúdo do PDF |
| RF19 | Forma de lucro padrão (margem ou markup) | Integração |
| RF20 | Percentual padrão aplicado ao orçamento novo; margem ≥ 100 recusada pela regra do domínio | Integração |
| RF21 | Arredondamento padrão aplicado ao orçamento novo | Integração |
| RF22 | Validade padrão em dias (1 a 365); "Válido até" em branco = emissão + dias | Integração |
| Padrões iniciais | Conta nova começa com markup 150%, sem arredondamento e 10 dias | Integração |
| Não retroativo | Mudar a configuração não altera orçamento existente | Integração |
| CT03, CT04, CT06 | Reproduzidos pela API partindo só da configuração (sem informar lucro no orçamento) | Integração |
| Isolamento | A configuração de uma marcenaria não afeta outra | Integração |

## Regras e restrições

- RN05–RN07 sem mudança. A validação da margem reutiliza a função do domínio (D024).
- `marcenaria_id` vem apenas da sessão.

## Evidências previstas

Integração, regressão dos dez casos, percurso de tela (incluindo 390 px com o quinto item do menu) e validação manual em `evidencias/testes/007-configuracoes-AAAA-MM-DD.md`.

## Perguntas em aberto

- Nenhuma.
