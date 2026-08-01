import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";

/** Título pleno por esse tanto depois do gatilho — dá tempo de ler antes de dissolver. */
const HOLD_MS = 400;

/** Globo cresce / título dissolve nessa janela, o mesmo relógio pros dois. */
const FADE_MS = 1200;

/** Desaceleração: a curva chega perto do fim e afrouxa, em vez de bater seco. */
function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

/**
 * Progresso do nascimento (0 a 1) `elapsed` ms depois do gatilho: parado
 * durante HOLD_MS, daí uma curva ease-out-quint até 1 ao fim de FADE_MS.
 * Extraída à parte por ser a única peça que dá pra testar sem DOM.
 */
export function birthProgressAt(elapsed: number): number {
  if (elapsed <= HOLD_MS) return 0;
  return easeOutQuint(Math.min((elapsed - HOLD_MS) / FADE_MS, 1));
}

interface HeroBirth {
  /** 0 a 1, já com easing aplicado. Atualizado por rAF, sem re-render — o
   * PlanetScene lê isso no próprio rAF, do mesmo jeito que já lê progressRef
   * do scroll. */
  birthProgressRef: MutableRefObject<number>;
  /** Pleno até HOLD_MS depois do gatilho, daí falso. Nunca volta a true. */
  titleVisible: boolean;
  /** O nascimento terminou (naturalmente ou porque o scroll o encerrou). */
  done: boolean;
}

/**
 * O relógio do nascimento do globo: segura o título por HOLD_MS, depois
 * dissolve título e globo juntos em FADE_MS. Não depende de scroll — só de
 * `triggered` virar true, que o Hero liga ao fim da cortina do Intro.
 *
 * `scrollStarted` é a válvula de escape: quem começa a rolar antes do
 * nascimento terminar não deve ficar esperando uma animação de entrada, então
 * o progresso pula pro fim na hora.
 */
export function useHeroBirth(triggered: boolean, scrollStarted: boolean): HeroBirth {
  const birthProgressRef = useRef(0);
  const [titleVisible, setTitleVisible] = useState(true);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  // O relógio contínuo: só escreve na ref, sem re-render.
  useEffect(() => {
    if (!triggered || doneRef.current) return;

    const start = performance.now();
    let frameId: number | null = null;

    const tick = () => {
      if (doneRef.current) return;

      const elapsed = performance.now() - start;
      birthProgressRef.current = birthProgressAt(elapsed);

      if (birthProgressRef.current < 1) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      doneRef.current = true;
      setDone(true);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [triggered]);

  // O flip discreto do título: um setTimeout só, igual ao "leaving" do
  // Intro.tsx — não precisa de rAF porque é um booleano, não um valor contínuo.
  useEffect(() => {
    if (!triggered) return;
    const timer = window.setTimeout(() => setTitleVisible(false), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [triggered]);

  // A válvula de escape do scroll.
  useEffect(() => {
    if (!scrollStarted || doneRef.current) return;
    doneRef.current = true;
    birthProgressRef.current = 1;
    setTitleVisible(false);
    setDone(true);
  }, [scrollStarted]);

  return { birthProgressRef, titleVisible, done };
}
