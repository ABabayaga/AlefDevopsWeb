import Image from "next/image";
import { motion } from "framer-motion";
import { MORPH_MS, WIPE_MS } from "@/hooks/useIntroSequence";

// Vêm do hook em vez de repetidos aqui: as durações precisam bater com as
// fases da máquina de estados, e antes eram dois números soltos com um
// comentário pedindo sincronia manual.
const MORPH_S = MORPH_MS / 1000;
const WIPE_S = WIPE_MS / 1000;

/** Curva da viagem centro→header. */
const MORPH_EASE = [0.22, 1, 0.36, 1] as const;
/** Curva da varredura: a expo-out acima arranca rápido demais e o wordmark
 *  apareceria quase inteiro no primeiro terço. */
const WIPE_EASE = [0.33, 1, 0.68, 1] as const;

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
  /** Varredura de entrada — usada apenas na cópia grande da fase "reveal". */
  reveal?: boolean;
  className?: string;
}

/**
 * O lockup "Alef Devops": ícone + wordmark. Renderizado tanto no Header
 * (tamanho normal) quanto centralizado na cortina de carregamento (tamanho
 * grande) — o mesmo `layoutId` nos dois pontos é o que faz o Framer Motion
 * animar a troca de um para o outro como um único elemento em movimento.
 *
 * O `layoutId` só entra no grupo de nós compartilhados do Framer no mount do
 * nó de projeção. Passá-lo a um elemento que já está montado não registra
 * nada e o morph simplesmente não acontece — por isso o Header remonta este
 * componente (via `key`) no instante em que assume o `layoutId`.
 */
const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "sm",
  layoutId,
  reveal = false,
  className = "",
}) => {
  const s = SIZES[size];
  // Só quem participa do morph mede layout. Fora dele, `layout` faria o Framer
  // animar qualquer mudança de caixa que aparecesse — troca de idioma, carga
  // de fonte — com um movimento que ninguém pediu.
  const morphing = Boolean(layoutId);
  const childMorph = { duration: MORPH_S, ease: MORPH_EASE };

  return (
    <motion.div
      layoutId={layoutId}
      // A varredura descobre o lockup da esquerda pra direita: primeiro o chip,
      // depois o wordmark saindo letra a letra da máscara. Ela cabe inteira
      // dentro de REVEAL_MS, então quando a viagem começa o clip já está em 0%
      // e não tem como distorcer a projeção.
      // As quatro medidas em % nos dois estados de propósito: o Framer
      // interpola clip-path casando número a número, e misturar `0` cru com
      // `0%` muda a estrutura da string e derruba a interpolação.
      initial={reveal ? { clipPath: "inset(0% 100% 0% 0%)" } : false}
      animate={reveal ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
      transition={{
        layout: { duration: MORPH_S, ease: MORPH_EASE },
        default: { duration: WIPE_S, ease: WIPE_EASE },
      }}
      className={`flex items-center ${s.gap} text-fg ${className}`}
    >
      {/* Chip e wordmark também animam layout: a projeção do pai casa duas
          caixas de proporções diferentes (lg é mais larga em relação à altura
          que sm), e sem os filhos medindo por conta própria essa diferença
          vira esticão horizontal no meio da viagem.

          o SVG é fill="currentColor", mas como <img> ele vira um documento
          isolado e currentColor cai para preto — sem chip claro atrás, o
          glifo some no fundo escuro */}
      <motion.span
        layout={morphing}
        transition={childMorph}
        className={`flex ${s.chip} shrink-0 items-center justify-center rounded-md bg-fg`}
      >
        <Image src="/code-square.svg" width={s.icon} height={s.icon} alt="" />
      </motion.span>
      <motion.span
        layout={morphing}
        transition={childMorph}
        className={`type-display ${s.text} tracking-tight`}
      >
        Alef Devops
      </motion.span>
    </motion.div>
  );
};

export default BrandLogo;
