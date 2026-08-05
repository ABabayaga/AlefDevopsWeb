import Image from "next/image";
import { useTranslation } from "next-i18next";

interface ProjectCardProps {
  /** Chave em t(`trabalhos_projects.${projectKey}.*`). */
  projectKey: string;
  image: string;
  /** "landscape" recorta pra 16:9 (prints de site); "portrait" mostra a tela
   * inteira do app sem cortar — o print do celular é bem mais alto que largo. */
  orientation?: "landscape" | "portrait";
}

const ProjectCard: React.FC<ProjectCardProps> = ({ projectKey, image, orientation = "landscape" }) => {
  const { t } = useTranslation("common");
  const title = t(`trabalhos_projects.${projectKey}.title`);

  return (
    <div className="overflow-hidden rounded-sm border border-line bg-raised">
      <div
        className={
          orientation === "portrait"
            ? "relative h-90 bg-ink"
            : "relative aspect-video"
        }
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className={orientation === "portrait" ? "object-contain" : "object-cover"}
        />
      </div>

      <div className="flex flex-col gap-3 p-6">
        <h3 className="type-display m-0 text-[1.375rem] text-fg">{title}</h3>

        <p className="m-0 text-[0.9375rem] leading-relaxed text-fg-muted">
          {t(`trabalhos_projects.${projectKey}.desc`)}
        </p>

        <p className="m-0 font-mono text-[0.6875rem] leading-relaxed tracking-[0.14em] text-fg-muted/75">
          {t(`trabalhos_projects.${projectKey}.stack`)}
        </p>
      </div>
    </div>
  );
};

export default ProjectCard;
