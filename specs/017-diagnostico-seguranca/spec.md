# Spec 017 — Diagnóstico de segurança

**Branch:** `spec/016-analise-orientacao` (ainda sem branch própria)
**Data:** 2026-10-13
**Status:** diagnóstico feito (leitura do código e da configuração). **Nenhuma correção aplicada**, como pediu o orientador (ata §8): primeiro diagnosticar, depois a autora escolhe o que corrigir.

## Contexto

Em 08/10/2026 o professor Muriel orientou abrir uma especificação de diagnóstico, com atenção ao **login** e ao **armazenamento dos dados**, separada do desenvolvimento habitual. A ata diz que isso não é uma auditoria já realizada e não comprova que o sistema é seguro; este documento também não comprova.

## Capacidade entregável

1. **Entrega:** `diagnostico.md`, com os achados classificados por gravidade, a evidência de cada um, o que não foi possível verificar e uma proposta de correção em ordem.
2. **Fica de fora:** corrigir qualquer achado; teste de invasão; auditoria da VPS por dentro (sem acesso nesta sessão); revisão jurídica da LGPD.
3. **Demonstração:** a autora lê o diagnóstico, marca o que corrigir agora e o que aceitar como risco; os escolhidos viram um incremento próprio.

## Método e limites

- Leitura estática do backend (`servidor.ts`, autenticação, sessões, recuperação de senha, repositórios, validações), do frontend (guarda do token), da configuração de implantação (nginx, systemd, `atualizar.sh`) e do histórico do Git.
- `npm audit` no backend e no frontend.
- Requisições de leitura ao site publicado (cabeçalhos, redirecionamento, CORS, rota `/saude`), sem tentativa de ataque e sem insistência.
- **Limite:** revisão feita pelo assistente da sessão, sem teste dinâmico de invasão. O professor sugeriu rodar o diagnóstico com um modelo mais capaz, em sessão separada; vale repetir a leitura assim para comparar com este resultado.

## Critérios verificáveis

| Critério | Verificação |
|---|---|
| Cada achado tem gravidade, onde está no código, impacto e correção sugerida | Leitura de `diagnostico.md` |
| O que não foi verificado aparece listado, não omitido | Seção "Não verificado" |
| O sistema não foi alterado | `git diff` desta spec só toca `specs/017-*` |
| Os pontos positivos também são registrados | Seção "O que já está bem" |

## Perguntas em aberto

1. Quais achados a autora quer corrigir antes da apresentação? (proposta no fim do diagnóstico)
2. Alguém com acesso à VPS pode conferir a lista "Não verificado"?
