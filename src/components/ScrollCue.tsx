/**
 * Mouse com a roda descendo e duas setas abaixo. Sinaliza que a cena do hero
 * não é a página inteira — sem isso, os 300vh de narrativa ficam invisíveis, e
 * agora que a barra de rolagem está oculta este é o único aviso de que a página
 * desce.
 *
 * SVG inline em vez de PNG: herda currentColor e dispensa o `invert` que os
 * ícones de traço em public/ precisam sobre o fundo escuro.
 */
const ScrollCue: React.FC = () => (
  <span aria-hidden className="scroll-cue flex flex-col items-center gap-2">
    <svg width="22" height="34" viewBox="0 0 22 34" fill="none">
      <rect
        x="0.75"
        y="0.75"
        width="20.5"
        height="32.5"
        rx="10.25"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <circle className="scroll-cue-wheel" cx="11" cy="9" r="1.75" fill="currentColor" />
    </svg>

    <span className="flex flex-col items-center gap-0.5">
      <svg className="scroll-cue-arrow" width="12" height="7" viewBox="0 0 12 7" fill="none">
        <path
          d="M1 1L6 6L11 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="scroll-cue-arrow" width="12" height="7" viewBox="0 0 12 7" fill="none">
        <path
          d="M1 1L6 6L11 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  </span>
);

export default ScrollCue;
