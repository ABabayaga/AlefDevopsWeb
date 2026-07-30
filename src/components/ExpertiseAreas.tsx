import { useTranslation } from "next-i18next";

/**
 * As três frentes de trabalho, lado a lado no fim do hero.
 *
 * A numeração 01/02/03 é a régua de eventos do traço de OTDR que ocupava esta
 * coluna antes — o gráfico saiu, a gramática do instrumento ficou.
 */

const areas = [
  { id: "01", key: "infra" },
  { id: "02", key: "web2" },
  { id: "03", key: "web3" },
] as const;

const ExpertiseAreas: React.FC = () => {
  const { t } = useTranslation("common");

  // gap-px sobre bg-line: o filete entre as áreas é o próprio fundo aparecendo
  // pelo gap, então o mobile vira uma coluna com régua horizontal sem regra nova.
  return (
    <ul className="m-0 mt-16 grid list-none gap-px border-t border-line bg-line p-0 sm:grid-cols-3 lg:mt-20">
      {areas.map((area) => (
        <li
          key={area.id}
          className="flex flex-col gap-3 bg-ink py-7 sm:px-6 sm:first:pl-0 sm:last:pr-0"
        >
          <span aria-hidden className="type-label text-om3">
            {area.id}
          </span>

          <h2 className="type-display m-0 text-[1.375rem] text-fg">
            {t(`areas.${area.key}.title`)}
          </h2>

          <p className="m-0 text-[0.9375rem] leading-relaxed text-fg-muted">
            {t(`areas.${area.key}.desc`)}
          </p>

          {/* mt-auto alinha a stack pela base em todas as colunas, mesmo com
              descrições de alturas diferentes */}
          <p className="m-0 mt-auto pt-3 font-mono text-[0.6875rem] leading-relaxed tracking-[0.14em] text-fg-muted/75">
            {t(`areas.${area.key}.stack`)}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default ExpertiseAreas;
