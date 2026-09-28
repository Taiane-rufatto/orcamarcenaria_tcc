# Plano — Configurações da marcenaria

## Desenho

| Parte | Arquivo | Conteúdo |
|---|---|---|
| Migração | `backend/migracoes/007-configuracoes.sql` | contato da marcenaria (`telefone`, `email_contato`, `cnpj`, `endereco`); tabela `configuracao` com os padrões como `DEFAULT` (D024) |
| Domínio | `dominio/orcamento/calculo.ts` | exporta `validarLucro` (a mesma verificação já usada no cálculo); nenhuma fórmula muda |
| Repositório | `infra/repositorios/configuracao-repositorio.ts` | lê a configuração criando a linha com os padrões na primeira leitura (`INSERT … ON CONFLICT DO NOTHING`); atualiza padrões e dados da marcenaria |
| Rotas | `api/rotas/configuracoes.ts` | `GET /configuracoes`, `PUT /configuracoes/marcenaria`, `PUT /configuracoes/padroes` |
| Orçamento | caso de uso e validação | lucro, arredondamento e validade opcionais na criação, preenchidos pela configuração; validade = emissão + dias calculada no banco |
| PDF | conteúdo e caso de uso | contatos da marcenaria no cabeçalho |
| Tela | `paginas/MinhaMarcenaria.tsx`, menu, `Orcamentos.tsx` | dois formulários (dados e padrões, com o multiplicador do markup vindo da API) e "Alterar senha"; validade opcional no novo orçamento |

## Riscos

| Risco | Mitigação |
|---|---|
| Padrão aplicado a orçamento antigo | Teste de não retroatividade |
| Quinto item no menu estourar a largura no celular | Conferir 390 px nas páginas |
| Duas cópias da regra da margem | `validarLucro` único no domínio |
