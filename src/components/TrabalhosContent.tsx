import { useTranslation } from "next-i18next";

import ProjectCard from "@/components/ProjectCard";
import ProjectCarousel from "@/components/ProjectCarousel";
import { projects, type ProjectCategory } from "@/data/projects";

const categories: { id: ProjectCategory; labelKey: string; layout: "carousel" | "grid" }[] = [
  { id: "site", labelKey: "trabalhos_sites_label", layout: "carousel" },
  { id: "app", labelKey: "trabalhos_apps_label", layout: "grid" },
  { id: "sistema", labelKey: "trabalhos_sistemas_label", layout: "grid" },
];

// Duas colunas a partir de md, limitadas por max-w-6xl.
const GRID_SIZES = "(min-width: 1152px) 552px, (min-width: 768px) 50vw, 100vw";

/**
 * Corpo da página /trabalhos (ver src/pages/trabalhos.tsx) — o cabeçalho da
 * seção fica por conta de SectionHeader; aqui mora só o conteúdo. Os dados
 * vêm de src/data/projects.ts; Sites é carrossel por ser a lista longa, as
 * outras duas são grade.
 */
const TrabalhosContent: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="mt-6 flex flex-col gap-16 lg:gap-20">
      {categories.map((category) => {
        const items = projects.filter((project) => project.category === category.id);
        const labelId = `trabalhos-${category.id}`;

        if (category.layout === "carousel") {
          return (
            <ProjectCarousel
              key={category.id}
              projects={items}
              labelledBy={labelId}
              label={t(category.labelKey)}
            />
          );
        }

        return (
          <section key={category.id} aria-labelledby={labelId}>
            <div className="flex items-center gap-4">
              <span id={labelId} className="type-label text-accent-2">
                {t(category.labelKey)}
              </span>
              <span aria-hidden className="h-px flex-1 bg-line" />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {items.map((project) => (
                <ProjectCard key={project.slug} project={project} sizes={GRID_SIZES} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default TrabalhosContent;
