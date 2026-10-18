# Decisões e Questões em Aberto

Registro cronológico das decisões de projeto (ADR simplificado) e das dúvidas que ainda dependem de resposta humana. Regra da metodologia: **divergência entre fontes não se resolve em silêncio** — decide-se aqui e atualiza-se a fonte canônica.

Formato: contexto → decisão → consequência → situação (`provisória` enquanto depender de confirmação, `firme` quando validada).

---

## D038 — Fornecedor completo: endereço, aviso no orçamento e lista de compras
**Data:** 2026-10-18 · **Situação:** firme (decidido pela autora)

**Contexto.** O resumo que a autora fez da orientação de 08/10/2026 pede o endereço do fornecedor, o alerta de preço dentro do orçamento (com "continua o mesmo" ou registrar o novo) e uma segunda saída do orçamento: uma lista de compras por fornecedor.

**Decisão.** (1) Endereço opcional no fornecedor. (2) No orçamento em rascunho, cada material do catálogo mostra quando o preço está antigo (mais de 30 dias, RN15) ou quando o custo do catálogo mudou depois de o item entrar, com os botões "Continua o mesmo" e "Usar o novo custo"; o valor do item **nunca** muda sozinho (RN08). (3) **Lista de compras** interna: materiais agrupados por fornecedor atual, só quantidades, com botão "Copiar lista" (texto para WhatsApp); fora do PDF do cliente. (4) O campo de descrição do serviço vira "Quando cobrar", o que a análise da spec 016 marcava como feito sem estar (S2).

**Alternativas.** Vários fornecedores por material e sugestão do mais barato: ficam para o TCC II (o proprietário usa um só). Imprimir a lista e custo estimado por fornecedor: depois, se a autora quiser. Envio automático por WhatsApp: não aprovado pelo professor.

**Consequência.** Migração `013`. Promove RF58, RF59 e a US21. O cálculo do orçamento e o PDF não mudam.

---

## D037 — Endurecimento de segurança a partir do diagnóstico (spec 021)
**Data:** 2026-10-18 · **Situação:** firme

**Contexto.** O diagnóstico da spec 017 achou, como mais grave, a falta de limite de tentativas no login. O repositório é **público** e a branch com o diagnóstico foi enviada ao GitHub, o que tornou urgente corrigir o que o código resolve.

**Decisão.** Corrigir no código os achados A1 (limite de tentativas), A2 (dependência com aviso crítico), A5 (tempo de resposta do login), A6 (`/saude` sem detalhe) e A7 (`JWT_SECRET` forte). O limite é em memória, sem dependência nova (a API roda em um processo só): login 10 por e-mail e 30 por endereço em 15 minutos; cadastro e recuperação de senha 10 por hora por endereço; redefinição 10 em 15 minutos; resposta 429 com `Retry-After`. A API confia em 1 salto de proxy (nginx) para ver o endereço real. Cabeçalhos do nginx (A3) e restrições do systemd (A11) ficam como modelo no repositório e roteiro em `publicacao.md`, porque dependem da VPS.

**Consequência.** A API **não sobe** com `JWT_SECRET` de menos de 32 caracteres: conferir o `.env` da VPS antes de atualizar (trocar o segredo encerra as sessões abertas). O limite zera ao reiniciar a API. Ficam em aberto A4, A8, A9 e A10, e a lista "não verificado" do diagnóstico, que exige acesso à VPS.

---

## D036 — Ajustes de uso vindos da orientação: CPF/CNPJ, busca por número, textos
**Data:** 2026-10-18 · **Situação:** firme (decidido pela autora)

**Contexto.** A orientação de 08/10/2026 apontou melhorias pequenas e concretas: CPF ou CNPJ no cliente, descrição mais clara do arredondamento, busca de orçamento por número e explicar na apresentação que o cadastro aberto é para teste. O achado do 008 (mensagem de quantidade negativa) estava pendente.

**Decisão.** (1) **CPF ou CNPJ opcional** no cliente, validado pelos dígitos verificadores (RN16), guardado só com os dígitos e **fora do PDF** do orçamento por enquanto: a autora pode decidir incluí-lo depois. Não é único. (2) **Busca por número** no orçamento: "2", "#2" ou "nº 2" acha o orçamento 2 além do nome do cliente (RN17). (3) **Textos:** cada regra de arredondamento com exemplo numérico (R$ 2.758,71 vira R$ 2.759,00 ou R$ 2.760,00) e o aviso de que ele só sobe o preço; mensagem de quantidade negativa que diz o problema. (4) A tela de **criar conta** avisa que é acesso de demonstração e pede dados fictícios.

**Alternativas.** Forma de pagamento como módulo e separar registrar de enviar: mantidos como estão (observação em texto; D020), com a duplicação (RF40) como caminho para ajustar orçamento enviado.

**Consequência.** Migração `012` (coluna `documento` com restrição de formato). Promove RF54 a RF57 e a US20. O cálculo do orçamento não muda.

---

## D035 — Painel do mês: como foram os orçamentos, em frases simples
**Data:** 2026-10-14 · **Situação:** firme (decidido pela autora)

**Contexto.** A orientação de 08/10/2026 sugeriu que o sistema mostrasse ao marceneiro uma visão simples do negócio (quantos orçamentos enviou, quantos foram aprovados). O estado já existe (rascunho, enviado, aprovado, recusado, vencido); falta resumir.

**Decisão.** Uma tela **Painel do mês**, com seletor de mês, que mostra: quantos orçamentos foram enviados, quantos aprovados, recusados, vencidos e aguardando resposta; a **taxa de aprovação** (aprovados ÷ enviados); e o valor e o lucro dos aprovados. O mês é o da **data de emissão** (não existe data de aprovação). Rascunho não conta como enviado. A soma e as taxas moram no domínio (`backend/src/dominio/painel/`), sem recalcular preço: só somam valores que o cálculo do orçamento já gravou (RN14).

**Alternativas.** Gráficos e comparação entre meses: ficam para o TCC II. Novos estados (em produção, entregue): TCC II.

**Consequência.** Sem migração nova. O vencimento automático (RF36) é aplicado antes de contar. Promove RF47 e RF48 e US19. Nada aqui altera preço.

---

## D034 — Fornecedor, histórico de preço e alerta de preço antigo (RF16 promovido)
**Data:** 2026-10-14 · **Situação:** firme (decidido pela autora)

