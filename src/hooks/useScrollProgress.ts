import { useEffect, useRef, useState } from "react";
import type { MutableRefObject, RefObject } from "react";
import { STAGE_THRESHOLDS } from "@/lib/shellStages";

// Abaixo disto o hero é estático: WebGL pinado em celular custa bateria e o
// scroll narrativo atrapalha mais do que entrega.
//
// Era 768 enquanto o coreografado era uma grid de duas colunas. O layout radial
// dimensiona o planeta pela ALTURA e os blocos pela LARGURA, então numa janela
// quadrada a casca externa passa por baixo do texto da Web2 e o torna ilegível.
// A 1024 de largura a sobreposição já é aceitável; abaixo disso o ramo estático
// entrega o mesmo conteúdo sem disputa de espaço.
export const STATIC_BREAKPOINT = 1024;

/**
 * Decide entre a versão animada e a estática. Chamado uma vez, na montagem:
 * alternar por resize remontaria a cena a cada giro de celular.
 */
export function prefersStaticHero(): boolean {
  if (typeof window === "undefined") return true;
  if (window.innerWidth < STATIC_BREAKPOINT) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function stageFromProgress(progress: number): number {
  let stage = 0;
  for (const threshold of STAGE_THRESHOLDS) {
    if (progress >= threshold) stage += 1;
  }
  return stage;
}

interface ScrollProgress {
  /** Contínuo, 0 a 1. Lido pelo WebGL a cada frame — não causa re-render. */
  progressRef: MutableRefObject<number>;
  /** Discreto, 0 a 5. Dirige as classes do HTML — seis re-renders no total. */
  stage: number;
}

export function useScrollProgress(
  containerRef: RefObject<HTMLElement>,
  enabled: boolean,
): ScrollProgress {
  const progressRef = useRef(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    let frameId: number | null = null;

    const measure = () => {
      frameId = null;

      const rect = container.getBoundingClientRect();
      // O curso útil é a altura do container menos a tela que fica parada.
      const travel = rect.height - window.innerHeight;
      const raw = travel > 0 ? -rect.top / travel : 0;
      const progress = Math.min(Math.max(raw, 0), 1);

      progressRef.current = progress;
      // setState com valor idêntico não re-renderiza, então não há guarda extra.
      setStage(stageFromProgress(progress));
    };

    const onScroll = () => {
      // Dedupe por frame: o evento de scroll dispara muito mais que 60x/s.
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [containerRef, enabled]);

  return { progressRef, stage };
}
