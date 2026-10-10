import { useTranslation } from "next-i18next";

import LabelRule from "@/components/sobre/LabelRule";

/**
 * As duas metades da trajetória lado a lado. A ordem é a da timeline (rede
 * primeiro, código depois) e a cor segue a do hero: infra neutra em fg,
 * desenvolvimento no azul primário da camada Web2, que é o que se oferece
 * hoje; os chips ficam no ciano de detalhe.
 */
const blocks = [
  { key: "infra", accent: "text-fg", chip: "border-line text-fg/85" },
  { key: "dev", accent: "text-accent", chip: "border-accent-2/40 text-fg" },
] as const;

const SobreSkills: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <section aria-labelledby="sobre-skills">
      <LabelRule id="sobre-skills" label={t("sobre.skills.label")} />
      <p data-reveal className="measure mt-6 mb-0 text-fg/80">{t("sobre.skills.bridge")}</p>

      <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-2">
        {blocks.map((block) => {
          const items = t(`sobre.skills.${block.key}.items`, { returnObjects: true }) as string[];
          return (
            <div
              key={block.key}
              className="flex flex-col gap-5 bg-ink p-6"
            >
              <h3 data-reveal className={`type-display m-0 text-[1.375rem] ${block.accent}`}>
                {t(`sobre.skills.${block.key}.title`)}
              </h3>
              <ul data-reveal className="m-0 flex list-none flex-wrap gap-2 p-0">
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
