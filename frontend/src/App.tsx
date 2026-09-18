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