**Contexto.** O professor sugeriu cadastrar fornecedores ligados aos materiais e guardar o histórico de atualização do preço, com alerta quando o preço estiver velho. A necessidade mínima, nas palavras dele, é saber **de quem vem o preço**. O RF16 (histórico de custo) estava como pós-TCC.

**Decisão.** (1) Cadastro simples de **fornecedor** (nome e telefone). (2) O **material** pode apontar para um fornecedor (opcional). (3) A cada vez que o custo ou o fornecedor do material muda, ou que a pessoa confirma "o preço continua o mesmo", grava-se uma linha de **histórico** (data, custo, fornecedor); nada é apagado. (4) **Alerta de preço antigo:** o preço sem atualizar ou confirmar há mais de **30 dias** aparece com um selo "Preço antigo" e o botão "Continua o mesmo" (RN15). O prazo é fixo; as duas semanas e o um mês da conversa eram exemplos.

**Alternativas.** Vários fornecedores por material e comparação de preços: ficam para o TCC II. A autora informou em 2026-10-14 que o proprietário costuma usar um só fornecedor, o que confirma essa escolha e levou ao **fornecedor padrão** (RF53): um por marcenaria, já marcado ao cadastrar material novo; inativar o fornecedor padrão tira o padrão. Lista de compras por fornecedor e WhatsApp: TCC II. Prazo configurável do alerta: não vale a complexidade agora.

**Consequência.** Migração `011` (tabela de fornecedor, colunas no material e histórico; materiais existentes ganham a primeira linha do histórico). Mudar só nome, descrição ou unidade não grava histórico. Orçamentos já criados continuam com o custo da época (RN08). Fornecedor inativo não pode ser escolhido, mas continua no histórico. Promove o RF16 (agora RF52) e cria RF49–RF51 e US18.

---

## D033 — Alerta de lucro mínimo: o diferencial do trabalho, sem alterar o preço
**Data:** 2026-10-13 · **Situação:** firme (decidido pela autora); a leitura ainda deve ser validada com o orientador

**Contexto.** Na orientação de 08/10/2026 o professor Muriel sugeriu, como contribuição do TCC, uma visão simplificada de ponto de equilíbrio. A primeira versão (meta mensal e horas de trabalho) foi considerada complicada pela autora, que pediu algo que o marceneiro use de verdade. Pesquisa de mercado: o erro mais comum é fechar preço "no olho" e a margem ir sumindo (Omie); o Sebrae manda o preço cobrir custos variáveis e fixos **e deixar um lucro desejado**, refazendo a conta quando o mercado paga menos; na oficina, o costume é um multiplicador sobre o custo que já embute despesas fixas e lucro.

**Decisão.** O orçamento passa a mostrar o **lucro de verdade** (preço final menos o custo direto total, RN12) e quanto isso representa **do preço de venda** (RN13). Em "Minha marcenaria" a pessoa pode definir um **lucro mínimo** (% do preço, opcional); se o orçamento ficar abaixo, a tela avisa. Serve especialmente quando o marceneiro baixa o percentual para ganhar um cliente. **Não bloqueia nada e não altera o preço.** A conta mora no domínio (`backend/src/dominio/equilibrio/`), em arquivo separado do cálculo do preço.

**Alternativas.** Meta mensal e horas de trabalho: rejeitada, difícil de entender e de preencher, e pouco usada na hora de orçar. Sinal de entrada de 50% e saldo (prática do setor): boa candidata a incremento próprio. Comparar com preço de mercado: sem fonte de dados.

**Atenção ao nome.** Isto **não é** o ponto de equilíbrio completo sugerido pelo orientador (custo da operação, meta mensal, horas e agenda). É uma versão mais simples, que responde "este orçamento está me deixando pouco lucro?". O nome interno "equilibrio" no código e na API é histórico; para a pessoa e na apresentação o recurso é o **alerta de lucro mínimo**, e o ponto de equilíbrio completo é direção do TCC II, a validar com o orientador.

**Consequência.** Migração `010` (coluna opcional `lucro_minimo`; remove as colunas da primeira ideia, que nunca foram publicadas). Sem lucro mínimo, a tela só mostra o lucro e nunca avisa. Orçamento sem itens não tem aviso. O aviso usa o mínimo **atual**, inclusive em orçamentos registrados, e nunca vai para o PDF do cliente (RF42). `calcularOrcamento` e os casos CT01–CT10 não mudam. Promove RF44–RF46 e US17; os valores de exemplo são fictícios.

---

## D032 — Nomes de material, serviço e cliente gravados em maiúsculas
**Data:** 2026-10-08 · **Situação:** firme (decidido pela autora)

**Contexto.** Os nomes ficavam misturados (`mdf 18mm`, `Mdf 18MM`, `MDF 18mm`), o que atrapalhava a leitura da lista, o campo com busca e o PDF. A autora pediu maiúsculas visuais e também no cadastro.

**Decisão.** O nome de material, serviço e cliente é convertido para maiúsculas **na API** (cadastro e edição), em um único ponto (`nomeEmMaiusculas`, com `pt-BR` para preservar acentos), e o campo Nome já mostra maiúsculas ao digitar. Textos livres (descrição do projeto, itens avulsos, observações, especificações) e os nomes da marcenaria e do usuário ficam como são. Os cadastros existentes são convertidos por migração (`009`), com backup antes e com trava: se dois nomes de uma mesma marcenaria virarem iguais, a migração para e lista os casos.

**Consequência.** O "nome único" de material e serviço passa a valer sem diferenciar caixa ("Mdf" e "MDF" são o mesmo nome e dão 409). Itens já incluídos em orçamentos mantêm a descrição da época (RN08); o nome do cliente, que vem sempre do cadastro, muda também em orçamentos existentes e no PDF. A conversão é irreversível: a caixa original se perde (por isso o backup). Não toca em cálculo.

---

## D031 — Enter cadastra e continua; o painel só fecha com Esc ou ✕ (revisa a D030)
**Data:** 2026-10-08 · **Situação:** firme (decidido pela autora)

**Contexto.** A D030 manteve o Enter salvando e fechando e acrescentou o botão "Salvar e cadastrar outro". Ao ver o resultado, a autora quis que a sequência fosse ágil também para quem usa o teclado, sem precisar do mouse nem de um botão extra.

