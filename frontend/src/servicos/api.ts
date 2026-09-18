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
