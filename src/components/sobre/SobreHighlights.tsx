import { useTranslation } from "next-i18next";

import { useInView } from "@/hooks/useInView";
import { reveal } from "@/lib/reveal";

const highlights = ["isp", "dev", "sale"] as const;

/**
 * Três números que resumem a trajetória antes da timeline contar a história.
 * Filetes pelo idioma do site: gap-px sobre bg-line, filhos em bg-ink. No
 * mobile vira uma coluna com réguas horizontais, sem regra extra.
 */
const SobreHighlights: React.FC = () => {
  const { t } = useTranslation("common");
  const [ref, visible] = useInView<HTMLElement>();

  return (
    <section ref={ref} aria-label={t("sobre.highlights.label")}>
      <dl className="m-0 grid gap-px border border-line bg-line sm:grid-cols-3">
        {highlights.map((key, i) => (
          <div
            key={key}
            className={`flex flex-col gap-2 bg-ink px-6 py-6 ${reveal(visible)}`}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <dt className="type-display m-0 text-[2rem] text-accent-2 lg:text-[2.5rem]">
              {t(`sobre.highlights.${key}.value`)}
            </dt>
            <dd className="m-0 text-[0.9375rem] leading-snug text-fg/80">
              {t(`sobre.highlights.${key}.caption`)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default SobreHighlights;
