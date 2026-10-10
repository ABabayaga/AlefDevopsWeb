import { useRef, useState } from "react";
import { useTranslation } from "next-i18next";

import CtaBand from "@/components/CtaBand";
import ProjectCard from "@/components/ProjectCard";
import LabelRule from "@/components/sobre/LabelRule";
import { projects, type Project, type ProjectCategory } from "@/data/projects";
import { useGsapReveal } from "@/hooks/useGsapReveal";

type Filter = "all" | ProjectCategory;

const filters: { id: Filter; labelKey: string }[] = [
  { id: "all", labelKey: "trabalhos_filter_all" },
  { id: "site", labelKey: "trabalhos_sites_label" },
  { id: "app", labelKey: "trabalhos_apps_label" },
  { id: "sistema", labelKey: "trabalhos_sistemas_label" },
];

const featured = projects.filter((project) => project.featured);

/**
 * "Todos" deixa de fora os destaques, que já estão logo acima. Um filtro de
 * tipo inclui: quem pede "Apps" espera ver o app, e hoje o único app é
 * destaque, então a aba ficaria vazia. O contador é sempre o que a aba mostra.
 */
const itemsFor = (filter: Filter): Project[] =>
  filter === "all"
    ? projects.filter((project) => !project.featured)
    : projects.filter((project) => project.category === filter);

// max-w-6xl menos o padding do <main> dá 1088px de conteúdo.
const LEAD_SIZES = "(min-width: 1152px) 660px, (min-width: 1024px) 60vw, 100vw";
const FEATURED_SIZES = "(min-width: 1152px) 532px, (min-width: 768px) 50vw, 100vw";
const GRID_SIZES =
  "(min-width: 1152px) 347px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

const tabId = (filter: Filter) => `trabalhos-tab-${filter}`;
const PANEL_ID = "trabalhos-panel";

/**
 * Corpo da página /trabalhos (ver src/pages/trabalhos.tsx); o cabeçalho fica
 * por conta de SectionHeader. Três blocos: os destaques em cards grandes, a
 * grade filtrável com o resto e o CtaBand de fecho.
 *
 * A entrada é a mesma de /sobre (useGsapReveal), mas `data-reveal` marca só o
 * que fica montado: a grade remonta a cada troca de filtro, e um card novo
 * marcado nasceria escondido pelo CSS sem nenhum ScrollTrigger para revelá-lo.
 * A cascata da troca é a animação card-in, ligada só depois da primeira troca
 * para não somar com a entrada do GSAP.
 */
const TrabalhosContent: React.FC = () => {
  const { t } = useTranslation("common");
  const scope = useGsapReveal<HTMLDivElement>();
  const [active, setActive] = useState<Filter>("all");
  const [changed, setChanged] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (filter: Filter) => {
    if (filter === active) return;
    setActive(filter);
    setChanged(true);
  };

  // Padrão de abas do WAI-ARIA: só a aba ativa entra no Tab, setas e
  // Home/End andam entre elas e já ativam (o painel é barato de trocar).
  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = filters.length - 1;
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % filters.length
        : event.key === "ArrowLeft"
          ? (index - 1 + filters.length) % filters.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    select(filters[next].id);
    tabRefs.current[next]?.focus();
  };

  const items = itemsFor(active);

  return (
    <div ref={scope} className="mt-6 flex flex-col gap-16 lg:gap-20">
      <section aria-labelledby="trabalhos-featured">
        <LabelRule id="trabalhos-featured" label={t("trabalhos_featured_label")} />

        <ul className="m-0 mt-8 grid list-none gap-6 p-0 md:grid-cols-2">
          {featured.map((project, i) => (
            <li key={project.slug} data-reveal className={i === 0 ? "md:col-span-2" : ""}>
              <ProjectCard
                project={project}
                variant={i === 0 ? "lead" : "featured"}
                sizes={i === 0 ? LEAD_SIZES : FEATURED_SIZES}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="trabalhos-all">
        <LabelRule id="trabalhos-all" label={t("trabalhos_all_label")} />

        <div
          role="tablist"
          aria-label={t("trabalhos_filter_label")}
          data-reveal
          className="mt-8 flex flex-wrap gap-2"
        >
          {filters.map((filter, i) => {
            const selected = filter.id === active;
            return (
              <button
                key={filter.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={tabId(filter.id)}
                aria-selected={selected}
                aria-controls={PANEL_ID}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(filter.id)}
                onKeyDown={(event) => onKeyDown(event, i)}
                className={`type-label flex items-center gap-2 rounded-full border px-4 py-2.5 transition-colors ${
                  selected
                    ? "border-accent bg-surface text-fg"
                    : "border-line text-fg-muted hover:bg-surface-hover hover:text-fg"
                }`}
              >
                {t(filter.labelKey)}
                <span className={selected ? "text-accent-2" : ""}>{itemsFor(filter.id).length}</span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={PANEL_ID}
          aria-labelledby={tabId(active)}
          data-reveal
          className="mt-8"
        >
          {/* key remonta a lista a cada filtro, que é o que reinicia a cascata. */}
          <ul key={active} className="m-0 grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
            {items.map((project, i) => (
              <li
                key={project.slug}
                className={changed ? "motion-safe:animate-card-in" : ""}
                style={changed ? { animationDelay: `${i * 50}ms` } : undefined}
              >
                <ProjectCard project={project} sizes={GRID_SIZES} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        id="trabalhos-cta"
        label={t("trabalhos_cta.label")}
        title={t("trabalhos_cta.title")}
        whatsappLabel={t("trabalhos_cta.whatsapp")}
        secondary={{ href: "/sobre", label: t("nav_sobre") }}
      />
    </div>
  );
};

export default TrabalhosContent;
