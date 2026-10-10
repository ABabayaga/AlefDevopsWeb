import { useTranslation } from "next-i18next";

import LabelRule from "@/components/sobre/LabelRule";
import { useInView } from "@/hooks/useInView";
import { reveal } from "@/lib/reveal";

/**
 * As duas metades da trajetória lado a lado. A ordem é a da timeline (rede
 * primeiro, código depois) e a cor segue a do hero: infra neutra em fg,
 * desenvolvimento no amarelo primário, que é o que se oferece hoje.
 */
const blocks = [
  { key: "infra", accent: "text-fg", chip: "border-line text-fg/85" },
  { key: "dev", accent: "text-os2", chip: "border-os2/40 text-fg" },
] as const;

const SobreSkills: React.FC = () => {
  const { t } = useTranslation("common");
  const [ref, visible] = useInView<HTMLDivElement>();

  return (
    <section aria-labelledby="sobre-skills">
      <LabelRule id="sobre-skills" label={t("sobre.skills.label")} />
      <p className="measure mt-6 mb-0 text-fg/80">{t("sobre.skills.bridge")}</p>

      <div ref={ref} className="mt-8 grid gap-px border border-line bg-line md:grid-cols-2">
        {blocks.map((block, i) => {
          const items = t(`sobre.skills.${block.key}.items`, { returnObjects: true }) as string[];
          return (
            <div
              key={block.key}
              className={`flex flex-col gap-5 bg-ink p-6 ${reveal(visible)}`}
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              <h3 className={`type-display m-0 text-[1.375rem] ${block.accent}`}>
                {t(`sobre.skills.${block.key}.title`)}
              </h3>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {items.map((item) => (
                  <li
                    key={item}
                    className={`rounded-full border px-3 py-1.5 font-mono text-[0.75rem] leading-none tracking-[0.06em] ${block.chip}`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SobreSkills;
