# Validação Manual: Conta e Acesso

## Pré-requisitos

- PostgreSQL local em execução e `backend/.env` preenchido.
- Dependências instaladas em `backend/` e `frontend/`.
- Migração 001 aplicada após a implementação.

## Execução

Em dois terminais:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

Abra `http://localhost:5173`.

## Roteiro de verificação

1. Cadastre a marcenaria fictícia “Marcenaria Exemplo”, responsável “Ana Teste”, e-mail
   `ana.teste@example.test` e uma senha de ao menos oito caracteres. Confirme acesso à área interna.
2. Saia, entre novamente com as mesmas credenciais e confirme a área interna.
3. Tente entrar com senha incorreta e confirme a mensagem “E-mail ou senha inválidos”.
4. Sem sessão, tente abrir uma rota interna e confirme o redirecionamento à entrada (TI04).
5. Altere a senha informando a senha atual; saia e confirme que apenas a nova senha entra.
6. Execute os testes automatizados definidos para a Spec e registre os resultados em
   `evidencias/testes/`.

Os contratos HTTP estão em [autenticacao.openapi.yaml](contracts/autenticacao.openapi.yaml) e as
regras de persistência em [data-model.md](data-model.md).
