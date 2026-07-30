import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import {
  fibonacciSphere,
  neighborSpacing,
  shellLinkPositions,
  smoothstep,
} from "@/lib/planetGeometry";

/**
 * Três cascas concêntricas: Infra é o núcleo, Web2 o meio, Web3 a superfície.
 * O raio é a trajetória — a infra sustenta a web2, que sustenta a web3.
 *
 * As cores espelham --color-os2, --color-fg e --color-om3 de globals.css;
 * mudou lá, muda aqui.
 */
const SHELLS = [
  { color: 0xf4c542, count: 260, radius: 0.72, from: 0.1, to: 0.35 },
  { color: 0xdde5ee, count: 380, radius: 1.2, from: 0.32, to: 0.58 },
  { color: 0x22d3c5, count: 520, radius: 1.6, from: 0.55, to: 0.82 },
] as const;

// Raio comum das três cascas em repouso: fechadas uma sobre a outra, leem como
// um planeta sólido. A revelação é geométrica — as de fora se afastam e expõem
// o núcleo, que quase não se move.
const COLLAPSED_RADIUS = 0.67;

// Multiplicador sobre o espaçamento médio entre vizinhos. Ver Task 3, Step 2.
const LINK_FACTOR = 1.2;

const CAMERA_FOV = 45;
const CAMERA_Z = 5.2;
// Inclinação para o planeta não ser lido de frente exata.
const TILT_X = 0.35;
// Radianos por frame a 60fps: a cena continua viva se o visitante parar de rolar.
const SPIN_SPEED = 0.0009;

interface Shell {
  group: THREE.Group;
  pointsMaterial: THREE.PointsMaterial;
  lineMaterial: THREE.LineBasicMaterial;
  from: number;
  to: number;
  collapsedScale: number;
}

interface PlanetSceneProps {
  progressRef: MutableRefObject<number>;
  staticMode: boolean;
}

const PlanetScene: React.FC<PlanetSceneProps> = ({ progressRef, staticMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      // Sem WebGL a cena simplesmente não existe; nenhum conteúdo se perde,
      // porque todo texto vive no HTML.
      return;
    }

    // Retina não justifica 3x o custo de fill de um fundo.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearAlpha(0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.z = CAMERA_Z;

    const root = new THREE.Group();
    root.rotation.x = TILT_X;
    scene.add(root);

    // Geometria construída UMA vez, em raio próprio. A animação depois é só
    // escala de grupo e opacidade — nada é reescrito por frame.
    const shells: Shell[] = SHELLS.map((config) => {
      const points = fibonacciSphere(config.count, config.radius);
      const linkDistance = LINK_FACTOR * neighborSpacing(config.count, config.radius);
      const links = shellLinkPositions(points, linkDistance);

      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setAttribute("position", new THREE.BufferAttribute(points, 3));

      const pointsMaterial = new THREE.PointsMaterial({
        color: config.color,
        size: 0.028,
        transparent: true,
        depthWrite: false,
        // Aditivo sobre o ink dá a leitura de luz, não de tinta.
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const linkGeometry = new THREE.BufferGeometry();
      linkGeometry.setAttribute("position", new THREE.BufferAttribute(links, 3));

      const lineMaterial = new THREE.LineBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const group = new THREE.Group();
      group.add(new THREE.Points(pointsGeometry, pointsMaterial));
      group.add(new THREE.LineSegments(linkGeometry, lineMaterial));
      root.add(group);

      return {
        group,
        pointsMaterial,
        lineMaterial,
        from: config.from,
        to: config.to,
        // Todas as cascas partem do mesmo raio aparente.
        collapsedScale: COLLAPSED_RADIUS / config.radius,
      };
    });

    const applyProgress = (progress: number) => {
      for (const shell of shells) {
        const open = smoothstep(shell.from, shell.to, progress);
        const scale = shell.collapsedScale + (1 - shell.collapsedScale) * open;

        shell.group.scale.setScalar(scale);
        shell.pointsMaterial.opacity = 0.5 + 0.5 * open;
        shell.lineMaterial.opacity = 0.18 + 0.32 * open;
      }
    };

    // No modo estático a cena mostra o estado final: as três cascas abertas,
    // que é o mesmo que o HTML estático diz.
    applyProgress(staticMode ? 1 : progressRef.current);
    renderer.render(scene, camera);

    let frameId: number | null = null;
    let lastTime = 0;
    let inView = true;

    const tick = (time: number) => {
      frameId = window.requestAnimationFrame(tick);

      // Delta travado: uma aba que volta do background não pode dar um salto.
      const step = lastTime ? Math.min((time - lastTime) / 16.667, 3) : 1;
      lastTime = time;

      root.rotation.y += SPIN_SPEED * step;
      applyProgress(progressRef.current);
      renderer.render(scene, camera);
    };

    const start = () => {
      if (staticMode || frameId !== null) return;
      lastTime = 0;
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0 },
    );
    observer.observe(container);

    document.addEventListener("visibilitychange", syncPlayback);

    let resizeTimer: number | undefined;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);

        // Parado no modo estático, o resize é a única chance de acompanhar o
        // novo formato.
        if (staticMode) renderer.render(scene, camera);
      }, 150);
    };
    window.addEventListener("resize", handleResize);

    syncPlayback();

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", syncPlayback);
      observer.disconnect();

      for (const shell of shells) {
        shell.group.traverse((child) => {
          if (child instanceof THREE.Points || child instanceof THREE.LineSegments) {
            child.geometry.dispose();
          }
        });
        shell.pointsMaterial.dispose();
        shell.lineMaterial.dispose();
      }

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progressRef, staticMode]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    />
  );
};

export default PlanetScene;
