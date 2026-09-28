import { tokenAtual } from './autenticacao'

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

// Chamada autenticada à API. Erros chegam com a mensagem em português definida no servidor.
export async function requisitar<T>(rota: string, metodo = 'GET', corpo?: unknown): Promise<T> {
  const resposta = await fetch(`${URL_API}${rota}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenAtual()}` },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  })
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => null) as { mensagem?: string } | null
    throw new Error(erro?.mensagem ?? `A API respondeu ${resposta.status}`)
  }
  return resposta.status === 204 ? undefined as T : resposta.json() as Promise<T>
}