**Decisão.** No painel de **novo** material, serviço e cliente, o Enter (e o botão "Cadastrar ...") grava e abre o formulário em branco, com o foco no Nome; o painel só fecha com Esc ou ✕. O botão "Salvar e cadastrar outro" sai e "Cancelar" vira "Fechar". Na **edição**, tudo como antes (Enter salva e fecha). Uma trava evita gravar duas vezes com Enter repetido.

**Consequência.** Substitui da D030 o ponto "Enter continua salvando e fechando" e o botão extra; o restante da D030 (foco no Nome, unidade e tipo de cobrança mantidos, confirmação) segue valendo. Só muda a tela. A confirmação do 013 (`evidencias/testes/013-...`) descreve o comportamento anterior, que valeu na data dela.

---

## D030 — Incremento 013: cadastro em sequência nos painéis laterais
**Data:** 2026-10-08 · **Situação:** firme (decidido pela autora)

**Contexto.** Depois do 011, cada cadastro novo abre o painel lateral e fecha ao salvar. Ao montar o catálogo, a autora precisa clicar em "+ Novo material" a cada item, o que desgasta. O marceneiro fará a carga do catálogo antes e durante a avaliação de uso (009).

**Decisão.** Abrir o incremento **013**, depois do 012 e antes do 009. No painel de criação de materiais, serviços e clientes entra o botão "Salvar e cadastrar outro": salva, mantém o painel aberto, limpa o formulário, leva o foco ao Nome, mantém a unidade (material) e o tipo de cobrança (serviço) e mostra "✓ <nome> cadastrado". A tecla Enter continua salvando e fechando. Cadastro em tabela com várias linhas e importação de planilha ficam fora (roadmap §5).

**Consequência.** Só muda a tela; nenhuma regra, rota ou dado. O ensaio dos dez casos pela tela é reexecutado ao fechar, como no 011.

---

## D029 — Publicação para demonstração em VPS, com endereço gratuito e HTTPS
**Data:** 2026-10-01 · **Situação:** firme (decidido pela autora)

**Contexto.** A autora quer que o orientador acompanhe o sistema sem instalar nada. O RNF25 prevê implantação em VPS só por configuração, e o RNF14 exige HTTPS quando publicado. Alternativas consideradas: Render (grátis, mas dorme após 15 min e o banco grátis expira em 30 dias), Railway (pago, cerca de US$ 5/mês) e VPS própria.

**Decisão.**
1. VPS própria com Ubuntu 24.04, contratada pela autora: PostgreSQL, a API em Node.js como serviço do sistema (systemd) e o nginx servindo o front-end compilado e repassando a API.
2. Sem domínio próprio: endereço gratuito `<ip>.sslip.io`, que aponta para o IP da VPS, com certificado do Let's Encrypt (certbot).
3. Front e API no mesmo endereço: a API fica sob `/api` no nginx, o que dispensa CORS entre domínios.
4. Banco publicado só com dados fictícios (RNF15). O passo a passo fica em `documentacao/publicacao.md`.

**Consequência.** Há custo mensal da VPS por conta da autora. Atualizar a versão publicada é um procedimento manual descrito no roteiro (baixar a branch, compilar, migrar, reiniciar).

---

## D028 — Recuperação de senha por e-mail (RF07) trazida para antes da entrega
**Data:** 2026-10-01 · **Situação:** firme (decidido pela autora; a comentar com o orientador por mudar o escopo declarado)

**Contexto.** O RF07 estava como Desejável e pós-TCC. Com o sistema publicado para o orientador e, depois, para a avaliação de uso, quem esquecer a senha fica sem acesso, porque não há suporte manual.

**Decisão.**
1. O RF07 entra no incremento 012. Fluxo: a pessoa informa o e-mail; se ele for de uma conta ativa, recebe um link de troca de senha válido por 1 hora e de uso único.
2. A resposta da API é a mesma com e-mail cadastrado ou não, para não revelar quem tem conta.
3. O token tem 32 bytes aleatórios; no banco fica só o hash SHA-256 dele. Pedir de novo invalida o anterior, e pedidos repetidos em menos de 1 minuto não reenviam o e-mail.
4. Trocar a senha encerra todas as sessões abertas, como no RF06.
5. Envio por SMTP com uma conta Gmail e senha de app (nodemailer). Sem SMTP configurado, o link vai para o console do servidor, o que serve ao desenvolvimento e aos testes.

**Consequência.** Nova dependência (nodemailer) e nova tabela `redefinicao_senha`. Na tabela de requisitos, o RF07 passa a apontar para o incremento 012; a prioridade continua Desejável, porque a proposta não muda.

---

## D027 — Linha do lucro no memorial só com o rótulo "Lucro"
**Data:** 2026-10-01 · **Situação:** firme (decidido pela autora)

**Contexto.** No refinamento visual (011), a autora achou a linha "Lucro (markup 150,00% · 2,50× o custo)" poluída na coluna estreita do resumo, onde ela quebrava no meio. O rótulo completo vinha de `regras-de-calculo.md` §5 e de D018.

**Decisão.** A linha do lucro no memorial passa a mostrar só "Lucro" e o valor. A forma de lucro, o percentual e o multiplicador equivalente do markup continuam na mesma tela, na seção "Dados e lucro" (editável no rascunho, somente leitura depois), e no aviso do markup ("150% = 2,5× o custo").

**Consequência.** Nenhuma fórmula muda e os valores do memorial são os mesmos; quem confere a conta à mão lê o modo e o percentual em "Dados e lucro". `regras-de-calculo.md` §5 foi atualizado. As evidências já registradas (003, 008) mantêm o rótulo antigo, que valia na data delas. Como o memorial é evidência para a banca, vale comentar a mudança com o orientador.

---

## D026 — Incremento 011 (refinamento visual) antes do 009, no modelo "Bancada"
**Data:** 2026-10-01 · **Situação:** firme (decidido pela autora, ajustado tela a tela em 2026-10-01)

**Contexto.** O 009 (avaliação de uso) aguarda o termo de consentimento (B06). Nesse intervalo, a autora pediu um visual mais limpo, tomando como modelo a proposta "Bancada" do estudo de propostas de design (artifact "OrçaMarcenaria: Propostas de Design", 2026-09-30): menu lateral, cartões e tabelas mais leves e, no orçamento, o resumo à direita acompanhando a rolagem. Pediu também para manter as cores atuais (D014), um pouco mais claras.

