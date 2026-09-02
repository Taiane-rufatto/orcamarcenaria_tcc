---
name: verificar-calculo
description: Verifica o cálculo do orçamento do OrçaMarcenaria contra as regras canônicas — confere precisão decimal, ordem das operações, margem versus markup e arredondamento, executa os dez casos de referência e registra a evidência. Use ao alterar qualquer fórmula, valor monetário, arredondamento ou totalizador, e sempre antes de fechar uma spec que toque em preço.
---

# Verificar o cálculo

O critério que aprova ou reprova este TCC é diferença nula entre o cálculo manual de referência e o cálculo do sistema. Toda alteração que toque em valor monetário passa por esta verificação — inclusive as que "não deveriam" mudar nada.

---

## 1. Reler a regra antes de olhar o código

Abrir `documentacao/regras-de-calculo.md` e confirmar qual regra a mudança afeta (RN01 a RN11, RN-C01 a RN-C03). Se a alteração exige mudar a regra, **o documento muda primeiro**, com registro em `documentacao/decisoes.md`. Código que diverge do documento é defeito, mesmo que o resultado pareça correto.

## 2. Inspecionar os pontos onde o cálculo costuma quebrar

Percorrer o diff procurando especificamente:

| Ponto | O que verificar |
|---|---|
| Tipo numérico | Nenhum `Number`, `float` ou `parseFloat` em valor, quantidade ou percentual. Só decimal exato, do banco à resposta |
| Ordem das operações | Arredonda por linha, soma depois; nunca o contrário (RN-C03) |
| Modo de lucro | Margem divide por `(1 − p)`, markup multiplica por `(1 + p)`. Trocar os dois é o erro silencioso mais provável |
| Arredondamento comercial | `real_inteiro` e `dezena` sempre para cima; `duas_casas` meio para cima |
| Conversão de entrada | Vírgula decimal da interface convertida sem passar por ponto flutuante |
| Duplicação | O front-end exibe o que o servidor calculou; não recalcula (RNF08) |
| Congelamento | Item usa o valor copiado no momento da inclusão, não o valor atual do catálogo (RN08) |

## 3. Executar os casos de referência

Rodar a suíte de unidade do domínio e, obrigatoriamente, os dez casos de `documentacao/qualidade-e-testes.md` §3, cujos valores de referência estão em `evidencias/testes/casos-de-teste-referencia.csv`.

Confrontar caso a caso: custo direto total, preço bruto e preço final. Diferença de um centavo é reprovação, não arredondamento aceitável.

Quando um caso falhar:

1. identificar qual regra foi violada, citando o RN;
2. corrigir a implementação — nunca o valor de referência, a menos que a regra documentada esteja errada, e nesse caso ela muda primeiro (etapa 1);
3. reexecutar **todos** os casos, não apenas o que falhou.

## 4. Conferir um caso na mão

Escolher um caso com itens, custo adicional e lucro — o CT03 serve — e refazer a conta na calculadora, seguindo o memorial de cálculo exibido na tela (RF31). O objetivo não é repetir o teste automatizado: é confirmar que o memorial apresentado ao usuário permite chegar ao mesmo número. Memorial que não fecha na mão é defeito de RF31, ainda que o total esteja certo.

## 5. Registrar a evidência

Preencher `evidencias/testes/resultado-casos-de-teste.md` com data, versão ou commit, valores obtidos e situação de cada caso. Registrar também:

- o que a execução prova e o que **não** prova (por exemplo: testado apenas em ambiente local, apenas em Chrome);
- defeitos encontrados, com o que uma revisão de código não teria pegado;
- casos negativos CN01 a CN06 executados.

Evidência sem data e sem versão não serve para a defesa.

---

## Antes de declarar o cálculo verificado

- [ ] regra canônica relida e coerente com a implementação
- [ ] nenhum ponto flutuante binário em qualquer camada
- [ ] ordem arredonda-linha → soma → lucro → arredondamento comercial respeitada
- [ ] margem e markup conferidos separadamente (CT03 e CT04)
- [ ] dez casos executados, todos com diferença R$ 0,00
- [ ] casos negativos CN01–CN06 executados
- [ ] um caso conferido manualmente pelo memorial de cálculo
- [ ] front-end não recalcula preço em nenhum ponto
- [ ] resultado registrado em `evidencias/testes/` com data e versão
- [ ] divergência entre regra e código resolvida no documento antes do código
