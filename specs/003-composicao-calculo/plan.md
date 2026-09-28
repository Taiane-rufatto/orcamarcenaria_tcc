# Plano — Composição e cálculo do orçamento

## Resumo

Criar o módulo de cálculo puro em `backend/src/dominio/orcamento/` (RN-C01–RN07), provado pelos dez casos de referência lidos direto de `evidencias/testes/casos-de-teste-referencia.csv`. Sobre ele, persistir orçamentos em rascunho com itens e custos adicionais, e expor uma API em que **cada alteração devolve o orçamento já recalculado pelo domínio**. A tela React só envia a alteração e exibe o memorial devolvido.

## Contexto técnico

- Node.js/TypeScript, Express, `pg`, Zod e `decimal.js`; React/TypeScript/Vite. Nenhuma dependência nova.
- `NUMERIC` chega como texto (`pool.ts`), entra no domínio como texto, é calculado em `Decimal` e sai como texto com 2 casas. Nada passa por `Number`.
- Testes Vitest: unidade do domínio (sem banco) e integração no `orcamarcenaria_teste`.

## Verificação da constitution

- **Cálculo:** implementação única no domínio; fórmulas referenciadas de `regras-de-calculo.md`, sem variação local. O multiplicador da D018 é derivado no domínio, não no frontend.
- **Isolamento:** orçamento, itens e itens do catálogo sempre filtrados pelo `marcenaria_id` da sessão (TI01–TI03 parcial, D011).
- **Integridade:** valores do catálogo copiados para o item (RN08); nenhum cadastro é excluído.
- **Evidência:** CT01–CT10 automatizados, integração, rotina `verificar-calculo` e validação manual.

## Desenho

### Domínio (`backend/src/dominio/orcamento/calculo.ts`)

Uma função pura:

```text
calcularOrcamento({ itens: [{ tipo, quantidade, valorUnitario }], custosAdicionais: [valor],
                    modoLucro, percentualLucro, regraArredondamento })
→ { valoresLinha[], subtotalMateriais, subtotalServicos, totalAdicionais, custoDiretoTotal,
    precoBruto, valorLucro, ajusteArredondamento, precoFinal, multiplicadorEquivalente | null }
```

Segue a sequência de `regras-de-calculo.md` §2 passo a passo, com o nome de cada passo, para que o código leia como o memorial. Validações da RN10 que protegem o cálculo (quantidade > 0, valor unitário ≥ 0, adicional > 0, margem < 100, markup ≥ 0) geram `ErroCalculo` com mensagem em português; a API o traduz para 400.

### Dados (`backend/migracoes/003-orcamento.sql`)

Tabelas `orcamento`, `orcamento_item` e `orcamento_custo_adicional` conforme `arquitetura.md` §5.1, com dois ajustes do 003:

- `cliente_nome TEXT` no lugar de `cliente_id` (D018); o 005 adiciona o vínculo.
- `numero` fica nulo e `situacao` só aceita `rascunho`; o 004 introduz numeração e situações.

O multiplicador não é gravado: é derivado do percentual.

### API (autenticada)

| Método e rota | Efeito |
|---|---|
| `POST /orcamentos` | Cria rascunho (cliente, descrição, datas; lucro e arredondamento com padrão markup 150,00% e `duas_casas`) |
| `GET /orcamentos/:id` | Orçamento com itens, adicionais e cálculo |
| `PUT /orcamentos/:id` | Altera cabeçalho, modo, percentual e arredondamento (RF30) |
| `POST /orcamentos/:id/itens` | Adiciona item do catálogo (copia valores) ou avulso |
| `PUT /orcamentos/:id/itens/:itemId` | Altera quantidade e/ou valor unitário (marca ajuste manual) |
| `DELETE /orcamentos/:id/itens/:itemId` | Remove o item da composição |
| `POST`, `PUT`, `DELETE /orcamentos/:id/custos-adicionais[/:custoId]` | Idem para custos adicionais |

Toda escrita roda em transação: altera a composição, chama o domínio uma vez, grava os totais e devolve o orçamento completo. Isso substitui o `POST /orcamentos/{id}/calcular` desenhado em `arquitetura.md` §8 pelo mesmo fluxo embutido em cada alteração (D019): um único caminho de cálculo e totais gravados sempre coerentes com os itens.

### Frontend

- `frontend/src/servicos/orcamentos.ts`: chamadas HTTP.
- `frontend/src/paginas/NovoOrcamento.tsx` e `Orcamento.tsx`: formulário do cabeçalho, itens (catálogo ou avulso), custos adicionais, lucro e memorial na ordem de `regras-de-calculo.md` §5. Reaproveita as classes de `index.css` (D014).
- Sem listagem de orçamentos (004): após criar, a tela abre `/orcamentos/:id`.

## Sequência

1. Domínio + CT01–CT10 + casos negativos + multiplicador (fatia verificável sem banco).
2. Migração e repositório.
3. API com integração, RF14 e isolamento.
4. Telas.
5. Evidências, `verificar-calculo` e fechamento.

## Riscos

| Risco | Mitigação |
|---|---|
| Arredondamento implícito do `Decimal` em divisão (margem) | Precisão alta configurada no clone do `Decimal`; arredondamento só nos passos que a regra manda |
| Tela exibir valor calculado localmente | Revisão do diff e busca por operações aritméticas em `frontend/` |
| Rascunho sem listagem ficar "perdido" | Aceito até o 004; o endereço `/orcamentos/:id` pode ser reaberto |
