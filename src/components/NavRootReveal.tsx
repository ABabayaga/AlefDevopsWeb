import { useEffect, useRef, useState } from "react";
import { orthogonalRoot } from "@/lib/rootPath";
import {
  CLOSED_SCALE_BOOST,
  CLOSED_VERTICAL_OFFSET_VH,
  COLLAPSED_RADIUS,
  screenRadiusFraction,
} from "@/lib/shellStages";

/** Mesma janela de tempo de MORPH_MS em useIntroSequence: rápido o bastante
 *  pra não atrasar o modal, devagar o bastante pra ler como uma raiz crescendo. */
const DURATION_MS = 600;

/** Teto de espera pelo scroll-to-top antes de desenhar de qualquer jeito —
 *  evita que uma promessa de scroll travada prenda o clique pra sempre. */
const SETTLE_TIMEOUT_MS = 1200;

/** Ângulo livre na casca: os três já ocupam 150/5/215 (ver LAYERS em
 *  shellStages). 90° é o topo do planeta, o ponto mais próximo do header. */
const ANCHOR_ANGLE = 90;

interface NavRootRevealProps {
  /** Retângulo do item de nav clicado, capturado no momento do clique
   *  (a posição do header na viewport não muda com o scroll). */
  origin: DOMRect;
  onArrived: () => void;
}

/**
 * Raiz de disparo único: nasce no clique do nav (Trabalhos/Sobre mim) e cresce
 * até um ponto fixo na casca fechada do planeta, depois avisa que chegou.
 * Reaproveita o traçado ortogonal de CircuitRoots, mas sem o loop de rAF —
 * aqui é uma transição CSS de tiro só, não algo preso ao progresso do scroll.
 */
const NavRootReveal: React.FC<NavRootRevealProps> = ({ origin, onArrived }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let frameId: number | null = null;
    const deadline = Date.now() + SETTLE_TIMEOUT_MS;

    const waitForSettle = () => {
      if (cancelled) return;
      if (window.scrollY <= 1 || Date.now() > deadline) {
        setSettled(true);
        return;
      }
      frameId = window.requestAnimationFrame(waitForSettle);
    };

    waitForSettle();

    return () => {
      cancelled = true;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!settled) return;

    const container = containerRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!container || !svg || !path || !dot) return;

    const box = container.getBoundingClientRect();
    const width = box.width;
    const height = box.height;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const centerX = width / 2;
    // Só roda com o scroll assentado no topo (progress ≈ 0, ver waitForSettle
    // acima), então o planeta está sempre no boost cheio do fechado — mesmo
    // deslocamento vertical que PlanetScene aplica nesse estado, sem decair.
    const centerY = height / 2 + (CLOSED_VERTICAL_OFFSET_VH / 100) * height;
    const radius = screenRadiusFraction(COLLAPSED_RADIUS) * CLOSED_SCALE_BOOST * height;
    const radians = (ANCHOR_ANGLE * Math.PI) / 180;
    const anchorX = centerX + Math.cos(radians) * radius;
    const anchorY = centerY - Math.sin(radians) * radius;

    const entryX = origin.left + origin.width / 2 - box.left;
    const entryY = origin.top + origin.height / 2 - box.top;

    // far === entry: sem bloco de texto pra sublinhar aqui, a raiz só precisa
    // chegar exatamente no ponto do clique.
    const { d, length } = orthogonalRoot(
      { x: anchorX, y: anchorY },
      { x: entryX, y: entryY },
      { x: entryX, y: entryY },
    );

    path.setAttribute("d", d);
    path.style.transition = "none";
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    dot.setAttribute("cx", `${anchorX}`);
    dot.setAttribute("cy", `${anchorY}`);

    // Força o layout antes de animar — sem isso o browser funde os dois
    // estados num só frame e a transição não roda.
    void path.getBoundingClientRect();

    path.style.transition = `stroke-dashoffset ${DURATION_MS}ms var(--ease-out-quint)`;
    path.style.strokeDashoffset = "0";

    const timeout = window.setTimeout(onArrived, DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [settled, origin, onArrived]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <svg
        ref={svgRef}
        aria-hidden
        fill="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <g style={{ stroke: "var(--color-os2)" }}>
          <path ref={pathRef} strokeWidth={1} strokeOpacity={0.7} />
          <circle ref={dotRef} r={2.5} style={{ fill: "var(--color-os2)" }} stroke="none" />
        </g>
      </svg>
    </div>
  );
};

export default NavRootReveal;
