const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'
const CHAVE_TOKEN = 'orcamarcenaria.token'

export type Autenticacao = { token: string; usuario: { id: string; nome: string; email: string; marcenariaId: string } }
type DadosCadastro = { nomeMarcenaria: string; nomeResponsavel: string; email: string; senha: string }

async function chamar<T>(rota: string, opcoes: RequestInit): Promise<T> {
  const resposta = await fetch(`${URL_API}${rota}`, { ...opcoes, headers: { 'Content-Type': 'application/json', ...opcoes.headers } })
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => null) as { mensagem?: string } | null
    throw new Error(corpo?.mensagem ?? `A API respondeu ${resposta.status}`)
  }
  return resposta.status === 204 ? undefined as T : resposta.json() as Promise<T>
}
export const tokenAtual = () => sessionStorage.getItem(CHAVE_TOKEN)
export const guardarSessao = (sessao: Autenticacao) => sessionStorage.setItem(CHAVE_TOKEN, sessao.token)
export const cadastrar = (dados: DadosCadastro) => chamar<Autenticacao>('/auth/cadastro', { method: 'POST', body: JSON.stringify(dados) })
export const entrar = (email: string, senha: string) => chamar<Autenticacao>('/auth/entrar', { method: 'POST', body: JSON.stringify({ email, senha }) })
export async function sair() { const token = tokenAtual(); if (token) await chamar<void>('/auth/sair', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); sessionStorage.removeItem(CHAVE_TOKEN) }
export async function alterarSenha(senhaAtual: string, novaSenha: string) { const resultado = await chamar<Autenticacao>('/auth/senha', { method: 'PUT', headers: { Authorization: `Bearer ${tokenAtual()}` }, body: JSON.stringify({ senhaAtual, novaSenha }) }); guardarSessao(resultado); return resultado }
