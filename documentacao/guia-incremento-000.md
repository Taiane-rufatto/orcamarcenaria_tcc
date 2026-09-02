# Guia do Incremento 000 — colocar o projeto para rodar

Este guia leva o repositório do estado atual (só documentação) até **backend e frontend rodando na sua máquina**, conectados ao PostgreSQL. É o incremento 000 do `roadmap.md`.

Ao final você terá: a linha de base versionada no GitHub, uma API que responde em `http://localhost:3333/saude`, uma tela React em `http://localhost:5173` mostrando o estado da API, e a suíte de testes funcionando.

**Ainda não é o sistema de orçamentos.** É o esqueleto que prova que o ambiente funciona. Funcionalidade começa no incremento 001. Essa separação é proposital: se algo quebrar depois, você sabe que não é o ambiente.

Tempo estimado: 1 a 2 horas na primeira vez.

> **Como usar este guia:** digite os comandos, não copie tudo de uma vez. Cada passo diz o que deve aparecer na tela. Se aparecer outra coisa, veja a seção 9 (Problemas comuns) antes de seguir.
>
> Os comandos estão no formato do PowerShell / terminal do VS Code no Windows. Onde muda para macOS ou Linux, está indicado.

---

## 1. Conferir o ambiente

No terminal do VS Code (`Ctrl` + `'`):

```bash
node -v
npm -v
git --version
psql --version
```

Esperado: Node 20 ou superior, npm 10+, git 2.x, psql 16.x. Se `psql` não for reconhecido no Windows, ele existe mas não está no PATH — veja a seção 9.1.

---

## 2. Versionar a linha de base **antes** de qualquer código

Este passo vem primeiro por um motivo acadêmico: a orientação pede comparar a documentação inicial com a final, para explicar o que mudou ao longo do projeto. Se o primeiro commit já tiver código, essa comparação perde a referência.

```bash
git init
git add .
git commit -m "docs: linha de base do projeto (documentacao, estrutura e governanca)"
git branch -M main
```

Se for seu primeiro uso do Git na máquina, ele vai pedir sua identidade:

```bash
git config --global user.name "Taiane Queirós Rufatto"
git config --global user.email "seu-email@exemplo.com"
```

Crie o repositório no GitHub (pode ser privado) **sem** README, .gitignore ou licença — o projeto já tem os seus. Depois:

```bash
git remote add origin https://github.com/SEU-USUARIO/orcamarcenaria.git
git push -u origin main
```

✅ **Confira:** abra o repositório no navegador. Você deve ver `documentacao/`, `backend/`, `frontend/`, `AGENTS.md` e os demais arquivos.

📌 **Por que isso importa no TCC:** esse primeiro commit é a evidência datada da sua linha de base. Ele será citado na monografia como ponto de partida da comparação final.

---

## 3. Criar o banco de dados

Abra o **SQL Shell (psql)** no Windows, ou no terminal:

```bash
psql -U postgres
```

Informe a senha que você definiu ao instalar o PostgreSQL. Dentro do psql, digite (uma linha por vez, o `;` no final é obrigatório):

```sql
CREATE USER orcamarcenaria WITH PASSWORD 'senha_local';
CREATE DATABASE orcamarcenaria OWNER orcamarcenaria;
\c orcamarcenaria
GRANT ALL ON SCHEMA public TO orcamarcenaria;
\q
```

O que cada linha faz:

| Comando | Para quê |
|---|---|
| `CREATE USER` | Cria um usuário só deste projeto. Não usamos o `postgres` na aplicação — se a senha vazar, o estrago fica limitado a este banco |
| `CREATE DATABASE ... OWNER` | Cria o banco já pertencente a esse usuário |
| `\c orcamarcenaria` | Conecta ao banco recém-criado |
| `GRANT ALL ON SCHEMA public` | Necessário no PostgreSQL 15 e superiores, que restringiram permissões no schema `public` |
| `\q` | Sai do psql |

✅ **Confira** a conexão com o usuário da aplicação:

```bash
psql -U orcamarcenaria -d orcamarcenaria -h localhost -c "select now();"
```

Deve imprimir uma tabela com a data e hora atuais. Se der erro de autenticação, veja a seção 9.2.

> Troque `senha_local` por uma senha sua. Ela vai para o arquivo `.env`, que **nunca** é versionado.

---

## 4. Inicializar o backend

```bash
cd backend
npm init -y
```

Isso cria o `package.json`. Agora as dependências:

```bash
npm install express cors dotenv pg decimal.js
npm install -D typescript tsx vitest @types/node @types/express @types/cors @types/pg
```

