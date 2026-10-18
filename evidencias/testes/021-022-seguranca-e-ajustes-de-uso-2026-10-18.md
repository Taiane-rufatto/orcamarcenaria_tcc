# Evidência — Incrementos 021 (Endurecimento de segurança) e 022 (Ajustes de uso)

**Data:** 2026-10-18 · **Specs:** `specs/021-endurecimento-de-seguranca/spec.md` e `specs/022-ajustes-de-uso/spec.md` · **Decisões:** D037 e D036 · **Requisitos:** RNF27, RF54–RF57, US20, RN16, RN17

> **Situação:** implementados e verificados por testes automatizados. **Pendentes (dependem da autora):** percurso de tela e, na VPS, aplicar cabeçalhos do nginx, restrições do systemd e as migrações `010`, `011` e `012`. Por isso os incrementos ainda **não estão fechados**.

## Resultado dos testes automatizados

| Verificação | Resultado |
|---|---|
| Suíte do backend inteira | **25 arquivos, 255 testes passam**, incluindo os dez casos de cálculo (CT01–CT10) |
| `calculo.ts` (regra do preço) | sem alteração |
| Suíte do frontend | **6 arquivos, 24 testes passam**; lint e build limpos |
| `npm audit` (backend e frontend) | 0 vulnerabilidades (antes, 1 crítica no backend) |
| Migração `012` | aplicada no banco local e no de teste, repetida sem erro |

## 021 — Endurecimento de segurança

| Achado | Resultado | Como |
|---|---|---|
| A1 Limite de tentativas | passa | `tests/unidade/limite-de-tentativas.test.ts` (4) e `tests/integracao/limite-de-tentativas.test.ts`: 11ª tentativa de login dá 429 com `Retry-After`; outro e-mail segue livre; 11ª conta do mesmo endereço dá 429 |
| A5 Tempo do login | implementado | comparação com hash falso; o teste verifica que e-mail inexistente e senha errada têm a mesma resposta (o tempo em si não é medido) |
| A6 `/saude` | passa | só `api`, `banco` e `horaDoBanco` |
| A7 `JWT_SECRET` | passa | `tests/unidade/ambiente-segredo.test.ts`: recusa curto, 31 caracteres e o texto do exemplo; aceita 32 |
| A2 Dependência | passa | `npm audit fix` |
| A3 Cabeçalhos e A11 systemd | **modelo pronto, não aplicado na VPS** | `implantacao/nginx-orcamarcenaria.conf`, `implantacao/orcamarcenaria-api.service`, `documentacao/publicacao.md` |

**Antes de atualizar a VPS:** conferir que o `JWT_SECRET` do `.env` tem 32 caracteres ou mais; senão a API não sobe.

## 022 — Ajustes de uso

| Critério | Resultado | Como |
|---|---|---|
| CPF e CNPJ: válidos aceitos, inválidos recusados (dígito, repetido, tamanho, letras) | passa | `tests/unidade/documento.test.ts` (13), com os exemplos públicos 529.982.247-25 e 11.222.333/0001-81 |
| Documento opcional, só dígitos, editável, limpável, não único; 400 com mensagem clara | passa | `tests/integracao/ajustes-de-uso.test.ts` |
| Busca por "2", "#2", "nº 2", "N° 2", "no 2"; nome continua; número que também está no nome traz os dois; isolamento | passa | mesmo arquivo |
| Quantidade: "-1" e "-0,5" dizem que não pode ser negativa; "0" pede maior que zero; "1,5555" e "abc" mostram o formato | passa | mesmo arquivo |
| Exibição formatada do CPF e do CNPJ | passa | `src/servicos/clientes.test.ts` |

## Pendente: percurso de tela (a autora executa)

1. **Criar conta:** abrir `/cadastro` e ver o aviso "Acesso de demonstração, aberto para testes…".
2. **Clientes:** cadastrar com CPF `529.982.247-25`; ver o número formatado na lista; tentar `529.982.247-26` e ver o erro; editar e limpar.
3. **Orçamentos:** buscar por `2`, `#2` e `nº 2`; buscar por parte do nome.
4. **Arredondamento:** em Minha marcenaria e na edição do orçamento, ver os exemplos nas três opções e o aviso de que só sobe o preço.
5. **Quantidade:** incluir um item com `-1` e ver "A quantidade não pode ser negativa".
6. **Segurança (local):** errar a senha 11 vezes com o mesmo e-mail e ver "Muitas tentativas…"; abrir `http://localhost:3333/saude`. Atenção: o limite fica ligado em desenvolvimento (só os testes automatizados o desligam); reiniciar a API zera o contador.
7. Conferir tudo a 1366×768 e a 390 px (RNF05).

## Limites desta evidência

Testes automatizados não substituem o percurso de tela. O tempo de resposta do login (A5) não é medido, só a igualdade das respostas. Os cabeçalhos do nginx e as restrições do systemd não foram testados na VPS.
