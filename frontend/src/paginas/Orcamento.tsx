import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Memorial } from '../componentes/Memorial'
import { listarMateriais, listarServicos, type Material, type Servico } from '../servicos/catalogo'
import {
  adicionarCustoAdicional, adicionarItem, alterarCabecalho, alterarItem, consultarOrcamento, exibirMoeda, exibirNumero,
  paraCampo, removerCustoAdicional, removerItem,
  type ModoLucro, type NovoItem, type Orcamento as DadosOrcamento, type RegraArredondamento, type TipoItem,
} from '../servicos/orcamentos'

const UNIDADES = ['un', 'm', 'm²', 'ml', 'ch', 'kg', 'L', 'pç', 'h']
const REGRAS: Record<RegraArredondamento, string> = {
  duas_casas: 'Não arredondar (centavos)',
  real_inteiro: 'Para cima, ao real inteiro',
  dezena: 'Para cima, à dezena',
}
type Origem = 'material' | 'servico' | 'avulso'

// Tela de composição do orçamento (US07–US11). Toda ação envia a alteração e troca o orçamento
// inteiro pela resposta da API, que já vem recalculada pelo servidor (D019). Esta tela não faz contas.
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
      <h1>{orcamento.descricaoProjeto}</h1>
      <p>Cliente: {orcamento.clienteNome} · <span className="selo">Rascunho</span></p>
    </div>

    {erro && <p role="alert" className="alerta">{erro}</p>}

    <section className="folha">
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
    </section>

    <section className="folha">
      <h2>Itens</h2>
      {orcamento.itens.length === 0 ? <p className="vazio">Nenhum item incluído.</p> : <div className="tabela-rolagem"><table>
        <thead><tr>
          <th>Item</th><th>Tipo</th><th>Quantidade</th><th>Valor unitário (R$)</th><th className="valor">Valor</th><th><span className="sr-only">Ações</span></th>
        </tr></thead>
        <tbody>{orcamento.itens.map((item) => {
          const formulario = `item-${item.id}`
          return <tr key={`${item.id}-${item.quantidade}-${item.valorUnitario}`}>
            <td>{item.descricao}{item.valorAjustadoManualmente && <small><span className="selo ajustado">Valor ajustado neste orçamento</span></small>}</td>
            <td data-label="Tipo">{item.tipo === 'material' ? 'Material' : 'Serviço'}</td>
            <td data-label="Quantidade"><span className="campo-com-unidade">
              <input form={formulario} name="quantidade" inputMode="decimal" aria-label={`Quantidade de ${item.descricao}`} defaultValue={exibirNumero(item.quantidade)} required />
              {item.unidade}
            </span></td>
            <td data-label="Valor unitário"><input form={formulario} name="valorUnitario" inputMode="decimal" aria-label={`Valor unitário de ${item.descricao}`} defaultValue={paraCampo(item.valorUnitario)} required /></td>
            <td className="valor" data-label="Valor">{exibirMoeda(item.valorLinha)}</td>
            <td className="acoes-linha">
              <form id={formulario} onSubmit={(evento) => atualizarItem(evento, item.id)}><button className="discreto">Atualizar</button></form>
              <button className="discreto" onClick={() => executar(removerItem(id, item.id))}>Remover</button>
            </td>
          </tr>
        })}</tbody>
      </table></div>}

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
    </section>

    <section className="folha">
      <h2>Custos adicionais</h2>
      <p className="ajuda">Frete, deslocamento, instalação e outros gastos de valor fixo. Eles entram no custo e recebem lucro.</p>
      {orcamento.custosAdicionais.length > 0 && <div className="tabela-rolagem"><table>
        <thead><tr><th>Descrição</th><th className="valor">Valor</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{orcamento.custosAdicionais.map((custo) => <tr key={custo.id}>
          <td>{custo.descricao}</td>
          <td className="valor" data-label="Valor">{exibirMoeda(custo.valor)}</td>
          <td className="acoes-linha"><button className="discreto" onClick={() => executar(removerCustoAdicional(id, custo.id))}>Remover</button></td>
        </tr>)}</tbody>
      </table></div>}
      <form onSubmit={incluirCusto}>
        <div className="campos">
          <label>Descrição<input name="descricao" placeholder="Ex.: frete de entrega" required /></label>
          <label>Valor (R$)<input name="valor" inputMode="decimal" placeholder="0,00" required /></label>
        </div>
        <div className="acoes"><button>Incluir custo</button></div>
      </form>
    </section>

    <section className="folha">
      <h2>Memorial de cálculo</h2>
      <p className="ajuda">Refaça estas contas na calculadora: o resultado é o mesmo.</p>
      <Memorial memorial={orcamento.memorial} modoLucro={orcamento.modoLucro} percentualLucro={orcamento.percentualLucro} />
    </section>
  </main>
}
