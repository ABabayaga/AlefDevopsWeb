import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import AreaCard from "@/components/AreaCard";
import ExpertiseAreas from "@/components/ExpertiseAreas";
import { prefersStaticHero, useScrollProgress } from "@/hooks/useScrollProgress";
import { whatsappHref } from "@/lib/whatsapp";

// ssr:false mantém o three fora do JS da primeira pintura e do HTML estático.
const PlanetScene = dynamic(() => import("@/components/PlanetScene"), { ssr: false });

const AREA_KEYS = ["infra", "web2", "web3"] as const;

/** Entrada e saída dos blocos coreografados. */
function reveal(visible: boolean): string {
  return `transition-[opacity,transform] duration-700 ease-[var(--ease-out-quint)] ${
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
  }`;
}

const Hero: React.FC = () => {
  const { t } = useTranslation("common");
  const containerRef = useRef<HTMLElement>(null);

  // Começa estático de propósito: é o que o servidor renderiza, então o HTML
  // entregue já traz headline, sub, as três áreas e o CTA. O desktop promove
  // para a versão coreografada depois de montar.
  const [isStatic, setIsStatic] = useState(true);
  useEffect(() => {
    setIsStatic(prefersStaticHero());
  }, []);

  const { progressRef, stage } = useScrollProgress(containerRef, !isStatic);

  const href = whatsappHref(t("hero_whatsapp_message"));

  const eyebrow = (
    <p className="type-label mb-6 flex items-center gap-3 text-fg-muted">
      <span aria-hidden className="h-px w-8 shrink-0 bg-os2" />
      <span className="min-w-0 leading-relaxed">{t("hero_eyebrow")}</span>
    </p>
  );

  const cta = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="type-label inline-block rounded-full bg-os2 px-6 py-3.5 text-ink no-underline transition-opacity hover:opacity-85"
    >
      {t("hero_whatsapp")}
    </a>
  );

  // Versão estática: mobile, prefers-reduced-motion e o HTML do servidor.
  // Mesmos textos, mesmas chaves — o que muda é só a apresentação.
  if (isStatic) {
    return (
      <section className="relative overflow-hidden">
        <PlanetScene progressRef={progressRef} staticMode />

        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 lg:pt-24 lg:pb-28">
          {eyebrow}
          <h1 className="type-display type-hero m-0 max-w-[18ch] text-fg">{t("title")}</h1>
          <p className="measure mt-7 text-fg-muted">{t("hero_sub")}</p>
          <div className="mt-10">{cta}</div>
          <ExpertiseAreas />
        </div>
      </section>
    );
  }

  return (
    // 300vh é a distância de scroll que a narrativa consome; o filho sticky é
    // a tela que fica parada enquanto isso.
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <PlanetScene progressRef={progressRef} staticMode={false} />

        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-2 items-center gap-12 px-8">
          <div>
            <div className={reveal(stage === 0)} aria-hidden={stage !== 0}>
              {eyebrow}
              <h1 className="type-display type-hero m-0 max-w-[16ch] text-fg">
                {t("title")}
              </h1>
              <p className="measure mt-7 text-fg-muted">{t("hero_sub")}</p>
            </div>

            <div className={`mt-10 ${reveal(stage >= 4)}`} aria-hidden={stage < 4}>
              {cta}
            </div>
          </div>

          <ul className="m-0 flex list-none flex-col gap-px bg-line p-0">
            {AREA_KEYS.map((key, index) => {
              const visible = stage >= index + 1;
              return (
                <li
                  key={key}
                  aria-hidden={!visible}
                  className={`flex flex-col gap-3 bg-ink px-6 py-7 ${reveal(visible)}`}
                >
                  <AreaCard index={`0${index + 1}`} areaKey={key} />
                </li>
              );
            })}
          </ul>
        </div>

        <div
          aria-hidden
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 ${reveal(stage === 0)}`}
        >
          <span className="scroll-cue block" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
