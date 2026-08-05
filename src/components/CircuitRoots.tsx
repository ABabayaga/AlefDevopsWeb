import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import AreaCard from "@/components/AreaCard";
import { smoothstep } from "@/lib/planetGeometry";
import { reveal } from "@/lib/reveal";
import { orthogonalRoot } from "@/lib/rootPath";
import { LAYERS, layerScreenRadius } from "@/lib/shellStages";

/**
 * Onde cada bloco pousa. Os ângulos moram em LAYERS porque a cena e a raiz
 * precisam deles; a caixa mora aqui porque é layout e só o layout se importa.
 * A ordem é a mesma de LAYERS. Os slots da esquerda (Web2 em cima, Infra
 * embaixo) usam 7% em vez do 11% original — os três blocos têm uma lista de
 * sub-itens agora (ver MAX_ITEMS) e ficaram mais altos, então precisam da
 * folga extra antes do overflow-hidden do container cortar o texto.
 */
const BOXES = [
  "left-[4%] top-[7%]",
  "right-[4%] top-1/2 -translate-y-1/2",
  "left-[4%] bottom-[7%]",
] as const;

/**
 * Mesma ordem de BOXES. Em vh, não vw: o raio da casca (layerScreenRadius)
 * também é fração da ALTURA, então a largura da caixa precisa acompanhar a
 * mesma unidade — em vw ela cresceria fora de proporção numa janela larga e
 * baixa e pisaria na esfera aberta (que fica maior no fim do scroll, quando
 * os três blocos já estão revelados e continuam assim). Web2 ganha um pouco
 * mais por ser a área em destaque.
 */
const WIDTHS = [
  "w-[clamp(11rem,26vh,15rem)]",
  "w-[clamp(10rem,22vh,13rem)]",
  "w-[clamp(10rem,22vh,13rem)]",
] as const;

/** A caixa é estreita e o container corta overflow — cada bloco mostra só os
 *  N sub-itens mais essenciais aqui; a lista completa mora na versão estática
 *  (ExpertiseAreas), que tem largura livre. */
const MAX_ITEMS = 3;

/**
 * Estágio em que o texto da camada entra. O estágio 1 é a saída do título, daí
 * o deslocamento de 2. Ver STAGE_THRESHOLDS em shellStages.
 */
export function stageForLayer(index: number): number {
  return index + 2;
}

interface Joint {
  /** Ponta do filete virada para o planeta. */
  entryX: number;
  entryY: number;
  /** A outra ponta. */
  farX: number;
}

interface CircuitRootsProps {
  progressRef: MutableRefObject<number>;
  stage: number;
}

const CircuitRoots: React.FC<CircuitRootsProps> = ({ progressRef, stage }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    let width = 0;
    let height = 0;
    let joints: Joint[] = [];

    // O bloco não se move: rastrear a casca com exatidão levaria o texto da
    // Web3 para fora da viewport. Quem acompanha a casca é só a ponta da linha
    // que fica no planeta, então as juntas são medidas e guardadas.
    const measure = () => {
      const box = container.getBoundingClientRect();
      width = box.width;
      height = box.height;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      joints = LAYERS.map((layer, index) => {
        const block = blockRefs.current[index];
        if (!block) return { entryX: 0, entryY: 0, farX: 0 };

        const rect = block.getBoundingClientRect();
        const left = rect.left - box.left;
        const right = rect.right - box.left;
        const top = rect.top - box.top;

        // cos < 0 é ramo apontando para a esquerda da tela, então a raiz entra
        // pela direita do bloco e o filete corre para a esquerda. E vice-versa.
        const towardLeft = Math.cos((layer.angle * Math.PI) / 180) < 0;
        return towardLeft
          ? { entryX: right, entryY: top, farX: left }
          : { entryX: left, entryY: top, farX: right };
      });
    };

    const draw = () => {
      const progress = progressRef.current;
      const centerX = width / 2;
      const centerY = height / 2;

      LAYERS.forEach((layer, index) => {
        const path = pathRefs.current[index];
        const dot = dotRefs.current[index];
        const joint = joints[index];
        if (!path || !dot || !joint) return;

        const open = smoothstep(layer.from, layer.to, progress);
        const radius = layerScreenRadius(layer, open) * height;
        const radians = (layer.angle * Math.PI) / 180;
        // -sin porque o y da tela cresce para baixo.
        const anchorX = centerX + Math.cos(radians) * radius;
        const anchorY = centerY - Math.sin(radians) * radius;

        const { d, length } = orthogonalRoot(
          { x: anchorX, y: anchorY },
          { x: joint.entryX, y: joint.entryY },
          { x: joint.farX, y: joint.entryY },
        );

        path.setAttribute("d", d);
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length * (1 - open)}`;

        dot.setAttribute("cx", `${anchorX}`);
        dot.setAttribute("cy", `${anchorY}`);
        dot.style.opacity = `${open}`;
      });
    };

    measure();
    draw();

    // Fonte que carrega, idioma que troca, janela que muda: tudo isso mexe na
    // caixa dos blocos, e o ResizeObserver pega os três casos de uma vez.
    const observer = new ResizeObserver(() => {
      measure();
      draw();
    });
    observer.observe(container);
    for (const block of blockRefs.current) {
      if (block) observer.observe(block);
    }

    let frameId: number | null = null;
    let inView = true;

    const tick = () => {
      frameId = window.requestAnimationFrame(tick);
      draw();
    };

    const start = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frameId === null) return;
      window.cancelAnimationFrame(frameId);
      frameId = null;
    };

    const syncPlayback = () => {
      if (inView && document.visibilityState === "visible") start();
      else stop();
    };

    const viewObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0 },
    );
    viewObserver.observe(container);

    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();

    return () => {
      stop();
      observer.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, [progressRef]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <svg
        ref={svgRef}
        aria-hidden
        fill="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {LAYERS.map((layer, index) => (
          <g key={layer.key} style={{ stroke: layer.cssColor }}>
            <path
              ref={(element) => {
                pathRefs.current[index] = element;
              }}
              strokeWidth={1}
              strokeOpacity={0.7}
            />
            <circle
              ref={(element) => {
                dotRefs.current[index] = element;
              }}
              r={2.5}
              style={{ fill: layer.cssColor }}
              stroke="none"
            />
          </g>
        ))}
      </svg>

      {LAYERS.map((layer, index) => {
        const visible = stage >= stageForLayer(index);
        const featured = layer.key === "web2";
        return (
          <div
            key={layer.key}
            ref={(element) => {
              blockRefs.current[index] = element;
            }}
            aria-hidden={!visible}
            className={`absolute flex flex-col gap-2 pt-4 ${WIDTHS[index]} ${BOXES[index]} ${reveal(visible)}`}
          >
            <AreaCard
              index={`0${index + 1}`}
              areaKey={layer.key}
              variant={featured ? "featured" : "compact"}
              maxItems={MAX_ITEMS}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CircuitRoots;
