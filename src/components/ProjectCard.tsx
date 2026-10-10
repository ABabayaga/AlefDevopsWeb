import Image from "next/image";
import { useTranslation } from "next-i18next";

import { TECH_PLACEHOLDER, type Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  /** Quem posiciona o card sabe a largura dele em cada breakpoint. */
  sizes: string;
  /**
   * "grid" é o card da grade filtrável, com a descrição cortada em duas
   * linhas. "featured" é um destaque: descrição inteira e título maior.
   * "lead" é o primeiro destaque, que no desktop deita imagem e texto lado a
   * lado para a imagem ganhar a largura de duas colunas.
   */
  variant?: "grid" | "featured" | "lead";
}

/**
 * O mesmo card nos destaques e na grade de /trabalhos. Ocupa a altura toda do
 * contêiner (h-full) para os cards de uma fileira alinharem a base, e o link
 * desce com mt-auto pelo mesmo motivo: descrições têm tamanhos diferentes.
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ project, sizes, variant = "grid" }) => {
  const { t } = useTranslation("common");
  const title = t(`trabalhos_projects.${project.slug}.title`);
  const contain = project.imageFit === "contain";
  const lead = variant === "lead";
  const highlighted = variant !== "grid";
  // Stack sem confirmar não vira tag: melhor nenhuma do que um "[CONFIRMAR]" no ar.
  const tech = project.tech.filter((name) => name !== TECH_PLACEHOLDER);

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-sm border border-line bg-surface transition-colors duration-300 focus-within:border-accent hover:border-accent ${
        lead ? "lg:grid lg:grid-cols-[3fr_2fr]" : ""
      }`}
    >
      {/* 16:10 é a proporção dos prints (1440x900), então sites entram sem corte. */}
      <div
        className={`relative aspect-16/10 overflow-hidden border-b border-line bg-ink ${
          lead ? "lg:border-r lg:border-b-0" : ""
        }`}
      >
        <Image
          src={project.image}
          alt={title}
          fill
          sizes={sizes}
          className={`transition-transform duration-500 ease-[var(--ease-out-quint)] motion-safe:group-focus-within:scale-[1.03] motion-safe:group-hover:scale-[1.03] ${
            contain ? "object-contain py-4" : "object-cover object-top"
          }`}
        />
      </div>

      <div className={`flex flex-1 flex-col gap-3 ${highlighted ? "p-6 sm:p-8" : "p-6"}`}>
        <span className="type-label text-[0.6875rem] text-fg-muted">
          {t(`trabalhos_type.${project.category}`)}
          {project.year && <> · {project.year}</>}
        </span>

        <h3
          className={`type-display m-0 text-fg ${
            highlighted ? "text-[1.5rem] sm:text-[1.75rem]" : "text-[1.375rem]"
          }`}
        >
          {title}
        </h3>

        <p
          className={`m-0 text-[0.9375rem] leading-relaxed text-fg-muted ${
            highlighted ? "" : "line-clamp-2"
          }`}
        >
          {t(`trabalhos_projects.${project.slug}.desc`)}
        </p>

        {tech.length > 0 && (
          <ul
            aria-label={t("trabalhos_stack")}
            className="m-0 flex list-none flex-wrap gap-2 p-0"
          >
            {tech.map((name) => (
              <li
                key={name}
                className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.6875rem] leading-none tracking-[0.06em] text-accent-2"
              >
                {name}
              </li>
            ))}
          </ul>
        )}

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
