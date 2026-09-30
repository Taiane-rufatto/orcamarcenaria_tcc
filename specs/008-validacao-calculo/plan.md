# Plano — Validação formal do cálculo

## Desenho

Nenhum código de produção muda. O incremento produz execução e evidência.

| Parte | Arquivo | Conteúdo |
|---|---|---|
| Roteiro | `evidencias/testes/008-roteiro-casos-pela-tela.md` | para cada caso: forma de lucro, percentual, arredondamento, itens avulsos (tipo, descrição, quantidade e valor com vírgula), custos adicionais e os valores esperados no memorial; espaço para anotar o obtido |
| Ensaio | script fora do repositório (Playwright + Edge) | cria uma conta de ensaio com dados fictícios, lança os dez casos pelo roteiro, lê custo direto, lucro, ajuste e preço final do memorial e tenta CN01–CN06 |
| Execução formal | a autora, na própria tela | segue o roteiro e anota os valores |
| Registro | `resultado-casos-de-teste.md`, `008-validacao-calculo-AAAA-MM-DD.md`, matriz §6 | execução nº 6 (formal) |

## Riscos

| Risco | Mitigação |
|---|---|
| Erro de digitação da autora parecer defeito do sistema | Anotar também custo direto e lucro; divergência é conferida contra o roteiro antes de virar defeito |
| Ensaio confundido com a execução formal | D025: o ensaio é registrado como evidência complementar |
| Conta de ensaio misturada aos dados da autora | Conta própria de ensaio; isolamento por marcenaria (RNF12) |
