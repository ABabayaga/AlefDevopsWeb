import { useEffect, useRef, useState } from "react";

/**
 * Liga reveal() à rolagem: `visible` vira true quando o elemento entra na tela,
 * uma vez só, e não volta a esconder ao subir.
 *
 * Nasce true de propósito. O HTML do servidor e quem não tem JS veem tudo; só
 * o que está abaixo da dobra é escondido depois da montagem, onde ninguém viu
 * o quadro pintado. Esconder o que já está na tela piscaria o conteúdo, então
 * isso entra sem animação. Em prefers-reduced-motion nada é escondido.
 */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setVisible(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      // Um pouco acima da base: o bloco entra já com uma parte legível na tela.
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible] as const;
}
