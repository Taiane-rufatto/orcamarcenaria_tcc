# Pesquisa técnica

**Decisão:** persistir custo e valor como `NUMERIC(12,4)` e trafegá-los como texto na API.

**Motivo:** preserva as quatro casas exigidas e evita ponto flutuante binário; `decimal.js` será usado nas validações de domínio quando necessário.

**Alternativa rejeitada:** `REAL`/`DOUBLE PRECISION`, por perda de precisão monetária.
