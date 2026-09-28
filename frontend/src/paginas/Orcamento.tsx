import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Memorial } from '../componentes/Memorial'
import { listarMateriais, listarServicos, type Material, type Servico } from '../servicos/catalogo'
import {
  adicionarCustoAdicional, adicionarItem, alterarCabecalho, alterarItem, consultarOrcamento, exibirData, exibirMoeda, exibirNumero,
  mudarSituacao, paraCampo, registrarOrcamento, removerCustoAdicional, removerItem, SITUACOES,
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
  const [origem, setOrigem] = useState<Origem>('material')
  const [erro, setErro] = useState('')

  useEffect(() => {
    let atual = true
    Promise.all([consultarOrcamento(id), listarMateriais('', 'ativos'), listarServicos('', 'ativos')])
      .then(([dados, listaMateriais, listaServicos]) => {
        if (!atual) return
        setOrcamento(dados); setMateriais(listaMateriais); setServicos(listaServicos)
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

  // Registrar = enviar (D020): o número é atribuído e a edição trava. A confirmação evita registro por engano.
  function registrar() {
    if (!window.confirm('Registrar este orçamento? Ele recebe um número e os itens e valores não poderão mais ser alterados.')) return
    executar(registrarOrcamento(id))
  }

  function salvarCabecalho(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    executar(alterarCabecalho(id, {
      clienteNome: String(dados.get('clienteNome')),
      descricaoProjeto: String(dados.get('descricaoProjeto')),
      dataEmissao: String(dados.get('dataEmissao')),
      dataValidade: String(dados.get('dataValidade')),
      modoLucro: String(dados.get('modoLucro')) as ModoLucro,
      percentualLucro: String(dados.get('percentualLucro')),
      regraArredondamento: String(dados.get('regraArredondamento')) as RegraArredondamento,
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

  return <main className="pagina">
    <div className="cabecalho-pagina">
      <p><Link to="/orcamentos">← Orçamentos</Link></p>
      <h1>{orcamento.numero === null ? orcamento.descricaoProjeto : `Orçamento nº ${orcamento.numero}`}</h1>
      <p>
        {orcamento.numero !== null && <>{orcamento.descricaoProjeto} · </>}Cliente: {orcamento.clienteNome}
        {' · '}<span className={`selo ${orcamento.situacao}`}>{SITUACOES[orcamento.situacao]}</span>
      </p>
    </div>

    {erro && <p role="alert" className="alerta">{erro}</p>}

    <section className="folha">
      <h2>Situação</h2>
      {orcamento.situacao === 'rascunho' && <>
        <p className="ajuda">Quando o orçamento estiver pronto, registre-o. Ele recebe um número, passa a "Enviado" e os itens e valores ficam travados.</p>
        <div className="acoes"><button onClick={registrar}>Registrar e marcar como enviado</button></div>
      </>}
      {orcamento.situacao === 'enviado' && <>
        <p className="ajuda">Enviado ao cliente, válido até {exibirData(orcamento.dataValidade)}. Registre a resposta dele:</p>
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
      </dl>
    </section>}

    {editavel && <section className="folha">
      <h2>Dados e lucro</h2>
      {/* key: após salvar, o formulário volta a mostrar o que a API gravou */}
      <form key={JSON.stringify([orcamento.clienteNome, orcamento.descricaoProjeto, orcamento.dataEmissao, orcamento.dataValidade, orcamento.modoLucro, orcamento.percentualLucro, orcamento.regraArredondamento])} onSubmit={salvarCabecalho}>
        <div className="campos">
          <label>Cliente<input name="clienteNome" defaultValue={orcamento.clienteNome} required /></label>
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
        {orcamento.memorial.multiplicadorEquivalente && <p className="aviso" style={{ marginTop: 16 }}>
          Markup de {paraCampo(orcamento.percentualLucro)}% equivale a cobrar {paraCampo(orcamento.memorial.multiplicadorEquivalente)}× o custo.
          Para cobrar 2,5× o custo, informe 150%.
        </p>}
        <div className="acoes"><button>Salvar dados e lucro</button></div>
      </form>
    </section>}

    <section className="folha">
      <h2>Itens</h2>
      {orcamento.itens.length === 0 ? <p className="vazio">Nenhum item incluído.</p> : <div className="tabela-rolagem"><table>
        <thead><tr>
          <th>Item</th><th>Tipo</th><th>Quantidade</th><th>Valor unitário (R$)</th><th className="valor">Valor</th>{editavel && <th><span className="sr-only">Ações</span></th>}
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
        <div className="campos">
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
          </> : <label className="largo">{origem === 'material' ? 'Material' : 'Serviço'}
            <select name="catalogoId" required>
              {catalogo.length === 0 && <option value="">Nenhum cadastro ativo</option>}
              {catalogo.map((c) => <option key={c.id} value={c.id}>
                {c.nome} — {exibirMoeda('custo_unitario' in c ? c.custo_unitario : c.valor_unitario)}
              </option>)}
            </select>
          </label>}
          <label>Quantidade<input name="quantidade" inputMode="decimal" placeholder="Ex.: 2,5" required /></label>
        </div>
        <div className="acoes"><button>Incluir item</button></div>
      </form>
      </>}
    </section>

    <section className="folha">
      <h2>Custos adicionais</h2>
      <p className="ajuda">Frete, deslocamento, instalação e outros gastos de valor fixo. Eles entram no custo e recebem lucro.</p>
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
        <div className="campos">
          <label>Descrição<input name="descricao" placeholder="Ex.: frete de entrega" required /></label>
          <label>Valor (R$)<input name="valor" inputMode="decimal" placeholder="0,00" required /></label>
        </div>
        <div className="acoes"><button>Incluir custo</button></div>
      </form>}
    </section>

    <section className="folha">
      <h2>Memorial de cálculo</h2>
      <p className="ajuda">Refaça estas contas na calculadora: o resultado é o mesmo.</p>
      <Memorial memorial={orcamento.memorial} modoLucro={orcamento.modoLucro} percentualLucro={orcamento.percentualLucro} />
    </section>
  </main>
}