**Decisão.**
1. Abrir o incremento **011 — Refinamento visual** e executá-lo antes do 009. Só aparência, disposição das telas e textos; nenhuma regra de cálculo, rota da API ou dado muda.
2. Alcance escolhido pela autora: **visual + layout**. Menu lateral, botões planos, tabelas e cartões mais limpos, e no orçamento o memorial e as ações de situação numa coluna fixa à direita. Os formulários continuam onde estão; criar e editar em painel lateral fica de fora.
3. Tipografia só sem serifa (Figtree). A régua deixa o cabeçalho e fica só no painel de acesso e na marca.
4. Paleta de D014 mantida em matiz, com tons mais claros, mantendo contraste de 4,5:1 no texto (WCAG 2.2 AA).

**Atualização (2026-10-01, ainda na mesma sessão com a autora).** O item 2 mudou durante a implementação: criar e editar em **painel lateral** passou a fazer parte do 011 (materiais, serviços, clientes e "+ Novo orçamento"), com busca e filtros de situação nas listas, e a escolha de material, serviço e cliente virou **campo com busca** no lugar da lista suspensa. Continuam de fora: duplicar registro, desfazer inativação e máscara de moeda. A `spec.md` do 011 é a descrição vigente do alcance.

**Consequência.** D014 continua valendo quanto ao princípio de cores e estilos só em variáveis de `index.css`; mudam a tipografia dos títulos, a posição da régua e os valores das cores. Ao final, o ensaio dos dez casos pela tela é reexecutado, porque os percursos de tela dependem da posição dos elementos — feito em 2026-10-08, 10 de 10 com diferença R$ 0,00 (`evidencias/testes/011-refinamento-visual-2026-10-08.md`). O 009 volta quando B06 for resolvido.

---

## D025 — Execução formal dos dez casos pela autora, com ensaio automatizado antes
**Data:** 2026-09-30 · **Situação:** firme (decidido pela autora)

**Contexto.** O 008 executa formalmente os dez casos "lançados na aplicação" (`qualidade-e-testes.md` §3). Faltava definir quem executa e como os itens entram na tela.

**Decisão.**
1. A execução formal é feita pela autora, à mão, na tela, seguindo `evidencias/testes/008-roteiro-casos-pela-tela.md`.
2. Antes dela, o agente faz um ensaio com o navegador automatizado (Edge + Playwright) numa conta de ensaio, para encontrar problemas antes da execução formal. O ensaio é registrado como evidência complementar, não como a execução formal.
3. Os itens entram como **avulsos**, com o valor unitário do caso: os casos definem o valor unitário diretamente, e o caminho pelo catálogo já foi verificado com CT03 e CT04 (003) e CT03, CT04 e CT06 (007).

**Consequência.** A execução formal depende do tempo da autora (cerca de uma hora). Divergência encontrada no ensaio ou na execução formal vira defeito registrado, e a tabela inteira é reexecutada após a correção.

---

## D024 — Configurações da marcenaria e padrões do orçamento
**Data:** 2026-09-28 · **Situação:** firme (decidido pela autora)

**Contexto.** O 007 cria a configuração por marcenaria (RF05, RF19–RF22). Até aqui, os padrões de lucro estavam fixos no código (D017) e a validade era digitada em todo orçamento. A Q6 (prazo habitual) estava sem resposta.

**Decisão.**
1. Valores iniciais de toda marcenaria: markup, 150,00%, sem arredondamento (D017) e **validade de 10 dias** (resposta da autora à Q6). Ficam como `DEFAULT` das colunas da tabela `configuracao`, um único lugar.
2. A configuração vale só para orçamentos **novos**: modo, percentual e arredondamento são copiados para o orçamento na criação (arquitetura §5.2.3) e podem ser mudados em cada rascunho (RF30). Alterar a configuração nunca muda orçamento existente.
3. "Válido até" em branco na criação é preenchido pelo servidor com a emissão + os dias configurados.
4. A regra da margem (0 ≤ margem < 100) é verificada pela mesma função do domínio usada no cálculo, para não existir uma segunda cópia da regra.
5. Dados da marcenaria (telefone, e-mail, CNPJ e endereço opcionais) aparecem no PDF quando preenchidos. CNPJ, se informado, precisa ter 14 dígitos.
6. Tudo fica numa página "Minha marcenaria", que passa a abrigar também o "Alterar senha".

**Consequência.** O código deixa de ter padrões de lucro fixos (a validação de criação não impõe mais markup 150%). Os casos CT03, CT04 e CT06 são reexecutados partindo da configuração.

---

## D023 — PDF gerado no servidor com PDFKit, conteúdo separado do desenho
**Data:** 2026-09-28 · **Situação:** firme

**Contexto.** A arquitetura deixou a biblioteca de PDF para o 006 (§6) e registrou o risco de uma ferramenta complexa atrasar o incremento (§9).

**Decisão.** Usar **PDFKit** no servidor: biblioteca JavaScript sem navegador embutido, com as fontes padrão do PDF (que cobrem acentos do português). O PDF é montado em duas etapas: uma função pura monta o **conteúdo** (textos e linhas a imprimir) a partir do orçamento já calculado, e outra apenas o **desenha** com PDFKit. O valor por extenso é escrito por uma função própria, a partir do texto decimal, sem `Number`.

**Alternativas rejeitadas.** Navegador sem interface (Puppeteer): baixa um navegador inteiro e pesa na instalação e na VPS. pdfmake: tabelas declarativas, mas exige empacotar fontes; a tabela deste PDF é simples.

**Consequência.** O conteúdo é testável sem abrir o PDF, inclusive a garantia de que não aparece custo, lucro ou percentual (RF42). O PDF usa os valores gravados pelo domínio; não há segundo cálculo.

---

## D022 — PDF sem valores por item, só de orçamento registrado, com observações
**Data:** 2026-09-28 · **Situação:** firme (decidido pela autora; revisado no mesmo dia com o modelo de orçamento do proprietário)

**Contexto.** O RF41 pede "itens com quantidade e valor" e o RF42 "lista de itens com valores ou apenas valor total", sem revelar custo e lucro. Mas o valor de cada item é **custo** (RN01): listá-lo ao lado do preço final revela o lucro por diferença. Ratear o preço entre os itens exigiria uma regra de cálculo nova. Também não estava definido se rascunho gera PDF nem o que é o "campo de observações".

