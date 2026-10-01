import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CampoBusca } from '../componentes/CampoBusca'
import { Memorial } from '../componentes/Memorial'
import { listarMateriais, listarServicos, type Material, type Servico } from '../servicos/catalogo'
import { listarClientes, type Cliente } from '../servicos/clientes'
import {
  adicionarCustoAdicional, adicionarItem, alterarCabecalho, alterarItem, consultarOrcamento, exibirData, exibirMoeda, exibirNumero,
  baixarPdf, mudarSituacao, paraCampo, registrarOrcamento, removerCustoAdicional, removerItem, SITUACOES,
  type ModoLucro, type NovoItem, type Orcamento as DadosOrcamento, type RegraArredondamento, type TipoItem,
} from '../servicos/orcamentos'

const UNIDADES = ['un', 'm', 'm²', 'ml', 'ch', 'kg', 'L', 'pç', 'h']
const REGRAS: Record<RegraArredondamento, string> = {
  duas_casas: 'Não arredondar (centavos)',
  real_inteiro: 'Para cima, ao real inteiro',
  dezena: 'Para cima, à dezena',
}
type Origem = 'material' | 'servico' | 'avulso'

// Tela de composição do orçamento (US07–US11) e do seu acompanhamento (US12, US13). Toda ação envia a
// alteração e troca o orçamento inteiro pela resposta da API, que já vem recalculada pelo servidor (D019).
// Esta tela não faz contas. Fora de rascunho, é somente leitura: só a situação muda (RF39).
export function Orcamento() {
  const { id = '' } = useParams()
  const [orcamento, setOrcamento] = useState<DadosOrcamento | null>(null)
  const [materiais, setMateriais] = useState<Material[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [origem, setOrigem] = useState<Origem>('material')
  const [erro, setErro] = useState('')
  // Padrão sem a lista de materiais, como no modelo de orçamento do proprietário (Q7, D022).
  const [mostrarItensPdf, setMostrarItensPdf] = useState(false)
  // Textos para o cliente: controlados aqui para não se perderem ao registrar sem salvar.
  const [textos, setTextos] = useState({ especificacoes: '', observacoes: '' })
  const [baixando, setBaixando] = useState(false)

  useEffect(() => {
    let atual = true
    Promise.all([consultarOrcamento(id), listarMateriais('', 'ativos'), listarServicos('', 'ativos'), listarClientes('', 'ativos')])
      .then(([dados, listaMateriais, listaServicos, listaClientes]) => {
        if (!atual) return
        setOrcamento(dados); setMateriais(listaMateriais); setServicos(listaServicos); setClientes(listaClientes)
        setTextos({ especificacoes: dados.especificacoes, observacoes: dados.observacoes })
      })
      .catch((causa) => { if (atual) setErro(causa instanceof Error ? causa.message : 'Não foi possível carregar o orçamento') })
    return () => { atual = false }
  }, [id])

  // Executa uma alteração; em caso de sucesso, a resposta substitui o orçamento exibido.
  async function executar(acao: Promise<DadosOrcamento>): Promise<boolean> {
    try {
      setOrcamento(await acao)
      setErro('')
      return true
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : 'Não foi possível salvar a alteração')
      return false
    }
  }

  if (!orcamento) {
    return <main className="pagina">{erro ? <p role="alert" className="alerta">{erro}</p> : <p>Carregando orçamento…</p>}</main>
  }

  const editavel = orcamento.situacao === 'rascunho'
  const textosPendentes = textos.especificacoes !== orcamento.especificacoes || textos.observacoes !== orcamento.observacoes

  // Cabeçalho gravado + textos da tela: salvar os textos não mexe nos demais dados.
  const cabecalhoAtual = (o: DadosOrcamento) => ({
    clienteId: o.clienteId, descricaoProjeto: o.descricaoProjeto, dataEmissao: o.dataEmissao, dataValidade: o.dataValidade,
    modoLucro: o.modoLucro, percentualLucro: o.percentualLucro, regraArredondamento: o.regraArredondamento, ...textos,
  })

  async function salvarTextos(): Promise<boolean> {
    try {
      const salvo = await alterarCabecalho(id, cabecalhoAtual(orcamento!))
      setOrcamento(salvo)
      setTextos({ especificacoes: salvo.especificacoes, observacoes: salvo.observacoes })
      setErro('')
      return true
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : 'Não foi possível salvar os textos')
      return false
    }
  }

  // RF43: baixa o PDF gerado no servidor e o salva com o número do orçamento.
  async function baixar() {
    setBaixando(true)
    try {
      const arquivo = await baixarPdf(id, mostrarItensPdf)
      const endereco = URL.createObjectURL(arquivo)
      const link = document.createElement('a')
      link.href = endereco
      link.download = `orcamento-${orcamento!.numero}.pdf`
      link.click()
      URL.revokeObjectURL(endereco)
      setErro('')
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : 'Não foi possível gerar o PDF')
    } finally {
      setBaixando(false)
    }
  }

  // Registrar = enviar (D020): o número é atribuído e a edição trava. A confirmação evita registro por engano.
  // Textos ainda não salvos são gravados antes, para não se perderem.
  async function registrar() {
    if (!window.confirm('Registrar este orçamento? Ele recebe um número e os itens, valores e textos não poderão mais ser alterados.')) return
    if (textosPendentes && !await salvarTextos()) return
    executar(registrarOrcamento(id))
  }

  function salvarCabecalho(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    executar(alterarCabecalho(id, {
      clienteId: String(dados.get('clienteId')),
      descricaoProjeto: String(dados.get('descricaoProjeto')),
      dataEmissao: String(dados.get('dataEmissao')),
      dataValidade: String(dados.get('dataValidade')),
      modoLucro: String(dados.get('modoLucro')) as ModoLucro,
      percentualLucro: String(dados.get('percentualLucro')),
      regraArredondamento: String(dados.get('regraArredondamento')) as RegraArredondamento,
      ...textos,
    }))
  }

  async function incluirItem(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    const quantidade = String(dados.get('quantidade'))
    const item: NovoItem = origem === 'avulso'
      ? {
          origem: 'avulso', tipo: String(dados.get('tipo')) as TipoItem, descricao: String(dados.get('descricao')),
          unidade: String(dados.get('unidade')), quantidade, valorUnitario: String(dados.get('valorUnitario')),
        }
      : { origem: 'catalogo', tipo: origem, catalogoId: String(dados.get('catalogoId')), quantidade }
    if (await executar(adicionarItem(id, item))) formulario.reset()
  }

  function atualizarItem(evento: FormEvent<HTMLFormElement>, itemId: string) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    executar(alterarItem(id, itemId, String(dados.get('quantidade')), String(dados.get('valorUnitario'))))
  }

  async function incluirCusto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    if (await executar(adicionarCustoAdicional(id, String(dados.get('descricao')), String(dados.get('valor'))))) formulario.reset()
  }

  const catalogo = origem === 'material' ? materiais : servicos

  return <main className="pagina pagina-orcamento">
    <div className="cabecalho-pagina">
      <Link to="/orcamentos" className="voltar"><span aria-hidden="true">←</span> Orçamentos</Link>
      <h1>{orcamento.numero === null ? orcamento.descricaoProjeto : `Orçamento nº ${orcamento.numero}`}</h1>
      <p>
        {orcamento.numero !== null && <>{orcamento.descricaoProjeto} · </>}Cliente: {orcamento.clienteNome}
        {' · '}<span className={`selo ${orcamento.situacao}`}>{SITUACOES[orcamento.situacao]}</span>
      </p>
    </div>

    {/* composição no centro; situação, PDF e memorial na coluna à direita, que acompanha a rolagem (D026) */}
    <div className="coluna-principal">
      {erro && <p role="alert" className="alerta">{erro}</p>}

      {!editavel && <section className="folha">
        <h2>Dados e lucro</h2>
        <dl className="resumo">
          <div><dt>Cliente</dt><dd>{orcamento.clienteNome}</dd></div>
          <div><dt>Projeto</dt><dd>{orcamento.descricaoProjeto}</dd></div>
          <div><dt>Emissão</dt><dd>{exibirData(orcamento.dataEmissao)}</dd></div>
          <div><dt>Válido até</dt><dd>{exibirData(orcamento.dataValidade)}</dd></div>
          <div><dt>Lucro</dt><dd>
            {orcamento.modoLucro === 'markup' ? 'Markup' : 'Margem'} de {paraCampo(orcamento.percentualLucro)}%
            {orcamento.memorial.multiplicadorEquivalente && ` (${paraCampo(orcamento.memorial.multiplicadorEquivalente)}× o custo)`}
          </dd></div>
          <div><dt>Arredondamento</dt><dd>{REGRAS[orcamento.regraArredondamento]}</dd></div>
          {orcamento.especificacoes && <div className="largo"><dt>Especificações</dt><dd className="texto-livre">{orcamento.especificacoes}</dd></div>}
          {orcamento.observacoes && <div className="largo"><dt>Observações</dt><dd className="texto-livre">{orcamento.observacoes}</dd></div>}
        </dl>
      </section>}

      {editavel && <section className="folha">
        <h2>Dados e lucro</h2>
        {/* key: após salvar, o formulário volta a mostrar o que a API gravou */}
        <form key={JSON.stringify([orcamento.clienteId, orcamento.descricaoProjeto, orcamento.dataEmissao, orcamento.dataValidade, orcamento.modoLucro, orcamento.percentualLucro, orcamento.regraArredondamento])} onSubmit={salvarCabecalho}>
          <div className="campos">
            {/* D021: troca só para cliente ativo; o atual aparece mesmo se tiver sido inativado depois */}
            <CampoBusca rotulo="Cliente" name="clienteId" required valorInicial={orcamento.clienteId} opcoes={[
              ...(clientes.some((c) => c.id === orcamento.clienteId) ? [] : [{ valor: orcamento.clienteId, rotulo: `${orcamento.clienteNome} (inativo)` }]),
              ...clientes.map((c) => ({ valor: c.id, rotulo: c.nome, detalhe: c.telefone ?? undefined })),
            ]} />
            <label>Descrição do projeto<input name="descricaoProjeto" defaultValue={orcamento.descricaoProjeto} required /></label>
            <label>Data de emissão<input name="dataEmissao" type="date" defaultValue={orcamento.dataEmissao} required /></label>
            <label>Válido até<input name="dataValidade" type="date" defaultValue={orcamento.dataValidade} required /></label>
            <label>Forma de lucro
              <select name="modoLucro" defaultValue={orcamento.modoLucro}>
                <option value="markup">Markup — sobre o custo</option>
                <option value="margem">Margem — sobre o preço de venda</option>
              </select>
            </label>
            <label>Percentual de lucro (%)<input name="percentualLucro" inputMode="decimal" defaultValue={paraCampo(orcamento.percentualLucro)} required /></label>
            <label>Arredondamento do preço
              <select name="regraArredondamento" defaultValue={orcamento.regraArredondamento}>
                {Object.entries(REGRAS).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
              </select>
            </label>
          </div>
          {orcamento.memorial.multiplicadorEquivalente && <p className="ajuda" style={{ margin: '12px 0 0' }}>
            Markup de {paraCampo(orcamento.percentualLucro)}% = {paraCampo(orcamento.memorial.multiplicadorEquivalente)}× o custo. Para cobrar 2,5× o custo, informe 150%.
          </p>}
          <div className="acoes"><button>Salvar dados e lucro</button></div>
        </form>
      </section>}

      {editavel && <section className="folha">
        <h2>Texto para o cliente</h2>
        <p className="ajuda">Sai no PDF. Linhas com "-" viram marcadores; terminadas em ":", subtítulos.</p>
        <div className="campos">
          <label className="largo">Especificações (o que está incluído)
            <textarea rows={8} maxLength={4000} value={textos.especificacoes}
              onChange={(e) => setTextos({ ...textos, especificacoes: e.target.value })}
              placeholder={'Armário com cinco portas\n- Canto em 45°\n\nFerragens e acabamentos:\n- Dobradiça anti-impacto'} />
          </label>
          <label className="largo">Observações (prazo, pagamento, garantia)
            <textarea rows={3} maxLength={1000} value={textos.observacoes}
              onChange={(e) => setTextos({ ...textos, observacoes: e.target.value })}
              placeholder="Ex.: entrega em 20 dias úteis; 50% na aprovação e 50% na entrega" />
          </label>
        </div>
        {/* Sem pendência, o botão some e a tela diz que está tudo salvo: botão apagado parecia "carregando". */}
        <div className="acoes">
          {textosPendentes
            ? <><button onClick={salvarTextos}>Salvar textos</button><span className="ajuda" style={{ margin: 0, alignSelf: 'center' }}>Alterações não salvas</span></>
            : <span className="salvo" role="status">✓ Textos salvos</span>}
        </div>
      </section>}

      <section className="folha">
        <h2>Itens</h2>
        {orcamento.itens.length === 0 ? <p className="vazio">Nenhum item incluído.</p> : <div className="tabela-rolagem"><table>
          <thead><tr>
            <th>Item</th><th>Tipo</th><th>Quantidade</th><th>Valor unit. (R$)</th><th className="valor">Valor</th>{editavel && <th><span className="sr-only">Ações</span></th>}
          </tr></thead>
          <tbody>{orcamento.itens.map((item) => {
            const formulario = `item-${item.id}`
            return <tr key={`${item.id}-${item.quantidade}-${item.valorUnitario}`}>
              <td>{item.descricao}{item.valorAjustadoManualmente && <small><span className="selo ajustado">Valor ajustado neste orçamento</span></small>}</td>
              <td data-label="Tipo">{item.tipo === 'material' ? 'Material' : 'Serviço'}</td>
              {editavel ? <>
                <td data-label="Quantidade"><span className="campo-com-unidade">
                  <input form={formulario} name="quantidade" inputMode="decimal" aria-label={`Quantidade de ${item.descricao}`} defaultValue={exibirNumero(item.quantidade)} required />
                  {item.unidade}
                </span></td>
                <td data-label="Valor unitário"><input form={formulario} name="valorUnitario" inputMode="decimal" aria-label={`Valor unitário de ${item.descricao}`} defaultValue={paraCampo(item.valorUnitario)} required /></td>
              </> : <>
                <td data-label="Quantidade">{exibirNumero(item.quantidade)} {item.unidade}</td>
                <td data-label="Valor unitário">{paraCampo(item.valorUnitario)}</td>
              </>}
              <td className="valor" data-label="Valor">{exibirMoeda(item.valorLinha)}</td>
              {editavel && <td className="acoes-linha">
                <form id={formulario} onSubmit={(evento) => atualizarItem(evento, item.id)}><button className="discreto">Atualizar</button></form>
                <button className="discreto" onClick={() => executar(removerItem(id, item.id))}>Remover</button>
              </td>}
            </tr>
          })}</tbody>
        </table></div>}

        {editavel && <>
        <h3 className="subtitulo">Incluir item</h3>
        <form key={origem} onSubmit={incluirItem}>
          <div className={origem === 'avulso' ? 'campos' : 'campos em-linha'}>
            <label>Origem
              <select value={origem} onChange={(e) => setOrigem(e.target.value as Origem)}>
                <option value="material">Material do catálogo</option>
                <option value="servico">Serviço do catálogo</option>
                <option value="avulso">Item avulso (fora do catálogo)</option>
              </select>
            </label>
            {origem === 'avulso' ? <>
              <label>Tipo<select name="tipo"><option value="material">Material</option><option value="servico">Serviço</option></select></label>
              <label>Descrição<input name="descricao" required /></label>
              <label>Unidade<select name="unidade">{UNIDADES.map((u) => <option key={u}>{u}</option>)}</select></label>
              <label>Valor unitário (R$)<input name="valorUnitario" inputMode="decimal" placeholder="0,00" required /></label>
            </> : <CampoBusca rotulo={origem === 'material' ? 'Material' : 'Serviço'} name="catalogoId" required
              placeholder={origem === 'material' ? 'Digite para buscar o material…' : 'Digite para buscar o serviço…'}
              vazio={origem === 'material' ? 'Nenhum material ativo no catálogo' : 'Nenhum serviço ativo no catálogo'}
              opcoes={catalogo.map((c) => ({ valor: c.id, rotulo: c.nome, detalhe: exibirMoeda('custo_unitario' in c ? c.custo_unitario : c.valor_unitario) }))} />}
            <label>Quantidade<input name="quantidade" inputMode="decimal" placeholder="Ex.: 2,5" required /></label>
            <button>Incluir item</button>
          </div>
        </form>
        </>}
      </section>

      <section className="folha">
        <h2>Custos adicionais</h2>
        <p className="ajuda">Frete, instalação e outros gastos fixos. Entram no custo e recebem lucro.</p>
        {!editavel && orcamento.custosAdicionais.length === 0 && <p className="vazio">Nenhum custo adicional.</p>}
        {orcamento.custosAdicionais.length > 0 && <div className="tabela-rolagem"><table>
          <thead><tr><th>Descrição</th><th className="valor">Valor</th>{editavel && <th><span className="sr-only">Ações</span></th>}</tr></thead>
          <tbody>{orcamento.custosAdicionais.map((custo) => <tr key={custo.id}>
            <td>{custo.descricao}</td>
            <td className="valor" data-label="Valor">{exibirMoeda(custo.valor)}</td>
            {editavel && <td className="acoes-linha"><button className="discreto" onClick={() => executar(removerCustoAdicional(id, custo.id))}>Remover</button></td>}
          </tr>)}</tbody>
        </table></div>}
        {editavel && <form onSubmit={incluirCusto}>
          <div className="campos em-linha-custo">
            <label>Descrição<input name="descricao" placeholder="Ex.: frete de entrega" required /></label>
            <label>Valor (R$)<input name="valor" inputMode="decimal" placeholder="0,00" required /></label>
            <button>Incluir custo</button>
          </div>
        </form>}
      </section>
    </div>

    <aside className="coluna-resumo" aria-label="Situação e preço">
      <section className="folha">
        <h2>Situação</h2>
        {orcamento.situacao === 'rascunho' && <>
          <p className="ajuda">Ao registrar, o orçamento recebe número e não pode mais ser alterado.</p>
          <div className="acoes"><button onClick={registrar}>Registrar e marcar como enviado</button></div>
        </>}
        {orcamento.situacao === 'enviado' && <>
          <p className="ajuda">Válido até {exibirData(orcamento.dataValidade)}. Qual foi a resposta do cliente?</p>
          <div className="acoes">
            <button onClick={() => executar(mudarSituacao(id, 'aprovado'))}>Cliente aprovou</button>
            <button className="secundario" onClick={() => executar(mudarSituacao(id, 'recusado'))}>Cliente recusou</button>
          </div>
        </>}
        {orcamento.situacao === 'aprovado' && <p className="ajuda">O cliente aprovou este orçamento.</p>}
        {orcamento.situacao === 'recusado' && <p className="ajuda">O cliente recusou este orçamento.</p>}
        {orcamento.situacao === 'vencido' && <p className="ajuda">A validade terminou em {exibirData(orcamento.dataValidade)} sem resposta do cliente.</p>}
      </section>

      {!editavel && <section className="folha">
        <h2>PDF para o cliente</h2>
        <p className="ajuda">Sem custos, lucro ou valor por item.</p>
        <div className="opcoes">
          <label><input type="checkbox" checked={mostrarItensPdf} onChange={(e) => setMostrarItensPdf(e.target.checked)} /> Incluir a lista de itens (só quantidades)</label>
        </div>
        <div className="acoes"><button onClick={baixar} disabled={baixando} aria-busy={baixando}>{baixando ? 'Gerando PDF…' : 'Baixar PDF'}</button></div>
      </section>}

      <section className="folha">
        <h2>Memorial de cálculo</h2>
        <Memorial memorial={orcamento.memorial} />
      </section>
    </aside>
  </main>
}
