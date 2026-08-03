import Image from "next/image";
import { motion } from "framer-motion";

/** Duração do fade+scale de entrada na fase "reveal" da intro. */
const REVEAL_S = 0.55;
/** Duração da viagem centro→header. Igual a MORPH_MS em useIntroSequence. */
const MORPH_S = 0.7;
const EASE = [0.22, 1, 0.36, 1] as const;

const SIZES = {
  sm: {
    chip: "h-7 w-7",
    icon: 17,
    text: "text-[1.05rem]",
    gap: "gap-2.5",
  },
  lg: {
    chip: "h-14 w-14 sm:h-16 sm:w-16",
    icon: 34,
    text: "text-[clamp(1.75rem,6vw,3rem)]",
    gap: "gap-4",
  },
} as const;

interface BrandLogoProps {
  size?: keyof typeof SIZES;
  /** Presente só quando este é o elo ativo do morph compartilhado. */
  layoutId?: string;
  /** Fade+scale de entrada — usado apenas na cópia grande da fase "reveal". */
  reveal?: boolean;
  className?: string;
}

/**
 * O lockup "Alef Devops": ícone + wordmark. Renderizado tanto no Header
 * (tamanho normal) quanto centralizado na cortina de carregamento (tamanho
 * grande) — o mesmo `layoutId` nos dois pontos é o que faz o Framer Motion
 * animar a troca de um para o outro como um único elemento em movimento.
 */
const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "sm",
  layoutId,
  reveal = false,
  className = "",
}) => {
  const s = SIZES[size];

  return (
    <motion.div
      layoutId={layoutId}
      initial={reveal ? { opacity: 0, scale: 0.85 } : false}
      animate={reveal ? { opacity: 1, scale: 1 } : undefined}
      transition={{
        layout: { duration: MORPH_S, ease: EASE },
        default: { duration: REVEAL_S, ease: EASE },
      }}
      className={`flex items-center ${s.gap} text-fg ${className}`}
    >
      {/* o SVG é fill="currentColor", mas como <img> ele vira um documento
          isolado e currentColor cai para preto — sem chip claro atrás, o
          glifo some no fundo escuro */}
      <span
        className={`flex ${s.chip} shrink-0 items-center justify-center rounded-md bg-fg`}
      >
        <Image src="/code-square.svg" width={s.icon} height={s.icon} alt="" />
      </span>
      <span className={`type-display ${s.text} tracking-tight`}>Alef Devops</span>
    </motion.div>
  );
};

export default BrandLogo;