**Decisão.**
1. O PDF nunca mostra valor por item. Por padrão ele segue o modelo de orçamento que o proprietário já usa (responde à Q7): **especificações** digitadas pelo marceneiro ("Orçamento referente a <projeto>, estando incluídos os seguintes itens:" seguido do texto dele, com marcadores e subtítulos) e o **preço final**. Ao baixar, pode-se incluir também a lista de materiais e serviços do sistema, só com quantidades.
2. Só orçamento registrado (com número) gera PDF (US14).
3. O orçamento ganha dois textos editáveis em rascunho: `especificacoes` (o que o cliente recebe, no alto do PDF) e `observacoes` (prazo, pagamento, no fim). Na tela, eles têm botão próprio e são salvos automaticamente ao registrar, para não se perderem.
4. Dados da marcenaria no PDF: nome e responsável; telefone, e-mail, CNPJ e endereço entram quando o RF05 (incremento 007) existir.

**Alternativa rejeitada.** Valores de venda por item (custo × fator, com sobra de centavos): mudaria `regras-de-calculo.md` e os casos de teste por um detalhe de apresentação.

**Consequência.** RF41 e RF42 reescritos em `requisitos.md`. O RF42 fica atendido sem regra nova, e o PDF não expõe a composição de custo em nenhuma das duas opções.

---

## D021 — Cliente vinculado ao orçamento, sem cópia do nome, e reativável
**Data:** 2026-09-28 · **Situação:** firme (decidido pela autora)

**Contexto.** O incremento 003 guardou o cliente como texto livre (`cliente_nome`, D018) até existir o cadastro. O 005 cria o cadastro (RF08–RF10) e precisa ligar os orçamentos a ele, inclusive os que já existem no banco. Também era preciso decidir se cliente inativado pode voltar, como materiais e serviços (D015).

**Decisão.**
1. O orçamento passa a ter `cliente_id` obrigatório e deixa de ter `cliente_nome`. Nome, telefone e demais dados vêm do cadastro: corrigir o cliente atualiza todos os seus orçamentos. Os valores continuam congelados (RN08); só os dados de contato acompanham o cadastro.
2. A migração cria um cliente para cada nome distinto já usado em orçamentos da mesma marcenaria e liga os orçamentos a ele, sem perder nenhum.
3. Cliente inativado pode ser reativado (mesma regra de D015). Inativo não pode ser escolhido para um orçamento novo nem para trocar o cliente de um rascunho, mas continua ligado aos orçamentos que já tem.
4. Nome de cliente não é único: homônimos são comuns e se distinguem pelo telefone ou endereço.

**Alternativa rejeitada.** Copiar o nome para o orçamento no registro, como os preços: mais fiel ao documento enviado, porém duplica dados de contato e exige regra de sincronização enquanto rascunho. Pode ser revista no 006 (PDF), se o documento precisar reproduzir o nome da época.

**Consequência.** Uma única fonte para os dados do cliente. A busca da lista de orçamentos passa a procurar no nome do cadastro.

---

## D020 — Registrar é enviar: número atribuído na saída do rascunho
**Data:** 2026-09-28 · **Situação:** firme (decidido pela autora)

**Contexto.** A RN11 atribui o número "no momento do registro"; a RN09 leva o orçamento de `rascunho` direto a `enviado`; o RF39 trava itens após o envio; a RN10 exige ao menos um item "para sair de rascunho". Não havia definição se "registrar" é um passo próprio.

**Decisão.** Registrar e enviar são o mesmo passo: a ação "Registrar e marcar como enviado" confere RF32 (cliente, descrição e ao menos um item), atribui o próximo número da marcenaria (RN11) e muda a situação para `enviado`, travando itens e valores (RF39). Rascunhos não têm número e aparecem na listagem para serem reabertos e editados.

**Alternativa rejeitada.** Um passo "registrar" separado, com orçamento numerado e ainda editável: exigiria uma situação `registrado` inexistente na RN09 e mudaria RF35.

**Consequência.** A RN09 permanece como está. Número só existe em orçamento que saiu do rascunho, o que garante que um número entregue ao cliente nunca corresponde a valores alterados depois.

---

## D019 — Recálculo embutido em cada alteração do orçamento
**Data:** 2026-09-28 · **Situação:** firme

**Contexto.** `arquitetura.md` §8 desenha um `POST /orcamentos/{id}/calcular` que recebe a composição atual. Isso obrigaria a tela a manter a composição em memória e a salvá-la por outro caminho, com risco de totais gravados diferentes dos exibidos.

**Decisão.** Cada alteração da composição (item, custo adicional, lucro, arredondamento) é gravada em transação, o domínio calcula uma única vez e a resposta devolve o orçamento completo com os totais. Não há endpoint `/calcular` separado.

**Consequência.** Continua havendo um único caminho de cálculo (D005) e os totais gravados ficam sempre coerentes com os itens. Custo: uma escrita no banco a cada alteração, irrelevante no volume de uma marcenaria. `arquitetura.md` §8 será atualizado no fechamento da Spec 003.

---

## D018 — Multiplicador equivalente no markup e cliente em texto livre no 003
**Data:** 2026-09-28 · **Situação:** firme (decidido pela autora)

**Contexto.** O proprietário expressa o preço como "250% a 280% do custo" (2,5× a 2,8×). Na RN06 o percentual é **somado** ao custo: digitar 250 produziria 3,5× o custo, cobrando 40% a mais do que ele pretende. Além disso, RF23 pede cliente no orçamento, mas o cadastro de clientes só chega no incremento 005.

**Decisão.**
1. A RN06 não muda. No modo markup, o servidor devolve também o **multiplicador equivalente** `1 + markup/100` (ex.: markup 150% → 2,50×), exibido na tela e no memorial junto ao percentual. O frontend não calcula o multiplicador.
2. No incremento 003 o cliente é um campo de texto livre (`cliente_nome`). O incremento 005 introduz o vínculo com o cadastro (`cliente_id`).

**Alternativa rejeitada.** Um terceiro modo "multiplicador" (digitar 2,5): mais natural para o proprietário, mas altera regras, D002, casos de teste e configuração — escopo extra sem ganho de cálculo.