O que cada uma faz e por que está aqui:

| Pacote | Papel no projeto |
|---|---|
| `express` | Servidor HTTP e rotas da API |
| `cors` | Permite que o frontend em `localhost:5173` chame a API em `localhost:3333` durante o desenvolvimento |
| `dotenv` | Lê o arquivo `.env` com as variáveis de ambiente |
| `pg` | Cliente PostgreSQL |
| `decimal.js` | **Aritmética decimal exata.** É o que garante o RNF07 e, por consequência, o critério de aprovação do TCC. Sem ele, `0.1 + 0.2` em JavaScript resulta em `0.30000000000000004` |
| `typescript` | Tipagem estática |
| `tsx` | Executa TypeScript direto, sem compilar a cada alteração |
| `vitest` | Framework de testes |
| `@types/*` | Tipos das bibliotecas acima |

### 4.1 Configurar o TypeScript

Crie `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

📌 **Por que CommonJS e não ESM:** com módulos ESM o Node exige escrever `import { pool } from './pool.js'` mesmo em arquivo `.ts` — uma pegadinha que consome horas de quem está começando. CommonJS aceita `'./pool'` e o projeto compila e roda igual. Para um TCC de um semestre, é a escolha certa. Se depois quiser migrar, registre como decisão em `decisoes.md`.

`"strict": true` está ligado de propósito: o TypeScript vai reclamar de valores possivelmente indefinidos. Cada reclamação dessas é um erro que não vai acontecer com o marceneiro na frente da tela.

### 4.2 Scripts

Abra `backend/package.json` e substitua o bloco `"scripts"` por:

```json
"scripts": {
  "dev": "tsx watch src/servidor.ts",
  "build": "tsc",
  "start": "node dist/servidor.js",
  "test": "vitest run",
  "test:observar": "vitest"
}
```

| Script | O que faz |
|---|---|
| `npm run dev` | Sobe a API e reinicia sozinha a cada arquivo salvo |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Roda o que foi compilado (será usado na VPS, se você fizer a demonstração remota) |
| `npm test` | Executa os testes uma vez |
| `npm run test:observar` | Executa os testes continuamente enquanto você programa |

### 4.3 Variáveis de ambiente

```bash
copy .env.example .env
```

macOS/Linux: `cp .env.example .env`

Abra `backend/.env` e ajuste `DATABASE_URL` com a senha que você criou no passo 3, e troque `JWT_SECRET` por um texto longo e aleatório.

⚠️ O `.env` está no `.gitignore` e **não pode** ser commitado. O `.env.example` fica no repositório justamente para dizer quais variáveis existem, sem revelar valores.

### 4.4 Configuração da aplicação

Crie `backend/src/config/ambiente.ts`:

```ts
import 'dotenv/config'

function obrigatoria(nome: string): string {
  const valor = process.env[nome]
  if (!valor) {
    throw new Error(`Variável de ambiente ausente: ${nome}. Veja o .env.example.`)
  }
  return valor
}

export const ambiente = {
  porta: Number(process.env.PORT ?? 3333),
  urlBanco: obrigatoria('DATABASE_URL'),
  origemPermitida: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}
```

📌 Falhar no início, com mensagem clara, é melhor do que descobrir a variável faltando no meio de um cálculo.

### 4.5 Conexão com o banco

Crie `backend/src/infra/banco/pool.ts`:

```ts
import { Pool, types } from 'pg'
import { ambiente } from '../../config/ambiente'

// NUMERIC (OID 1700) chega do banco como texto e assim permanece.
// Converter para Number aqui destruiria a precisão decimal exigida pelo RNF07.
types.setTypeParser(1700, (valor) => valor)

export const pool = new Pool({ connectionString: ambiente.urlBanco })
```

📌 **Este é o ponto mais importante do incremento 000.** É aqui que a precisão decimal é preservada na fronteira com o banco. Um `parseFloat` nesta linha reprovaria os dez casos de teste do TCC — e o erro apareceria só lá na frente, como diferença de centavos difícil de rastrear.

### 4.6 O servidor

Crie `backend/src/servidor.ts`:

```ts
import express from 'express'
import cors from 'cors'
import { ambiente } from './config/ambiente'
import { pool } from './infra/banco/pool'

const app = express()

app.use(cors({ origin: ambiente.origemPermitida }))
app.use(express.json())

