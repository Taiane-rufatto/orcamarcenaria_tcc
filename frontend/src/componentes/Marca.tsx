// Símbolo: um "O" de régua com marcações, ao lado do nome.
export function Marca() {
  return <span className="marca">
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="5" fill="#fbf8f1" />
      <path d="M6 24h20" stroke="#e8722d" strokeWidth="3" />
      <path d="M9 24v-3M13 24v-5M17 24v-3M21 24v-5" stroke="#1e4d38" strokeWidth="1.6" />
      <path d="M8 15V8h5.5a3.5 3.5 0 0 1 0 7H8" fill="none" stroke="#1e4d38" strokeWidth="2.2" />
    </svg>
    <span>Orça<b>Marcenaria</b></span>
  </span>
}
