# Frontend — OrçaMarcenaria

Aplicação React com TypeScript (Vite). Responsável por coletar dados e **exibir** os valores que o backend calculou.

## Estrutura

| Pasta | O que vai aqui |
|---|---|
| `src/paginas/` | Uma pasta por tela: login, cadastro da marcenaria, materiais, serviços, clientes, orçamento (composição), lista de orçamentos, configurações |
| `src/componentes/` | Componentes reutilizáveis: campo de moeda, campo de quantidade, tabela de itens, bloco do memorial de cálculo, mensagens de erro |
| `src/servicos/` | Chamadas à API, tratamento de sessão e de erro |
| `src/hooks/` | Estado compartilhado e lógica de tela reaproveitável |
| `src/estilos/` | Estilos globais e tokens visuais |
| `src/tipos/` | Tipos TypeScript espelhando os contratos da API |
| `public/` | Arquivos estáticos |

## A regra que não pode ser quebrada

**O front-end não calcula preço.** Ao mudar quantidade, item, custo adicional ou percentual, a tela envia a composição ao backend e exibe os totais devolvidos (RNF02 e RNF08). Reimplementar a fórmula aqui "para responder mais rápido" é a forma mais provável de produzir divergência de centavos entre tela, PDF e teste — exatamente o que reprova o critério de validação do TCC.

Formatação é responsabilidade da tela; cálculo não é. Exibir `R$ 1.234,56` a partir do valor recebido é formatação. Somar duas linhas para mostrar um subtotal é cálculo — peça ao backend.

## Convenções

- Interface, rótulos e mensagens em português do Brasil (RNF26).
- Entrada monetária aceita vírgula decimal; exibição no formato `R$ 1.234,56` (RNF04).
- Utilizável a partir de 1366×768 sem rolagem horizontal (RNF05).
- Verificar em Chrome e Firefox antes de fechar qualquer spec de tela (RNF24).

## Executar localmente

```bash
cd frontend
npm install
copy .env.example .env    # no Windows; aponta VITE_API_URL para o backend local
npm run dev
```

Abra `http://localhost:5173`. Com o backend em execução, a tela inicial mostra o estado da API e do banco.

```bash
npm run build
npm run lint
```