**Consequência.** O memorial deixa explícita a equivalência entre percentual e multiplicador, que é justamente a confusão apontada na justificativa da proposta. Custa um campo derivado na resposta do cálculo.

---

## D017 — Respostas do proprietário a Q1–Q5
**Data:** 2026-09-28 · **Situação:** firme (confirmadas pelo proprietário na entrevista — B01)

**Contexto.** A autora obteve do proprietário respostas a Q1–Q5 em conversa informal e depois as confirmou com ele, que revisou apenas a Q1.

**Respostas.**

| # | Resposta | Efeito |
|---|---|---|
| Q1 | Lucro sobre o que gastou: cobra de 250% a 280% do custo dos materiais (2,5× a 2,8×) | É markup (RN06), equivalente a markup de 150% a 180%. O padrão de D002 passa de margem para **markup**; os dois modos continuam existindo. Ver D018 para a forma de informar |
| Q2 | Soma o custo e aplica o multiplicador; a mão de obra não é calculada à parte | O multiplicador já embute mão de obra e lucro. Não exige novo tipo de cobrança em `servico`; itens de serviço seguem disponíveis |
| Q3 | Sempre cobra a chapa inteira | Lança-se quantidade inteira de chapas. Nenhuma mudança de regra; aproveitamento segue fora do MVP |
| Q4 | Hoje frete, deslocamento e instalação não entram no preço; quer passar a incluí-los, com lucro | Confirma RN04 e D006 como estão |
| Q5 | Não costuma arredondar | O padrão de D003 passa a ser `duas_casas`; `real_inteiro` e `dezena` continuam disponíveis |

**Consequência.** Nenhuma fórmula de `regras-de-calculo.md` muda; mudam apenas os padrões. O exemplo do §4 (modo margem) segue válido como caso de teste. Observação para a monografia: embutir mão de obra e lucro num único multiplicador (Q2) esconde quanto do preço remunera o trabalho — é um dos problemas que o memorial de cálculo (RF31) torna visível.

---

## D016 — Custo e valor unitário do catálogo devem ser maiores que zero
**Data:** 2026-09-19 · **Situação:** firme

**Contexto.** Ao fechar a Spec 002 apareceu uma divergência entre fontes: a RN10 (`regras-de-calculo.md`) exige valor unitário "maior ou igual a zero" e a US03 rejeitava apenas custo negativo ou vazio, mas a Spec 002, a validação do servidor e a restrição do banco (`CHECK > 0`) já recusavam também o zero. A autora foi consultada.

**Decisão.** No catálogo (material e serviço), custo e valor unitário devem ser **maiores que zero**. O "maior ou igual a zero" da RN10 passa a valer para o valor unitário de **item de orçamento**, onde zero é legítimo (cortesia, item ajustado apenas naquele orçamento; RF24 e RF26).

**Consequência.** Nenhuma alteração de código nem de banco: o comportamento implementado já era esse. Ajustados RN10 e US03. O caso negativo CN03 (valor negativo) não muda. O incremento 003 deve aceitar zero no item de orçamento sem exigir zero no catálogo.

---

## D015 — Reativação de material e serviço inativados
**Data:** 2026-09-19 · **Situação:** firme

**Contexto.** RF15 e RF18 tratam de inativar, sem mencionar reverter; RF11 e RF17 incluem "situação (ativo/inativo)" e RF13 filtra por situação. Durante o uso, a autora percebeu que a inativação era irreversível pela interface. Como o nome é único por marcenaria (inclusive entre inativos), também não era possível recadastrar o item, e uma inativação por engano só se desfazia direto no banco. Nenhum documento previa reativação, nem como evolução pós-TCC.

**Decisão.** Incluir a reativação na Spec 002, como parte de US04 e US05: `POST /materiais/:id/reativar` e `POST /servicos/:id/reativar`, sempre restritas à marcenaria da sessão (D001). O registro volta ao estado ativo com os mesmos dados; nada é recriado nem excluído (RNF10).

**Consequência.** Escopo da Spec 002 ampliado em três tarefas (T016–T018), sem regra de cálculo e sem tocar em orçamento. Orçamentos futuros continuam usando valores congelados no item (D004), portanto reativar não altera orçamentos já registrados. `requisitos.md` não foi alterado: a reativação é tratada como parte da manutenção da situação prevista em RF11, RF13 e RF17.

---

## D014 — Identidade visual e padrão de interface do frontend
**Data:** 2026-09-19 · **Situação:** firme

**Contexto.** As telas da Spec 001 e as primeiras da Spec 002 usavam o CSS de exemplo do Vite (tudo centralizado, roxo, título de 56 px), sem identidade própria e sem layout adequado a listas. A autora pediu um visual em verde e laranja, fora do padrão genérico, seguindo boas práticas de UX/UI. Não há requisito funcional novo: RNF05 e RNF26 (português do Brasil) seguem valendo.

**Decisão.** Adotar um único sistema visual, definido em `frontend/src/index.css` por variáveis CSS:
- **Cores:** papel kraft claro (`#f3eee3`) como fundo, verde musgo (`#1e4d38`) para estrutura e navegação, laranja de cedro (`#e8722d`) reservado às ações primárias e destaques, vermelho (`#9e2a1d`) só para erro.
- **Assinatura:** régua/trena no cabeçalho e no painel de acesso.
- **Tipografia:** Young Serif (títulos) e Figtree (texto), carregadas do Google Fonts, com fontes do sistema como reserva.
- **Estrutura:** cabeçalho comum às telas internas (`Layout`), moldura de entrada/cadastro (`PainelAcesso`), catálogo em tabela e, abaixo de 760 px, em blocos empilhados que mantêm Editar/Inativar à vista.
- **Acessibilidade:** texto escuro sobre o laranja (contraste ≈ 5:1), alvos de toque de 44 px, foco visível, rótulos em todos os campos, `role="alert"` nos erros.
- **Limites:** somente tema claro; nenhuma lógica de negócio nem cálculo no frontend (D005 preservada); valores exibidos como recebidos da API, só trocando `.` por `,`.

**Consequência.** Telas novas reutilizam as classes existentes (`pagina`, `folha`, `campos`, `alerta`, `selo`) em vez de criar estilo próprio. Trocar a paleta exige alterar apenas as variáveis de `:root`. Verificação: lint, build e teste do frontend, mais percurso completo do catálogo em 1280 px e 390 px sem rolagem horizontal (`evidencias/testes/002-catalogo-2026-09-19.md`). Fica pendente a avaliação de uso com o proprietário (OE7), que pode ajustar cores e textos.

