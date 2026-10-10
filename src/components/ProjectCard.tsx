import Image from "next/image";
import { useTranslation } from "next-i18next";

import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  /** Quem posiciona o card sabe a largura dele em cada breakpoint: o carrossel
   * mostra 1/2/3 por vez, a grade 1/2. */
  sizes: string;
}

/**
 * O mesmo card nas três seções de /trabalhos. Ocupa a altura toda do
 * contêiner (h-full) para os cards de uma fileira alinharem a base, e o link
 * desce com mt-auto pelo mesmo motivo — descrições têm tamanhos diferentes.
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ project, sizes }) => {
  const { t } = useTranslation("common");
  const title = t(`trabalhos_projects.${project.slug}.title`);
  const contain = project.imageFit === "contain";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-sm border border-line bg-surface">
      {/* 16:10 é a proporção dos prints (1440x900), então sites entram sem corte. */}
      <div className="relative aspect-16/10 border-b border-line bg-ink">
        <Image
          src={project.image}
          alt={title}
          fill
          sizes={sizes}
          className={contain ? "object-contain py-4" : "object-cover object-top"}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="type-display m-0 text-[1.375rem] text-fg">{title}</h3>

        <p className="m-0 line-clamp-2 text-[0.9375rem] leading-relaxed text-fg-muted">
          {t(`trabalhos_projects.${project.slug}.desc`)}
        </p>

        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {project.tech.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.6875rem] leading-none tracking-[0.06em] text-accent-2"
            >
              {tech}
            </li>
          ))}
        </ul>

        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("trabalhos_visit")}: ${title} (${t("trabalhos_new_tab")})`}
            className="type-label mt-auto self-start pt-3 text-accent-2 no-underline underline-offset-4 hover:underline"
          >
            {t("trabalhos_visit")} <span aria-hidden>→</span>
          </a>
        )}
      </div>
    </article>
  );
};

export default ProjectCard;