app.get('/saude', async (_requisicao, resposta) => {
  try {
    const resultado = await pool.query('select now() as agora')
    resposta.json({
      api: 'ok',
      banco: 'ok',
      horaDoBanco: resultado.rows[0].agora,
    })
  } catch (erro) {
    resposta.status(503).json({
      api: 'ok',
      banco: 'indisponivel',
      detalhe: erro instanceof Error ? erro.message : 'erro desconhecido',
    })
  }
})

app.listen(ambiente.porta, () => {
  console.log(`API ouvindo em http://localhost:${ambiente.porta}`)
})
```

A rota `/saude` existe para responder uma pergunta só: *a API subiu e enxerga o banco?* Ela vai ser útil o projeto inteiro, inclusive se você publicar na VPS.

✅ **Confira:**

```bash
npm run dev
```

Esperado no terminal: `API ouvindo em http://localhost:3333`. Abra `http://localhost:3333/saude` no navegador. Deve aparecer:

```json
{"api":"ok","banco":"ok","horaDoBanco":"2026-09-02T23:30:00.000Z"}
```

Se `banco` vier como `"indisponivel"`, a API está de pé mas a conexão falhou — confira a `DATABASE_URL` no `.env` e a seção 9.2.

Deixe rodando e abra um **segundo terminal** para os próximos passos (`+` na barra do terminal do VS Code).

### 4.7 O primeiro teste

Crie `backend/tests/unidade/ambiente.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'

describe('ambiente de desenvolvimento', () => {
  it('demonstra por que o projeto não usa ponto flutuante', () => {
    expect(0.1 + 0.2).not.toBe(0.3)
  })

  it('soma valores monetários com precisão exata', () => {
    const total = new Decimal('724.75').plus('37.05').plus('207.00').plus('106.80')
    expect(total.toFixed(2)).toBe('1075.60')
  })
})
```

✅ **Confira:** `npm test` — esperado `2 passed`.

📌 O segundo teste usa os valores reais do subtotal de materiais do caso CT03 (`qualidade-e-testes.md`). É só uma demonstração do ferramental: o cálculo de verdade, com as regras RN01 a RN11, é o incremento 003.

---

## 5. Inicializar o frontend

Volte à raiz do projeto e entre em `frontend`:

```bash
cd ..
cd frontend
npm create vite@latest . -- --template react-ts
```

O Vite avisa que a pasta não está vazia (por causa do `README.md` e do `.env.example`). Escolha **"Ignore files and continue"** com as setas e `Enter`.

Isso sobrescreve o `README.md` que escrevi. Como você já commitou no passo 2, é uma linha para recuperá-lo:

```bash
cd ..
git checkout -- frontend/README.md
cd frontend
```

Agora instale e configure:

```bash
npm install
copy .env.example .env
```

Confira que `frontend/.env` contém `VITE_API_URL=http://localhost:3333`.

### 5.1 Serviço de acesso à API

Crie `frontend/src/servicos/api.ts`:

```ts
const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export type Saude = {
  api: string
  banco: string
  horaDoBanco?: string
  detalhe?: string
}

export async function consultarSaude(): Promise<Saude> {
  const resposta = await fetch(`${URL_API}/saude`)
  if (!resposta.ok && resposta.status !== 503) {
    throw new Error(`A API respondeu ${resposta.status}`)
  }
  return resposta.json()
}
```

Toda chamada à API vai passar por arquivos desta pasta. Componente de tela não faz `fetch` direto — quando a autenticação entrar (incremento 001), o envio do token acontece em um lugar só.

### 5.2 Tela inicial

Substitua todo o conteúdo de `frontend/src/App.tsx` por:

```tsx
import { useEffect, useState } from 'react'
import { consultarSaude, type Saude } from './servicos/api'

export default function App() {
  const [saude, setSaude] = useState<Saude | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    consultarSaude()
      .then(setSaude)
      .catch((e: Error) => setErro(e.message))
  }, [])

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640 }}>
      <h1>OrçaMarcenaria</h1>
      <p>Ambiente de desenvolvimento — incremento 000</p>

      {erro && <p>❌ Não foi possível falar com a API: {erro}</p>}
      {!erro && !saude && <p>Consultando a API…</p>}
      {saude && (
        <ul>
          <li>API: {saude.api === 'ok' ? '✅ no ar' : '❌ com problema'}</li>
          <li>Banco: {saude.banco === 'ok' ? '✅ conectado' : `❌ ${saude.detalhe ?? 'indisponível'}`}</li>
        </ul>
      )}
    </main>
  )
}
```

✅ **Confira:**

```bash
npm run dev
```

Abra `http://localhost:5173`. Deve aparecer o título e as duas linhas com ✅. Se a API estiver parada, aparece a mensagem de erro — o que também é um bom sinal: significa que o tratamento de erro funciona.