---

## D013 — RF14 permanece no incremento 003
**Data:** 2026-09-19 · **Situação:** firme

**Contexto.** O roadmap posicionava RF14 no incremento 002, mas `requisitos.md` o posiciona no 003. RF14 exige garantir que a edição de custo não altere valores de orçamentos já registrados, entidade ainda inexistente no catálogo.

**Decisão.** A Spec 002 cobre RF11–RF13, RF15, RF17 e RF18. RF14 permanece no incremento 003, junto à composição e aos primeiros itens de orçamento.

**Consequência.** O catálogo entrega cadastro e manutenção sem antecipar dados de orçamento; o congelamento de valores será implementado e testado quando houver orçamento para preservar.

---

## D001 — Multi-tenant simples, um usuário por marcenaria
**Data:** 2026-09-02 · **Situação:** firme

**Contexto.** A proposta define o produto como SaaS, mas exclui do escopo "a operação com múltiplas empresas". As duas afirmações parecem conflitar.

**Decisão.** Interpretar assim: o sistema é multi-tenant — qualquer marcenaria cria sua conta e seus dados ficam isolados —, porém **um usuário pertence a uma única marcenaria** e não há troca de empresa dentro da sessão. É isso que a proposta exclui.

**Consequência.** Preserva a identidade SaaS para a banca sem ampliar o escopo. Gera RF04, RNF12 e os testes TI01–TI04. Papéis e equipes ficam como evolução futura.

---

## D002 — Margem e markup como modos explícitos e excludentes
**Data:** 2026-09-02 · **Situação:** firme — confirmada em 2026-09-28 com padrão alterado para markup (D017)

**Contexto.** A proposta cita "margem de lucro ou markup" sem definir qual das duas fórmulas o sistema aplica. São contas diferentes: com 30% sobre custo de R$ 1.931,10, margem dá R$ 2.758,71 e markup dá R$ 2.510,43.

**Decisão.** Implementar os dois modos, exigir escolha explícita na configuração (RF19) e exibir o rótulo do modo no memorial de cálculo. Padrão inicial: margem sobre o preço de venda, alinhado à definição do Sebrae (2020).

**Consequência.** A confusão entre os conceitos — apontada na justificativa da proposta como causa de prejuízo — vira um ponto de discussão da monografia em vez de um detalhe implícito. Custa um campo de configuração e dois casos de teste (CT03 e CT04).

---

## D003 — Arredondamento comercial sempre para cima
**Data:** 2026-09-02 · **Situação:** firme — confirmada em 2026-09-28 com padrão `duas_casas` (D017)

**Contexto.** A proposta exige "critério de arredondamento" definido, mas não o especifica.

**Decisão.** Arredondamento de linha e de preço bruto: meio para cima, 2 casas. Arredondamento comercial do preço final: configurável entre duas casas, real inteiro e dezena — nas duas últimas, sempre **para cima**.

**Consequência.** O preço final nunca fica abaixo do valor exigido pela margem pretendida. A diferença aparece no memorial como "ajuste de arredondamento", mantendo o cálculo conferível manualmente.

---

## D004 — Valores congelados no item do orçamento
**Data:** 2026-09-02 · **Situação:** firme

**Contexto.** Se o item apenas referenciasse o material, reajustar um custo alteraria retroativamente orçamentos entregues ao cliente.

**Decisão.** Copiar descrição, unidade e valor unitário para o item no momento da inclusão (RN08); guardar também os totais no orçamento registrado.

**Consequência.** Um orçamento consultado meses depois reproduz exatamente o valor apresentado ao cliente — condição para a rastreabilidade exigida na validação.

---

## D005 — Cálculo apenas no servidor, em decimal exato
**Data:** 2026-09-02 · **Situação:** firme

**Contexto.** Duplicar a fórmula no front-end para "resposta instantânea" é comum e é justamente como surgem divergências de centavos entre tela, PDF e teste.

**Decisão.** Uma única implementação, no módulo de domínio do servidor, em tipo decimal exato. A interface apenas envia a composição e exibe o retorno. Proibido ponto flutuante binário em qualquer camada (RNF07, RNF08).

**Consequência.** Elimina a principal causa provável de reprovação no critério de diferença nula. Custo: uma chamada de rede a cada alteração de item.

---

## D006 — Custos adicionais recebem lucro
**Data:** 2026-09-02 · **Situação:** firme — confirmada em 2026-09-28 (D017)

**Contexto.** Frete e deslocamento podem ser repassados a custo ou entrar na base de lucro.

**Decisão.** Entram no custo direto total e, portanto, recebem lucro (RN04).

**Consequência.** Simplifica a fórmula e o memorial. Se o marceneiro repassar frete sem lucro na prática, será necessário um campo "não aplicar lucro" no custo adicional — mudança pequena, mas que exige nova Spec.

---

## D007 — Stack: Node.js + TypeScript, React + TypeScript, PostgreSQL, em projetos separados
**Data:** 2026-09-02 · **Situação:** firme

**Contexto.** A ata orienta a manter abertura técnica na proposta, mas a estrutura de pastas precisa ser criada para o desenvolvimento começar. A proposta já indicava React, Node.js e PostgreSQL como direção.

**Decisão.** Confirmar essa direção e organizar o repositório em `backend/` e `frontend/` separados, com o domínio de cálculo isolado em `backend/src/dominio/orcamento/`.

**Alternativa rejeitada.** Projeto único full-stack (Next.js ou Express com templates): menos configuração, porém a fronteira entre domínio e interface fica menos evidente — e é justamente essa fronteira que garante o cálculo em lugar único (RNF08) e sustenta a argumentação na banca.

**Consequência.** Duas instalações de dependências e dois processos em desenvolvimento. Em troca, o domínio é testável isoladamente com os dez casos de referência, sem banco nem navegador. Bibliotecas específicas (PDF, validação, acesso a banco, framework de teste) continuam abertas e são decididas no incremento que as exigir.

---

## D008 — Spec Kit como motor do ciclo
**Data:** 2026-09-02 · **Situação:** firme — confirmado em 2026-09-18

**Contexto.** A ata apresenta Spec Kit e BMad Method como alternativas e recomenda escolher **uma** que a autora consiga operar com controle.

