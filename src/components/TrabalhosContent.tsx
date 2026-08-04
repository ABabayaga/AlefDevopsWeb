import { useTranslation } from "next-i18next";
import ProjectCard from "@/components/ProjectCard";

const projects = [
  { key: "mm", category: "sites", image: "/trabalhos/mm.png", orientation: "landscape" },
  { key: "gsn", category: "sites", image: "/trabalhos/gsn.png", orientation: "landscape" },
  { key: "rt2", category: "apps", image: "/trabalhos/rt2.png", orientation: "portrait" },
  { key: "rpa", category: "sistemas", image: "/trabalhos/rpa.png", orientation: "landscape" },
] as const;

const categories = [
  { id: "sites", labelKey: "trabalhos_sites_label" },
  { id: "apps", labelKey: "trabalhos_apps_label" },
  { id: "sistemas", labelKey: "trabalhos_sistemas_label" },
] as const;

/**
 * Corpo do modal de "Trabalhos" (ver NavRootModal) — o modal é dono do
 * cabeçalho (título + fechar); aqui mora só o conteúdo, migrado tal como
 * estava na antiga página /trabalhos.
 */
const TrabalhosContent: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="mt-6 flex flex-col gap-16 lg:gap-20">
      {categories.map((category) => (
        <section key={category.id}>
          <div className="flex items-center gap-4">
            <span className="type-label text-os2">{t(category.labelKey)}</span>
            <span aria-hidden className="h-px flex-1 bg-line" />
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {projects
              .filter((project) => project.category === category.id)
              .map((project) => (
                <ProjectCard
                  key={project.key}
                  projectKey={project.key}
                  image={project.image}
                  orientation={project.orientation}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default TrabalhosContent;
