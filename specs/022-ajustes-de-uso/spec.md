# Spec 022 — Ajustes de uso

**Branch:** `spec/018-equilibrio-no-orcamento` (mesma branch, a pedido da autora)
**Data:** 2026-10-18
**Status:** implementada e verificada por testes automatizados em 2026-10-18 (D036). **Falta o percurso de tela pela autora.** A migração `012` ainda não foi aplicada na VPS.
Origem: orientação de 08/10/2026 (ata §3, §4, §5 e §9), itens S1, S2, S12 e S14 da análise da spec 016, e o achado do 008 sobre quantidade negativa.

## Contexto

O professor apontou melhorias pequenas e concretas, que estavam atrás das funcionalidades maiores: CPF ou CNPJ no cliente (com o cuidado de não virar CRM), descrição mais clara do arredondamento, busca de orçamento por número e explicar na apresentação que o cadastro aberto é para teste.

## Histórias e requisitos

US20; RF54 a RF57; regras RN16 e RN17 em `regras-de-calculo.md` §6.2; decisão D036.

## O que muda

1. **CPF ou CNPJ no cliente (RF54, RN16).** Campo opcional; aceita com ou sem pontuação; recusa dígito verificador errado e sequência repetida com "CPF ou CNPJ inválido: confira os números"; guarda só os dígitos; aparece formatado na lista. **Não sai no PDF** por enquanto (decisão da autora pode mudar). Não é único.
2. **Busca por número (RF55, RN17).** "2", "#2" e "nº 2" acham o orçamento 2, além do nome do cliente.
3. **Textos (RF56).** Arredondamento com exemplo: "Para cima, ao real: R$ 2.758,71 vira R$ 2.759,00"; "Para cima, à dezena: R$ 2.758,71 vira R$ 2.760,00"; mais o aviso de que ele só sobe o preço. Quantidade: "A quantidade não pode ser negativa" (antes dizia "até 3 casas decimais").
4. **Acesso de teste (RF57).** A tela de criar conta avisa que é demonstração e pede dados fictícios.

## Capacidade entregável

1. **Entrega:** os quatro itens acima, com migração `012` (coluna `documento`).
2. **Fica de fora:** CPF/CNPJ no PDF; consulta à Receita; forma de pagamento como módulo e separar registrar de enviar (mantidos, D020); duplicar orçamento (RF40, spec 023, se houver prazo); logo no PDF.
3. **Demonstração:** cadastrar um cliente com `529.982.247-25` e ver `529.982.247-25` na lista; tentar `529.982.247-26` e ver o erro; buscar `#2` na lista de orçamentos; abrir as opções de arredondamento e ver os exemplos; incluir quantidade `-1` e ver a mensagem nova.

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| CPF e CNPJ válidos aceitos (com e sem pontuação); inválidos, repetidos e de tamanho errado recusados | `backend/tests/unidade/documento.test.ts` (13) |
| Documento opcional, guardado só com dígitos, editável, limpável, não único; erro 400 com a mensagem | `backend/tests/integracao/ajustes-de-uso.test.ts` |
| Busca por "2", "#2", "nº 2", "N° 2" e "no 2"; nome continua; número também presente no nome traz os dois; isolamento entre marcenarias | mesmo arquivo |
| Mensagens de quantidade (negativa, zero, casas demais, letras) | mesmo arquivo |
| Exibição formatada do CPF e do CNPJ | `frontend/src/servicos/clientes.test.ts` |
| Cálculo e preço inalterados | Suíte do backend inteira (CT01–CT10) |
| Migração `012` idempotente | `npm run migrar` repetido no banco local e no de teste |
| Telas (cliente, lista de orçamentos, arredondamento, criar conta) e RNF05 | Percurso de tela (pendente) |

## Evidências

`evidencias/testes/021-022-seguranca-e-ajustes-de-uso-2026-10-18.md`.

## Perguntas em aberto

O CPF/CNPJ deve sair no PDF do orçamento (o professor falou em "orçamento profissional")? Hoje não sai.