**Decisão.** Adotar Spec Kit, por estruturar explicitamente a passagem requisito → plano → tarefas → implementação, o que produz a rastreabilidade exigida na defesa.

**Consequência.** O ciclo Specify → Clarify → Plan → Tasks → Analyze → Implement passa a ser o procedimento padrão de cada incremento. O CLI oficial `specify` 1.0.8 foi instalado com integração Codex, criando `.specify/`, as skills em `.agents/skills/` e a constitution 1.0.0. Se a ferramenta se mostrar pesada para um projeto deste porte, a alternativa registrada é executar o mesmo ciclo manualmente com os templates em `specs/`.

---

## D009 — Skills próprias do projeto em `.claude/skills/`
**Data:** 2026-09-02 · **Situação:** firme

**Contexto.** A ata recomenda transformar procedimentos recorrentes em skills, mas apenas depois de compreendê-los, e alerta que skills vindas de outros projetos devem ser reescritas para não trazer instruções, nomes ou decisões alheias ao repositório.

**Decisão.** Criar três skills escritas especificamente para este projeto: `abrir-incremento`, `verificar-calculo` e `fechar-spec`. Nenhum conteúdo foi reaproveitado de skills de outros projetos — apenas a ideia de formato (frontmatter, etapas numeradas e lista de conferência final).

**Consequência.** Os três procedimentos que mais se repetem no TCC ficam padronizados e citáveis na monografia como parte do método. As skills devem ser revisadas ao fim do primeiro ciclo completo: procedimento que não se mostrar útil na prática é ajustado ou removido, não mantido por inércia.

---

## D010 — Bibliotecas e módulo do backend inicial
**Data:** 2026-09-18 · **Situação:** firme

**Contexto.** O incremento 000 precisava tornar executável a arquitetura aprovada em D007, preservando uma fronteira explícita entre HTTP, banco e o futuro domínio de cálculo.

**Decisão.** Usar Express para a API HTTP, `pg` para PostgreSQL, `decimal.js` para operações decimais exatas, Vitest para os testes e CommonJS como formato de módulos do backend. O `tsconfig` usa a resolução `node16`, compatível com TypeScript 7, enquanto o `type: "commonjs"` do pacote preserva a saída CommonJS. `tsx` executa TypeScript no desenvolvimento, sem introduzir uma etapa manual de compilação.

**Consequência.** A rota `/saude` verifica conjuntamente API e banco; valores `NUMERIC` do PostgreSQL permanecem texto na fronteira de infraestrutura até serem tratados pelo domínio em decimal exato. Os futuros cálculos continuam proibidos de usar `Number`.

---

## D011 — Execução progressiva dos testes de isolamento
**Data:** 2026-09-18 · **Situação:** firme

**Contexto.** TI01, TI02 e TI03 exigem, respectivamente, material, orçamento e cliente. Essas
entidades são entregues apenas nos incrementos 002, 004 e 005; criar dados equivalentes na Spec
001 só para executar os testes ampliaria artificialmente seu escopo.

**Decisão.** Executar TI04 na Spec 001, pois a autenticação existe nesta etapa. Executar TI01,
TI02 e TI03 no incremento que introduzir cada entidade e reexecutar os quatro testes no incremento
010, como consolidação final.

**Consequência.** Cada teste de isolamento permanece vinculado à funcionalidade que consegue
exercitá-lo de verdade, sem postergar a proteção de rotas nem criar funcionalidade de negócio
antecipada.

---

## D012 — Autenticação por JWT com sessão persistida
**Data:** 2026-09-19 · **Situação:** firme

**Contexto.** RF02 e RF03 exigem que a sessão permaneça válida até expirar ou receber logout. Um
JWT sem estado pode ser descartado no navegador, mas continua aceito pelo servidor até expirar.

**Decisão.** Usar JWT assinado e verificado, associado a uma sessão persistida. O token contém
somente identificadores de usuário, marcenaria e sessão; o middleware também confirma que a sessão
está ativa. Logout marca a sessão como encerrada. Senhas usam bcrypt assíncrono, e Zod valida as
entradas antes dos casos de uso.

**Consequência.** O logout invalida o acesso atual no servidor e a troca de senha pode encerrar
sessões anteriores. A implementação adiciona a entidade `sessao`, mas não adiciona papéis, múltiplos
usuários ou recuperação de senha.

---

## Questões em aberto (entrevista de levantamento — OE1)

Enquanto não respondidas, valem as decisões provisórias acima. Espelhadas em `BLOQUEIOS.md`. Q1–Q5 respondidas em D017; Q6–Q10 seguem em aberto.

| # | Pergunta | Impacto se a resposta for diferente do assumido |
|---|---|---|
| Q1 | Você calcula o lucro sobre o custo ou sobre o valor que o cliente paga? Qual percentual usa hoje? | Muda o padrão de D002 |
| Q2 | Como estima a mão de obra: por hora, por peça, por metro de móvel ou como percentual do material? | Pode exigir novo tipo de cobrança em `servico` (RF17) |
| Q3 | Material comprado em chapa e usado pela metade: cobra a chapa inteira ou só a parte usada? A sobra é aproveitada? | Pode antecipar o cálculo por aproveitamento, hoje fora do MVP |
| Q4 | Frete, deslocamento e instalação entram no preço com lucro ou são repassados a custo? | Muda D006 |
| Q5 | Costuma arredondar o preço final? Para real inteiro, dezena ou não arredonda? | Define o padrão de D003 |
| Q6 | Qual o prazo de validade que costuma dar ao orçamento? O que faz quando vence? | Ajusta RF22 e RN09 — **respondida pela autora em 2026-09-28: 10 dias (D024)** |
| Q7 | O que o cliente vê hoje: lista de itens com valores ou só o total? | Define o padrão de RF42 — **respondida pelo modelo de orçamento do proprietário (D022): descrição do que está incluído, sem valores, e o total** |
| Q8 | Quantos orçamentos faz por mês e quanto tempo leva em cada um? | Base de comparação para a observação de uso (RNF01) |
| Q9 | Já perdeu dinheiro por esquecer algum custo? Qual? | Evidência qualitativa forte para a justificativa da monografia |
| Q10 | Usa o computador na oficina ou apenas no escritório? Em qual tela? | Confirma ou revisa RNF05 |