---

## 6. Rodar o sistema no dia a dia

Depois de tudo instalado, a rotina de cada sessão de trabalho é:

| Terminal | Comando | Endereço |
|---|---|---|
| 1 | `cd backend` e `npm run dev` | http://localhost:3333 |
| 2 | `cd frontend` e `npm run dev` | http://localhost:5173 |

Para parar qualquer um: `Ctrl` + `C`.

No VS Code você também pode usar `F5` e escolher **"Aplicação completa"** — a configuração em `.vscode/launch.json` sobe a API com depurador e abre o Chrome. Isso permite parar a execução em um ponto do cálculo e inspecionar os valores, o que vale ouro quando um caso de teste divergir.

---

## 7. Commitar o incremento 000

```bash
cd ..
git add .
git commit -m "chore(000): inicializa backend, frontend e conexao com o banco"
git push
```

Confira antes: `git status` **não** pode listar `backend/.env`, `frontend/.env` nem `node_modules/`. Se listar, o `.gitignore` não está sendo respeitado — pare e resolva antes de enviar.

---

## 8. Fechar o incremento

Atualize, seguindo a rotina `fechar-spec`:

- `ESTADO_ATUAL.md` — mover os itens do incremento 000 para "Pronto" e apontar o próximo passo
- `BLOQUEIOS.md` — B09 (PostgreSQL) resolvido, vai para o histórico; B03 (Spec Kit) continua aberto
- `backend/README.md` e `frontend/README.md` — trocar "a preencher no incremento 000" pelos comandos reais
- `documentacao/decisoes.md` — registrar as bibliotecas escolhidas e o motivo (Express, decimal.js, Vitest, CommonJS)

✅ **O incremento 000 está concluído quando:**

- [ ] `http://localhost:3333/saude` responde com `banco: "ok"`
- [ ] `http://localhost:5173` mostra os dois ✅
- [ ] `npm test` no backend passa
- [ ] o repositório está no GitHub, sem `.env` e sem `node_modules`
- [ ] os documentos de estado refletem a realidade

Depois disso, abra o incremento 001 (conta e acesso) com a rotina `abrir-incremento`.

---

## 9. Problemas comuns

### 9.1 `psql` não é reconhecido (Windows)

O PostgreSQL foi instalado, mas não está no PATH. Use o **SQL Shell (psql)** pelo menu Iniciar, ou adicione ao PATH:
`C:\Program Files\PostgreSQL\16\bin`
Feche e reabra o VS Code depois de alterar o PATH — o terminal só lê a variável ao iniciar.

### 9.2 `password authentication failed for user "orcamarcenaria"`

A senha em `DATABASE_URL` não bate com a do passo 3. Se a senha tiver caracteres especiais (`@`, `:`, `/`), eles precisam ser codificados na URL — o mais simples é usar uma senha só com letras e números durante o desenvolvimento.

### 9.3 `npm : O arquivo npm.ps1 não pode ser carregado` (PowerShell)

Política de execução do Windows. No PowerShell, uma vez:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### 9.4 `EADDRINUSE: address already in use :::3333`

Já existe uma API rodando nessa porta — provavelmente um terminal antigo. Feche-o, ou mude `PORT` no `.env`.

### 9.5 Erro de CORS no console do navegador

A origem do frontend não está liberada. Confira que `CORS_ORIGIN` no `backend/.env` é exatamente `http://localhost:5173` (sem barra no final) e reinicie a API.

### 9.6 `Cannot find module './config/ambiente'`

Caminho ou nome de arquivo diferente do import. No Windows o sistema de arquivos ignora maiúsculas, mas o TypeScript não — `Ambiente.ts` e `ambiente.ts` são arquivos diferentes para ele.

### 9.7 O frontend abre, mas mostra ❌ no banco

A API está no ar e o banco não respondeu. Rode o teste de conexão do passo 3. Se o PostgreSQL estiver parado, inicie o serviço: no Windows, `services.msc` → `postgresql-x64-16` → Iniciar.

---

## 10. O que **não** fazer neste incremento

- Criar tabelas "já que estou no banco mesmo". O esquema nasce no incremento 001, junto com a migração que o versiona.
- Adiantar telas de material ou de orçamento. Sem a spec, o critério de aceitação não existe — e sem critério não há como provar que ficou pronto.
- Instalar bibliotecas "que talvez sejam úteis". Cada dependência entra no incremento que precisa dela, com o motivo registrado em `decisoes.md`.
