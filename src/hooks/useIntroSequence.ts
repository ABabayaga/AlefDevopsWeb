import { useEffect, useRef, useState } from "react";
import { useIntroProgress } from "@/hooks/useIntroProgress";

export type IntroPhase = "pending" | "loading" | "reveal" | "morphing" | "done";

/**
 * A intro roda a cada carregamento de página. Esta marca vive no escopo do
 * módulo de propósito — some junto com o contexto JS, ou seja, em todo refresh
 * e em toda aba nova, e sobrevive às navegações de cliente. É o que separa as
 * duas coisas: atualizar repete a cortina; trocar de idioma pelo
 * LanguageSwitcher, que remonta a home sem recarregar, não repete.
 *
 * No servidor ela nunca muda de valor: quem escreve é um efeito, e efeito não
 * roda em render de servidor. Então o HTML entregue é sempre o de "pending".
 */
let introPlayed = false;

/** Varredura de entrada: o logo grande é descoberto da esquerda pra direita. */
export const WIPE_MS = 650;
/** Respiro com o lockup inteiro parado no centro, depois da varredura. */
const HOLD_MS = 400;
/** Fase "reveal" inteira. A varredura tem que caber aqui: se terminasse depois,
 *  a viagem começaria com o wordmark ainda pela metade. */
export const REVEAL_MS = WIPE_MS + HOLD_MS;
/** Duração da viagem centro→header e do fade da cortina. */
export const MORPH_MS = 700;
/** Atraso do conteúdo (hero, nav) depois que o logo começa a viajar. Entrar
 *  junto empataria os dois movimentos; entrar logo atrás faz o logo puxar. */
const CONTENT_DELAY_MS = 180;

interface IntroSequence {
  phase: IntroPhase;
  /** Válido durante "loading"; nas outras fases não é mais lido. */
  percent: number;
  stage: number;
  /** Hero e nav visíveis. Separado de `phase` porque entra atrasado. */
  contentRevealed: boolean;
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
  // Inicialização preguiçosa, e não uma constante: numa remontagem de cliente
  // (troca de idioma) `introPlayed` já é true e a máquina nasce em "done", sem
  // renderizar um quadro de cortina. O efeito só corrigiria isso depois da
  // pintura, tarde demais — apareceria o piscão. No servidor e na hidratação
  // `introPlayed` é sempre false, então os dois lados batem em "pending".
  const [phase, setPhase] = useState<IntroPhase>(() => (introPlayed ? "done" : "pending"));
  // Começa visível pelo mesmo motivo de "pending": é o que o servidor entrega
  // e o que um visitante sem JS enxerga.
  const [contentRevealed, setContentRevealed] = useState(true);
  // Esta instância é a dona da intro em curso. Existe por causa do StrictMode:
  // em dev o React invoca o efeito de mount duas vezes na MESMA instância
  // (setup → cleanup → setup), então sem isto a segunda invocação leria a marca
  // que a primeira acabou de escrever, cairia no skip e mataria a cortina antes
  // do primeiro quadro. O ref sobrevive entre as duas invocações e não
  // sobrevive a uma remontagem de verdade — que é exatamente a distinção que
  // falta ao `introPlayed` sozinho.
  const ownsIntro = useRef(false);
  const { percent, stage, done } = useIntroProgress(enabled === true);

  useEffect(() => {
    if (ownsIntro.current) return;

    const skip =
      introPlayed || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (skip) {
      setEnabled(false);
      setPhase("done");
      return;
    }

    // Marcada na largada, não na chegada: uma remontagem no meio da sequência
    // deve cair no "done" acima, não recomeçar a cortina do zero.
    introPlayed = true;
    ownsIntro.current = true;
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
    }, MORPH_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // O conteúdo some enquanto a cortina o cobre e volta atrasado em relação ao
  // início da viagem do logo — nunca no mesmo quadro, senão os dois movimentos
  // competem e nenhum lê como consequência do outro.
  useEffect(() => {
    if (phase === "loading" || phase === "reveal") {
      setContentRevealed(false);
      return;
    }

    if (phase !== "morphing") {
      setContentRevealed(true);
      return;
    }

    const timer = window.setTimeout(() => setContentRevealed(true), CONTENT_DELAY_MS);
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

  return { phase, percent, stage, contentRevealed };
}
