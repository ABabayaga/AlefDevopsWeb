import { useEffect, useRef, useState } from "react";

/** Até onde a barra corre sozinha. Os 10% finais são do carregamento real. */
const SELF_RUN_CEILING = 90;

/** Tempo que a barra leva para ir de 0 a SELF_RUN_CEILING. */
const SELF_RUN_MS = 2200;

/** Piso do total: abaixo disso a cortina pisca e ninguém lê. */
const MIN_TOTAL_MS = 2500;

/** Teto rígido: rede ruim não pode prender ninguém atrás da cortina. */
const MAX_TOTAL_MS = 6000;

/** Piso da subida final. Sem ele um carregamento lento fecharia com um salto. */
const CLOSING_MIN_MS = 400;

/**
 * Faixas de porcentagem de cada etapa. O índice é o que o componente usa para
 * escolher a chave de locale.
 */
const STAGE_FLOORS = [0, 25, 60, 95] as const;

export function stageFromPercent(percent: number): number {
  let stage = 0;
  for (let i = 0; i < STAGE_FLOORS.length; i++) {
    if (percent >= STAGE_FLOORS[i]) stage = i;
  }
  return stage;
}

/** Desaceleração: a barra chega perto do teto e afrouxa, em vez de bater seco. */
function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

/** Onde a barra está no trecho automático, `elapsed` ms depois do início. */
function selfRunAt(elapsed: number): number {
  return SELF_RUN_CEILING * easeOutQuint(Math.min(elapsed / SELF_RUN_MS, 1));
}

interface IntroProgress {
  /** 0 a 100, inteiro — é texto na tela, não precisa de subpixel. */
  percent: number;
  /** Índice da etapa, 0 a 3. */
  stage: number;
  /** A cortina já pode sair. */
  done: boolean;
}

/**
 * A curva híbrida: corre sozinha até 90% e só completa quando o carregamento
 * real termina.
 *
 * O sinal de "pronto" são duas promessas. A das fontes é óbvia. A outra é o
 * import do PlanetScene — o registro de módulos deduplica, então dar await no
 * mesmo import que o next/dynamic do Hero vai dar significa exatamente "o chunk
 * do three desceu e parseou", sem callback atravessando o Hero e sem a cortina
 * precisar saber o que é o planeta.
 */
export function useIntroProgress(enabled: boolean): IntroProgress {
  const [percent, setPercent] = useState(0);
  const [done, setDone] = useState(false);
  // Instante em que a página ficou pronta e o valor da barra naquele instante.
  // O segundo é o que impede o salto: numa conexão rápida tudo resolve em ~300ms,
  // com a barra ainda em 20%, e uma rampa final partindo de um valor fixo pularia
  // direto para lá. Ela parte de onde a barra está.
  const readyAtRef = useRef<number | null>(null);
  const readyValueRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const start = performance.now();
    let frameId: number | null = null;
    let cancelled = false;

    const markReady = () => {
      if (cancelled || readyAtRef.current !== null) return;
      const now = performance.now();
      readyAtRef.current = now;
      readyValueRef.current = selfRunAt(now - start);
    };

    const fonts =
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready
        : Promise.resolve();

    // O mesmo módulo que o Hero carrega por next/dynamic. Falha de rede não
    // pode travar a cortina, então o catch também conta como pronto.
    const scene = import("@/components/PlanetScene").catch(() => undefined);

    void Promise.all([fonts, scene]).then(markReady);

    // O teto vale mesmo que as promessas nunca resolvam — e fecha por conta
    // própria, sem depender do rAF. Numa aba aberta em segundo plano o rAF é
    // suspenso, e sem esta rede a cortina ficaria de pé até o visitante voltar.
    const ceiling = window.setTimeout(() => {
      if (cancelled) return;
      markReady();
      setPercent(100);
      setDone(true);
    }, MAX_TOTAL_MS);

    const tick = () => {
      const now = performance.now();
      const elapsed = now - start;

      let value = selfRunAt(elapsed);

      const readyAt = readyAtRef.current;
      if (readyAt !== null) {
        // Depois de pronto, sobe do valor corrente até 100. O tempo dessa
        // subida é o que falta para cumprir o piso do total — e nunca menos que
        // CLOSING_MIN_MS, senão um carregamento lento fecharia com um salto.
        const span = Math.max(MIN_TOTAL_MS - (readyAt - start), CLOSING_MIN_MS);
        const closing = easeOutQuint(Math.min((now - readyAt) / span, 1));
        const from = readyValueRef.current;
        value = from + (100 - from) * closing;
      }

      const rounded = Math.min(Math.round(value), 100);
      setPercent(rounded);

      if (rounded >= 100) {
        setDone(true);
        return;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.clearTimeout(ceiling);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [enabled]);

  return { percent, stage: stageFromPercent(percent), done };
}
