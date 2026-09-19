# Modelo de dados

## Material

`id`, `marcenaria_id`, `nome`, `descricao?` (até 300), `unidade`, `custo_unitario NUMERIC(12,4)`, `ativo`, datas. Único por (`marcenaria_id`, `nome`).

## Serviço

`id`, `marcenaria_id`, `nome`, `descricao?` (até 300), `tipo_cobranca` (`hora` ou `unidade`), `valor_unitario NUMERIC(12,4)`, `ativo`, datas. Único por (`marcenaria_id`, `nome`).

Ambos pertencem a uma marcenaria, nunca são excluídos fisicamente e são filtrados pelo contexto da sessão.
