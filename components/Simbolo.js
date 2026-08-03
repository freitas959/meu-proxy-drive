/**
 * Símbolo da marca Carrossê: anel de 270° com uma seta na ponta — carrossel
 * (rotação) e swipe (avançar) no mesmo traço.
 *
 * Geometria copiada do manual de marca, não redesenhada:
 *   - viewBox 0 0 100 100, grupo com rotate(-8 50 50)
 *   - anel: arco de 270°, ponta cortada reta (stroke-linecap butt)
 *   - seta: encaixa exatamente em (50,16), a ponta do arco
 *
 * A inclinação de -8° faz parte da identidade — não é ajuste estético livre.
 * O manual também proíbe recolorir o símbolo com --swipe ou --zest: essas são
 * cores de conteúdo (badges dos cards), não de marca.
 */
export default function Simbolo({
  tamanho = 28,
  cor = "currentColor",
  className,
}) {
  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <g transform="rotate(-8 50 50)">
        <path
          d="M 84,50 A 34,34 0 1 1 50,16"
          fill="none"
          stroke={cor}
          strokeWidth="16"
          strokeLinecap="butt"
        />
        <polygon points="50,8 50,24 68,16" fill={cor} />
      </g>
    </svg>
  );
}
