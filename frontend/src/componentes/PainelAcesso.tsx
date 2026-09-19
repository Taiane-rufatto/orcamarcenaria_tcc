import type { ReactNode } from 'react'
import { Marca } from './Marca'

// Moldura das telas de entrada e cadastro: painel verde à esquerda, formulário à direita.
export function PainelAcesso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return <main className="acesso">
    <section className="acesso-lateral">
      <Marca />
      <div>
        <h2>Orçamento feito na bancada, <em>sem improviso.</em></h2>
        <p>Materiais, serviços e margem organizados para você fechar o preço com segurança.</p>
      </div>
    </section>
    <section className="acesso-form">
      <div>
        <h1>{titulo}</h1>
        {children}
      </div>
    </section>
  </main>
}
