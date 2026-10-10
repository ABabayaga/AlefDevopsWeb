import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslation } from "next-i18next";

import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/data/projects";

// Largura de cada slide: 85% no mobile deixa a borda do próximo aparecendo,
// que é o que diz que dá para arrastar. Os breakpoints casam com SIZES.
const SLIDE = "min-w-0 shrink-0 grow-0 basis-[85%] pl-6 md:basis-1/2 lg:basis-1/3";

// max-w-6xl (72rem) menos o padding do <main>: acima disso o card para de crescer.
const SIZES = "(min-width: 1152px) 370px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 85vw";

const arrowClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-35";

interface ProjectCarouselProps {
  projects: Project[];
  /** id do rótulo da seção, que também nomeia o carrossel. */
  labelledBy: string;
  label: string;
}

/**
 * Carrossel da seção Sites. `slidesToScroll: "auto"` anda uma página por vez
 * (3 no desktop, 2 no tablet, 1 no mobile), e os dots seguem essas páginas,
 * não os slides — por isso o rótulo deles fala em "grupo".
 *
 * As setas ficam na linha do rótulo e só aparecem em lg: no toque o gesto
 * já é o arrasto, e o peek do próximo card é quem convida a ele.
 */
const ProjectCarousel: React.FC<ProjectCarouselProps> = ({ projects, labelledBy, label }) => {
  const { t } = useTranslation("common");
  const [viewportRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: "auto",
  });
  const [snaps, setSnaps] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
    setCanPrev(embla.canScrollPrev());
    setCanNext(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    // reInit dispara ao cruzar breakpoint: o número de páginas muda junto.
    const reset = () => {
      setSnaps(embla.scrollSnapList());
      sync();
    };
    reset();
    embla.on("select", sync).on("reInit", reset);
    return () => {
      embla.off("select", sync).off("reInit", reset);
    };
  }, [embla, sync]);

  return (
    <section aria-labelledby={labelledBy} aria-roledescription="carousel">
      <div className="flex items-center gap-4">
        <span id={labelledBy} className="type-label text-accent-2">
          {label}
        </span>
        <span aria-hidden className="h-px flex-1 bg-line" />
        <div className="hidden gap-2 lg:flex">
          <button
            type="button"
            className={arrowClass}
            onClick={() => embla?.scrollPrev()}
            disabled={!canPrev}
            aria-label={t("trabalhos_prev")}
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            className={arrowClass}
            onClick={() => embla?.scrollNext()}
            disabled={!canNext}
            aria-label={t("trabalhos_next")}
          >
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      <div ref={viewportRef} className="mt-8 overflow-hidden">
        <div className="-ml-6 flex touch-pan-y">
          {projects.map((project, i) => (
            <div
              key={project.slug}
              className={SLIDE}
              role="group"
              aria-roledescription="slide"
              aria-label={t("trabalhos_slide", { index: i + 1, total: projects.length })}
            >
              <ProjectCard project={project} sizes={SIZES} />
            </div>
          ))}
        </div>
      </div>

      {snaps.length > 1 && (
        <div className="mt-6 flex justify-center gap-1">
          {snaps.map((_, i) => (
            // Botão maior que o ponto: alvo de toque de 24px com um traço de 8px.
            <button
              key={i}
              type="button"
              onClick={() => embla?.scrollTo(i)}
              aria-label={t("trabalhos_goto", { n: i + 1 })}
              aria-current={i === selected ? "true" : undefined}
              className="group flex h-6 items-center px-1"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === selected ? "w-6 bg-accent-2" : "w-1.5 bg-line group-hover:bg-fg-muted"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProjectCarousel;
