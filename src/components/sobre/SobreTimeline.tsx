import { useTranslation } from "next-i18next";

import LabelRule from "@/components/sobre/LabelRule";

const steps = ["telecom", "infra", "fullstack", "ai"] as const;

/**
 * A trajetória, a parte mais forte da história. Vertical até xl, horizontal a
 * partir dele: em lg (1024) as colunas têm ~216px e os títulos já não cabiam
 * numa linha, ainda menos em espanhol.
 *
 * Cada <li> desenha o próprio trecho da linha (border-l no mobile, border-t no
 * desktop) sem gap entre eles, então os trechos se emendam numa linha contínua
 * e o último pode ter outra cor: a etapa atual acende em accent.
 *
 * O título usa .type-label com tracking menor que o padrão e nowrap no
 * desktop: com 0.18em, "Arquiteto de Infraestrutura" quebrava em duas linhas
 * numa coluna de um quarto. O caso-limite é "Arquitecto de Infraestructura"
 * (es) na coluna de ~248px de max-w-6xl; aumentar a fonte volta a estourar.
 */
const SobreTimeline: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <section aria-labelledby="sobre-timeline">
      <LabelRule id="sobre-timeline" label={t("sobre.timeline.label")} />

      <ol className="m-0 mt-10 grid list-none p-0 xl:grid-cols-4">
        {steps.map((step, i) => {
          const current = i === steps.length - 1;
          return (
            <li
              key={step}
              aria-current={current ? "step" : undefined}
              className={`relative border-l pb-10 pl-7 last:pb-0 xl:border-t xl:border-l-0 xl:pt-8 xl:pr-6 xl:pb-0 xl:pl-0 ${
                current ? "border-accent" : "border-line"
              }`}
              data-reveal
            >
              <span
                aria-hidden
                className={`absolute top-1.5 -left-1.25 h-2.5 w-2.5 rounded-full xl:-top-1.25 xl:left-0 ${
                  current ? "bg-accent ring-4 ring-accent/20" : "border border-fg/50 bg-ink"
                }`}
              />

              <div className="flex items-baseline gap-3">
                <span
                  className={`type-display text-[1.75rem] xl:text-[2rem] ${current ? "text-accent" : "text-fg"}`}
                >
                  {t(`sobre.timeline.${step}.year`)}
                </span>
                {current && (
                  <span className="type-label rounded-full border border-accent/50 px-2 py-1 text-[0.625rem] text-accent">
                    {t("sobre.timeline.current")}
                  </span>
                )}
              </div>

              <h3
                className={`type-label mt-4 mb-0 text-[0.75rem] tracking-[0.06em] xl:whitespace-nowrap ${
                  current ? "text-accent" : "text-fg"
                }`}
              >
                {t(`sobre.timeline.${step}.title`)}
              </h3>

              <p className="measure mt-3 mb-0 text-[0.9375rem] leading-relaxed text-fg/80">
                {t(`sobre.timeline.${step}.desc`)}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default SobreTimeline;
