// Símbolo: um "O" de régua com marcações, ao lado do nome. Fundo e traço vêm do CSS;
// só a régua laranja é fixa.
export function Marca() {
  return <span className="marca">
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect className="marca-fundo" width="32" height="32" rx="6" />
      <path d="M6 24h20" stroke="#d9733a" strokeWidth="3" />
      <path className="marca-traco" d="M9 24v-3M13 24v-5M17 24v-3M21 24v-5" strokeWidth="1.6" />
      <path className="marca-traco" d="M8 15V8h5.5a3.5 3.5 0 0 1 0 7H8" fill="none" strokeWidth="2.2" />
    </svg>
    <span>Orça<b>Marcenaria</b></span>
  </span>
}
