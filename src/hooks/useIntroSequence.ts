import { useEffect, useState } from "react";
import { useIntroProgress } from "@/hooks/useIntroProgress";

export type IntroPhase = "pending" | "loading" | "reveal" | "morphing" | "done";

/** Marca no sessionStorage. O mesmo nome é lido pelo script do _document. */
const SEEN_KEY = "intro-seen";

/** Tempo que o logo grande fica parado no centro antes de migrar pro header. */
export const REVEAL_MS = 550;
/** Duração da viagem centro→header e do fade da cortina. */
export const MORPH_MS = 700;

/**
 * Storage pode estar bloqueado (modo privado, cookies desligados) e o acesso
 * lança. Nesses casos a intro simplesmente reaparece — não é motivo para
 * derrubar a página.
 */
function readSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

interface IntroSequence {
  phase: IntroPhase;
  /** Válido durante "loading"; nas outras fases não é mais lido. */
  percent: number;
  stage: number;
}

/**
 * Fonte única da sequência intro→logo→hero, compartilhada por Intro, Header
 * e Hero (levantada até index.tsx). "pending" é o valor de servidor/primeiro
 * render do cliente — igual nos dois, então não há mismatch de hidratação — e
 * é tratado como "conteúdo final visível" por Header/Hero, exatamente o que
 * já é servido sem JS. Só depois do efeito decidir que vai animar é que a
 * máquina avança para "loading" e, mais tarde, oculta e revela por conta
 * própria.
 */
export function useIntroSequence(): IntroSequence {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<IntroPhase>("pending");
  const { percent, stage, done } = useIntroProgress(enabled === true);

  useEffect(() => {
    const skip =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || readSeen();

    if (skip) {
      setEnabled(false);
      setPhase("done");
      return;
    }

    setEnabled(true);
    setPhase("loading");
  }, []);

  useEffect(() => {
    if (!done || phase !== "loading") return;
    setPhase("reveal");
  }, [done, phase]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const timer = window.setTimeout(() => setPhase("morphing"), REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "morphing") return;
    const timer = window.setTimeout(() => {
      setPhase("done");
      window.scrollTo(0, 0);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Storage bloqueado: a intro simplesmente volta na próxima navegação.
      }
    }, MORPH_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // A trava de rolagem depende de `phase`, não do ciclo de vida do componente:
  // sem isso a coreografia de 300vh do hero avança por trás da cortina e o
  // visitante sai dela já no meio da narrativa.
  useEffect(() => {
    if (enabled !== true) return;

    document.body.style.overflow = phase === "done" ? "" : "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [enabled, phase]);

  return { phase, percent, stage };
}
