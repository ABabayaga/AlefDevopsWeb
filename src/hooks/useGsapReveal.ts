import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Entrada em cascata de tudo que tiver `data-reveal` dentro do escopo.
 *
 * ScrollTrigger.batch agrupa os itens que cruzam a linha no mesmo instante:
 * no carregamento, o que já está na tela entra em sequência; o resto entra em
 * pequenos grupos conforme a rolagem — um stagger só, sem delay por índice
 * escrito à mão em cada bloco.
 *
 * Só opacidade e deslocamento, nunca autoAlpha: visibility:hidden tiraria o
 * conteúdo abaixo da dobra da árvore de acessibilidade até alguém rolar.
 *
 * O primeiro quadro escondido vem do CSS (`.js-reveal [data-reveal]`, ver
 * _document.tsx e globals.css), não daqui: o HTML estático pinta antes da
 * hidratação, e esconder só agora faria o conteúdo piscar. Por isso fromTo e
 * não from — from leria a opacidade 0 do CSS como valor final.
 *
 * Em grades de filete (gap-px sobre bg-line), marcar o conteúdo da célula, nunca
 * a célula: com ela transparente o bg-line do pai aparece como um bloco sólido.
 */
export function useGsapReveal<T extends HTMLElement>() {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Com movimento reduzido o CSS não esconde nada, e aqui também não.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current);
        gsap.set(items, { opacity: 0, y: 14 });

        ScrollTrigger.batch(items, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true },
            ),
        });
      });
    },
    { scope },
  );

  return scope;
}
