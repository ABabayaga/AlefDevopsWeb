# Hero: planeta de cascas concêntricas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o hero estático por uma cena WebGL de três cascas concêntricas — Infra no núcleo, Web2 no meio, Web3 na superfície — que se abrem de dentro para fora conforme o visitante rola.

**Architecture:** Um container de 300vh com filho `sticky` dá a distância de scroll. Um hook traduz a posição em dois valores de propósitos distintos: um `progressRef` contínuo que só o WebGL lê (zero re-render) e um `stage` discreto de 0 a 4 que dirige as classes CSS dos elementos em HTML. A cena constrói geometria uma única vez em raio unitário; a animação por frame é apenas escala de grupo, opacidade e rotação. Abaixo de 768px ou sob `prefers-reduced-motion`, o mesmo componente renderiza um ramo estático sem scroll narrativo.

**Tech Stack:** Next.js 14 (pages router), TypeScript strict, Tailwind v4 (CSS-first), `three` 0.185.1, `next-i18next`.

**Spec:** `docs/superpowers/specs/2026-07-30-hero-planeta-cascas-scroll-design.md`

## Global Constraints

- **Não há test runner neste repositório.** O ciclo de verificação de cada task é `npx tsc --noEmit` + `npm run build` + um checklist manual no navegador. Não introduza Jest, Vitest ou Playwright — está fora do escopo do spec.
- **`npm run lint` está quebrado e sai com código 0.** Ignore a saída `⨯ ESLint: Invalid Options` no build; o build só está quebrado se a compilação ou o type check falhar.
- **`tsconfig.json` compila `**/*.tsx` da raiz**, incluindo `src/pages-disabled/` e as sections desativadas. Um erro de tipo em código dormente quebra o build.
- **Zero chaves de locale novas.** Use apenas `title`, `hero_sub`, `hero_eyebrow`, `hero_whatsapp`, `hero_whatsapp_message`, `nav_label` e `areas.{infra,web2,web3}.{title,desc,stack}`, que já existem em `public/locales/pt/common.json` e `public/locales/en/common.json`.
- **Não altere copy.** Nenhuma string de locale muda neste plano.
- **Tailwind v4 apenas.** Sem `tailwind.config.js`; tokens vivem em `@theme` dentro de `src/styles/globals.css`. Use os tokens (`ink`, `surface`, `line`, `fg`, `fg-muted`, `os2`, `om3`), nunca hex cru no JSX.
- **Comentários de código em português, explicando *por quê*, não *o quê*.** É o padrão do repositório.
- **Cores em hex no WebGL** (`0xf4c542`, `0xdde5ee`, `0x22d3c5`) devem levar comentário dizendo que espelham `--color-os2`, `--color-fg` e `--color-om3` em `globals.css`.
- **`alias @/*` → `src/*`.** `strict` está ligado.
- **Toda camada de cena leva `aria-hidden` e `pointer-events-none`.**
- Os valores numéricos de calibração (contagens de pontos, raios, fatores de ligação, opacidades, velocidade de rotação) são pontos de partida do spec. Implemente-os como constantes nomeadas no topo do arquivo para que ajuste seja troca de número.

---

### Task 1: Constante de WhatsApp compartilhada

Hoje o número vive só em `Hero.tsx`. A Task 8 precisa dele no `Header` também, e duplicar um número de telefone em dois arquivos é como ele fica errado.

**Files:**
- Create: `src/lib/whatsapp.ts`
- Modify: `src/components/sections/Hero.tsx:4-12`

**Interfaces:**
- Consumes: nada
- Produces: `WHATSAPP_NUMBER: string`, `whatsappHref(message: string): string`

- [ ] **Step 1: Criar o módulo**

`src/lib/whatsapp.ts`:

```ts
// wa.me só aceita dígitos, com DDI e DDD e sem sinais de pontuação.
export const WHATSAPP_NUMBER = "5567981846847";

/** `message` é o texto já traduzido — o encode é responsabilidade daqui. */
export function whatsappHref(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 2: Apontar o Hero para o módulo**

Em `src/components/sections/Hero.tsx`, remova a constante local `WHATSAPP_NUMBER` e a construção inline da URL, e troque por:

```tsx
import { whatsappHref } from "@/lib/whatsapp";
```

e dentro do componente:

```tsx
const href = whatsappHref(t("hero_whatsapp_message"));
```

Use `href` no `<a>` que hoje usa `whatsappHref`.

- [ ] **Step 3: Verificar tipos e build**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros de tipo; build conclui com `✓ Generating static pages (8/8)`.

- [ ] **Step 4: Conferir no navegador**

Run: `npm run dev`, abrir a home, clicar no CTA do WhatsApp.
Expected: abre o wa.me com a mensagem pré-preenchida, igual a antes. Trocar o idioma pelo `LanguageSwitcher` e confirmar que a mensagem muda.

- [ ] **Step 5: Commit**

```bash
git add src/lib/whatsapp.ts src/components/sections/Hero.tsx
git commit -m "refactor: extrai número do WhatsApp para módulo compartilhado"
```

---

### Task 2: Hook de progresso de scroll

O hook é puro cálculo e não depende do WebGL, então vem antes da cena e pode ser conferido sozinho.

**Files:**
- Create: `src/hooks/useScrollProgress.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `STATIC_BREAKPOINT: number` (768)
  - `STAGE_THRESHOLDS: readonly number[]` (`[0.1, 0.32, 0.55, 0.85]`)
  - `prefersStaticHero(): boolean`
  - `stageFromProgress(progress: number): number`
  - `useScrollProgress(containerRef: RefObject<HTMLElement>, enabled: boolean): { progressRef: MutableRefObject<number>; stage: number }`

- [ ] **Step 1: Escrever o hook**

`src/hooks/useScrollProgress.ts`:

```ts
import { useEffect, useRef, useState } from "react";
import type { MutableRefObject, RefObject } from "react";

// Abaixo disto o hero é estático: WebGL pinado em celular custa bateria e o
// scroll narrativo atrapalha mais do que entrega.
export const STATIC_BREAKPOINT = 768;

// Limiares que separam os estágios da narrativa. Espelham as janelas de
// progresso das cascas em PlanetScene — mudou lá, muda aqui.
export const STAGE_THRESHOLDS = [0.1, 0.32, 0.55, 0.85] as const;

/**
 * Decide entre a versão animada e a estática. Chamado uma vez, na montagem:
 * alternar por resize remontaria a cena a cada giro de celular.
 */
export function prefersStaticHero(): boolean {
  if (typeof window === "undefined") return true;
  if (window.innerWidth < STATIC_BREAKPOINT) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function stageFromProgress(progress: number): number {
  let stage = 0;
  for (const threshold of STAGE_THRESHOLDS) {
    if (progress >= threshold) stage += 1;
  }
  return stage;
}

interface ScrollProgress {
  /** Contínuo, 0 a 1. Lido pelo WebGL a cada frame — não causa re-render. */
  progressRef: MutableRefObject<number>;
  /** Discreto, 0 a 4. Dirige as classes do HTML — cinco re-renders no total. */
  stage: number;
}

export function useScrollProgress(
  containerRef: RefObject<HTMLElement>,
  enabled: boolean,
): ScrollProgress {
  const progressRef = useRef(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    let frameId: number | null = null;

    const measure = () => {
      frameId = null;

      const rect = container.getBoundingClientRect();
      // O curso útil é a altura do container menos a tela que fica parada.
      const travel = rect.height - window.innerHeight;
      const raw = travel > 0 ? -rect.top / travel : 0;
      const progress = Math.min(Math.max(raw, 0), 1);

      progressRef.current = progress;
      // setState com valor idêntico não re-renderiza, então não há guarda extra.
      setStage(stageFromProgress(progress));
    };

    const onScroll = () => {
      // Dedupe por frame: o evento de scroll dispara muito mais que 60x/s.
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [containerRef, enabled]);

  return { progressRef, stage };
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros. O arquivo ainda não é importado por ninguém, mas `tsconfig` compila a raiz inteira, então um erro aqui já apareceria.

- [ ] **Step 3: Conferir a matemática de `stageFromProgress` no nó**

Run:

```bash
npx tsx -e "
const T=[0.1,0.32,0.55,0.85];
const s=(p)=>T.reduce((a,t)=>p>=t?a+1:a,0);
for (const p of [0, 0.09, 0.1, 0.31, 0.32, 0.54, 0.55, 0.84, 0.85, 1])
  console.log(p, '->', s(p));
" 2>/dev/null || node -e "
const T=[0.1,0.32,0.55,0.85];
const s=(p)=>T.reduce((a,t)=>p>=t?a+1:a,0);
for (const p of [0, 0.09, 0.1, 0.31, 0.32, 0.54, 0.55, 0.84, 0.85, 1])
  console.log(p, '->', s(p));
"
```

Expected, exatamente:

```
0 -> 0
0.09 -> 0
0.1 -> 1
0.31 -> 1
0.32 -> 2
0.54 -> 2
0.55 -> 3
0.84 -> 3
0.85 -> 4
1 -> 4
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useScrollProgress.ts
git commit -m "feat: hook de progresso de scroll com estágios discretos"
```

---

### Task 3: Geometria das cascas

Só a construção da geometria, isolada e testável fora do React. A cena que a consome vem na Task 4.

**Files:**
- Create: `src/lib/planetGeometry.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `fibonacciSphere(count: number, radius: number): Float32Array`
  - `shellLinkPositions(points: Float32Array, linkDistance: number): Float32Array`
  - `neighborSpacing(count: number, radius: number): number`
  - `smoothstep(edge0: number, edge1: number, x: number): number`

- [ ] **Step 1: Escrever o módulo**

`src/lib/planetGeometry.ts`:

```ts
/**
 * Pontos distribuídos por espiral de Fibonacci. Distribuição aleatória em
 * esfera empilha nos polos e o erro é visível a olho nu.
 */
export function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = count > 1 ? 1 - (i / (count - 1)) * 2 : 0;
    const ring = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = goldenAngle * i;

    const i3 = i * 3;
    positions[i3] = Math.cos(theta) * ring * radius;
    positions[i3 + 1] = y * radius;
    positions[i3 + 2] = Math.sin(theta) * ring * radius;
  }

  return positions;
}

/**
 * Espaçamento médio entre vizinhos na superfície: raiz da área por ponto.
 * Serve para a distância de ligação escalar junto com raio e contagem, em vez
 * de virar um número mágico por casca.
 */
export function neighborSpacing(count: number, radius: number): number {
  if (count <= 0) return 0;
  return radius * Math.sqrt((4 * Math.PI) / count);
}

/**
 * Pares de vértices para um LineSegments, calculados UMA vez. As cascas são
 * rígidas — os pontos não derivam entre si, só o raio do grupo escala — então
 * a geometria nunca precisa ser reescrita por frame.
 */
export function shellLinkPositions(
  points: Float32Array,
  linkDistance: number,
): Float32Array {
  const count = points.length / 3;
  const maxSq = linkDistance * linkDistance;
  const segments: number[] = [];

  for (let a = 0; a < count; a++) {
    const a3 = a * 3;

    for (let b = a + 1; b < count; b++) {
      const b3 = b * 3;

      const dx = points[a3] - points[b3];
      const dy = points[a3 + 1] - points[b3 + 1];
      const dz = points[a3 + 2] - points[b3 + 2];
      if (dx * dx + dy * dy + dz * dz > maxSq) continue;

      segments.push(
        points[a3], points[a3 + 1], points[a3 + 2],
        points[b3], points[b3 + 1], points[b3 + 2],
      );
    }
  }

  return new Float32Array(segments);
}

/** Interpolação com derivada nula nas pontas: a casca não parte nem para seco. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}
```

- [ ] **Step 2: Verificar as propriedades da geometria no nó**

Este é o teste que substitui um test runner: confere que todo ponto cai na esfera pedida, que os polos não empilham, e que a contagem de ligações fica na faixa útil.

Run:

```bash
cat > ./planet-check.mjs <<'EOF'
const golden = Math.PI * (3 - Math.sqrt(5));
function fib(count, radius) {
  const p = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = count > 1 ? 1 - (i / (count - 1)) * 2 : 0;
    const ring = Math.sqrt(Math.max(1 - y * y, 0));
    const th = golden * i, i3 = i * 3;
    p[i3] = Math.cos(th) * ring * radius;
    p[i3 + 1] = y * radius;
    p[i3 + 2] = Math.sin(th) * ring * radius;
  }
  return p;
}
function links(p, d) {
  const n = p.length / 3, m = d * d; let c = 0;
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
    const a3 = a*3, b3 = b*3;
    const dx=p[a3]-p[b3], dy=p[a3+1]-p[b3+1], dz=p[a3+2]-p[b3+2];
    if (dx*dx+dy*dy+dz*dz <= m) c++;
  }
  return c;
}
const spacing = (n, r) => r * Math.sqrt(4 * Math.PI / n);
for (const [n, r] of [[260, 0.72], [380, 1.20], [520, 1.60]]) {
  const p = fib(n, r);
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < n; i++) {
    const i3 = i*3;
    const d = Math.hypot(p[i3], p[i3+1], p[i3+2]);
    min = Math.min(min, d); max = Math.max(max, d);
  }
  const l = links(p, 1.2 * spacing(n, r));
  console.log(`n=${n} r=${r} raio[${min.toFixed(4)}, ${max.toFixed(4)}] ligacoes=${l} media=${(2*l/n).toFixed(2)}`);
}
EOF
node ./planet-check.mjs
rm ./planet-check.mjs
```

Expected: para cada linha, `raio[...]` com mínimo e máximo iguais ao `r` pedido até 4 casas (todo ponto está na esfera), e `media` entre 2 e 6 ligações por ponto. Se a média sair fora dessa faixa, ajuste `LINK_FACTOR` na Task 4 — abaixo de 2 a casca lê como poeira, acima de 6 vira uma bola opaca.

O script é descartável e é removido no mesmo passo; não deve ser comitado.

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/lib/planetGeometry.ts
git commit -m "feat: geometria das cascas do planeta em espiral de Fibonacci"
```

---

### Task 4: A cena WebGL

**Files:**
- Create: `src/components/PlanetScene.tsx`

**Interfaces:**
- Consumes: `fibonacciSphere`, `shellLinkPositions`, `neighborSpacing`, `smoothstep` de `@/lib/planetGeometry`
- Produces: `default` export `PlanetScene: React.FC<PlanetSceneProps>` com
  ```ts
  interface PlanetSceneProps {
    progressRef: MutableRefObject<number>;
    staticMode: boolean;
  }
  ```

- [ ] **Step 1: Escrever o componente**

`src/components/PlanetScene.tsx`:

```tsx
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
```

- [ ] **Step 2: Verificar tipos e build**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros de tipo; build conclui. O componente ainda não é montado por ninguém, então o tamanho da rota `/` não muda.

- [ ] **Step 3: Commit**

```bash
git add src/components/PlanetScene.tsx
git commit -m "feat: cena das três cascas concêntricas em three.js"
```

---

### Task 5: Indicador de scroll no CSS

Com a primeira tela virando uma cena, nada mais sinaliza que existe página abaixo. O `.scroll-cue` foi deletado no design das áreas de experiência porque não havia conteúdo abaixo; agora há.

**Files:**
- Modify: `src/styles/globals.css:73-111` (dentro de `@layer components`)

**Interfaces:**
- Consumes: `--color-line`, `--color-os2`, `--ease-out-quint` do `@theme`
- Produces: classe `.scroll-cue`

- [ ] **Step 1: Acrescentar a classe ao fim de `@layer components`**

Em `src/styles/globals.css`, logo depois do bloco `.measure` e ainda dentro de `@layer components`:

```css
  /* Um pulso descendo um filete. Sinaliza que a cena do hero não é a página
     inteira — sem isso, os 300vh de narrativa ficam invisíveis.
     Reusa --ease-out-quint, que ficou órfão quando as animações do OTDR saíram. */
  .scroll-cue {
    position: relative;
    width: 1px;
    height: 3rem;
    overflow: hidden;
    background: linear-gradient(to bottom, var(--color-line), transparent);
  }

  .scroll-cue::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    height: 40%;
    background: var(--color-os2);
    animation: scroll-cue-run 2.2s var(--ease-out-quint) infinite;
  }

  @keyframes scroll-cue-run {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    35% {
      opacity: 1;
    }
    100% {
      transform: translateY(300%);
      opacity: 0;
    }
  }
```

Não é preciso escrever regra de `prefers-reduced-motion`: o bloco global em `@layer base` já colapsa `animation-duration` para `0.01ms`.

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: build conclui. Uma classe não usada não quebra nada; a Task 7 a consome.

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat: reintroduz o indicador de scroll"
```

---

### Task 6: Extrair o conteúdo do card de área

Os dois ramos do Hero mostram as mesmas quatro informações por área — número, título,
descrição e stack — em layouts diferentes: faixa de três colunas no estático, coluna
empilhada com entrada individual no coreografado. O **conteúdo** é o mesmo; só o
**contêiner** muda. Esta task extrai o conteúdo antes que a Task 7 o duplique.

A fronteira é deliberada: `AreaCard` devolve um fragmento e não conhece `<li>`, grid nem
padding. Quem usa é dono do contêiner e do layout. Sem props de variante, sem condicional
de estilo.

**Files:**
- Create: `src/components/AreaCard.tsx`
- Modify: `src/components/ExpertiseAreas.tsx:22-46`

**Interfaces:**
- Consumes: nada
- Produces: `default` export `AreaCard: React.FC<AreaCardProps>` com
  ```ts
  interface AreaCardProps {
    /** "01" | "02" | "03" — decorativo, leva aria-hidden. */
    index: string;
    /** Chave do locale: "infra" | "web2" | "web3". */
    areaKey: string;
  }
  ```

- [ ] **Step 1: Criar o componente**

`src/components/AreaCard.tsx`:

```tsx
import { useTranslation } from "next-i18next";

interface AreaCardProps {
  /** "01" | "02" | "03" — decorativo, leva aria-hidden. */
  index: string;
  /** Chave do locale: "infra" | "web2" | "web3". */
  areaKey: string;
}

/**
 * O conteúdo de uma área, sem contêiner. Devolve um fragmento de propósito:
 * o hero mostra as mesmas quatro informações em dois layouts diferentes, então
 * quem usa é dono do <li>, do grid e do padding — aqui mora só o que se lê.
 *
 * A numeração é a régua de eventos do traço de OTDR que ocupava esta coluna
 * antes: o gráfico saiu, a gramática do instrumento ficou.
 */
const AreaCard: React.FC<AreaCardProps> = ({ index, areaKey }) => {
  const { t } = useTranslation("common");

  return (
    <>
      <span aria-hidden className="type-label text-om3">
        {index}
      </span>

      <h2 className="type-display m-0 text-[1.375rem] text-fg">
        {t(`areas.${areaKey}.title`)}
      </h2>

      <p className="m-0 text-[0.9375rem] leading-relaxed text-fg-muted">
        {t(`areas.${areaKey}.desc`)}
      </p>

      {/* mt-auto alinha a stack pela base quando as colunas têm alturas
          diferentes; num contêiner de altura própria é inofensivo. */}
      <p className="m-0 mt-auto pt-3 font-mono text-[0.6875rem] leading-relaxed tracking-[0.14em] text-fg-muted/75">
        {t(`areas.${areaKey}.stack`)}
      </p>
    </>
  );
};

export default AreaCard;
```

- [ ] **Step 2: Consumir em `ExpertiseAreas`**

Em `src/components/ExpertiseAreas.tsx`, acrescente o import:

```tsx
import AreaCard from "@/components/AreaCard";
```

O `useTranslation` deixa de ser usado neste arquivo — remova a linha `const { t } =
useTranslation("common");` e o import de `useTranslation`, senão o build carrega binding
morto. Troque o corpo do `<li>` (linhas 28-44) por:

```tsx
          <AreaCard index={area.id} areaKey={area.key} />
```

O `<li>` e suas classes ficam exatamente como estão — é ele que define a faixa de três
colunas.

- [ ] **Step 3: Verificar tipos e build**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros; build conclui com 8 páginas.

- [ ] **Step 4: Conferir que nada mudou visualmente**

Run: `npm run dev`, abrir a home.
Expected: a faixa das três áreas está **pixel a pixel igual** a antes — mesma numeração
aqua, mesmos títulos, mesmo alinhamento da stack pela base. Esta task é refatoração pura;
qualquer diferença visível é um bug. Conferir também em ~375px, onde a faixa vira uma
coluna, e nos dois idiomas.

- [ ] **Step 5: Commit**

```bash
git add src/components/AreaCard.tsx src/components/ExpertiseAreas.tsx
git commit -m "refactor: extrai o conteúdo do card de área"
```

---

### Task 7: Reescrita do Hero

O maior passo do plano. Um componente, dois ramos: estático e coreografado.

**Files:**
- Modify: `src/components/sections/Hero.tsx` (reescrita completa)

**Interfaces:**
- Consumes: `whatsappHref` de `@/lib/whatsapp`; `prefersStaticHero`, `useScrollProgress` de `@/hooks/useScrollProgress`; `PlanetScene` de `@/components/PlanetScene`; `ExpertiseAreas` de `@/components/ExpertiseAreas`; `AreaCard` de `@/components/AreaCard`
- Produces: `default` export `Hero: React.FC`

- [ ] **Step 1: Reescrever o componente**

`src/components/sections/Hero.tsx`, arquivo inteiro:

```tsx
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import AreaCard from "@/components/AreaCard";
import ExpertiseAreas from "@/components/ExpertiseAreas";
import { prefersStaticHero, useScrollProgress } from "@/hooks/useScrollProgress";
import { whatsappHref } from "@/lib/whatsapp";

// ssr:false mantém o three fora do JS da primeira pintura e do HTML estático.
const PlanetScene = dynamic(() => import("@/components/PlanetScene"), { ssr: false });

const AREA_KEYS = ["infra", "web2", "web3"] as const;

/** Entrada e saída dos blocos coreografados. */
function reveal(visible: boolean): string {
  return `transition-[opacity,transform] duration-700 ease-[var(--ease-out-quint)] ${
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
  }`;
}

const Hero: React.FC = () => {
  const { t } = useTranslation("common");
  const containerRef = useRef<HTMLElement>(null);

  // Começa estático de propósito: é o que o servidor renderiza, então o HTML
  // entregue já traz headline, sub, as três áreas e o CTA. O desktop promove
  // para a versão coreografada depois de montar.
  const [isStatic, setIsStatic] = useState(true);
  useEffect(() => {
    setIsStatic(prefersStaticHero());
  }, []);

  const { progressRef, stage } = useScrollProgress(containerRef, !isStatic);

  const href = whatsappHref(t("hero_whatsapp_message"));

  const eyebrow = (
    <p className="type-label mb-6 flex items-center gap-3 text-fg-muted">
      <span aria-hidden className="h-px w-8 shrink-0 bg-os2" />
      <span className="min-w-0 leading-relaxed">{t("hero_eyebrow")}</span>
    </p>
  );

  const cta = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="type-label inline-block rounded-full bg-os2 px-6 py-3.5 text-ink no-underline transition-opacity hover:opacity-85"
    >
      {t("hero_whatsapp")}
    </a>
  );

  // Versão estática: mobile, prefers-reduced-motion e o HTML do servidor.
  // Mesmos textos, mesmas chaves — o que muda é só a apresentação.
  if (isStatic) {
    return (
      <section className="relative overflow-hidden">
        <PlanetScene progressRef={progressRef} staticMode />

        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 lg:pt-24 lg:pb-28">
          {eyebrow}
          <h1 className="type-display type-hero m-0 max-w-[18ch] text-fg">{t("title")}</h1>
          <p className="measure mt-7 text-fg-muted">{t("hero_sub")}</p>
          <div className="mt-10">{cta}</div>
          <ExpertiseAreas />
        </div>
      </section>
    );
  }

  return (
    // 300vh é a distância de scroll que a narrativa consome; o filho sticky é
    // a tela que fica parada enquanto isso.
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <PlanetScene progressRef={progressRef} staticMode={false} />

        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-2 items-center gap-12 px-8">
          <div>
            <div className={reveal(stage === 0)} aria-hidden={stage !== 0}>
              {eyebrow}
              <h1 className="type-display type-hero m-0 max-w-[16ch] text-fg">
                {t("title")}
              </h1>
              <p className="measure mt-7 text-fg-muted">{t("hero_sub")}</p>
            </div>

            <div className={`mt-10 ${reveal(stage >= 4)}`} aria-hidden={stage < 4}>
              {cta}
            </div>
          </div>

          <ul className="m-0 flex list-none flex-col gap-px bg-line p-0">
            {AREA_KEYS.map((key, index) => {
              const visible = stage >= index + 1;
              return (
                <li
                  key={key}
                  aria-hidden={!visible}
                  className={`flex flex-col gap-3 bg-ink px-6 py-7 ${reveal(visible)}`}
                >
                  <AreaCard index={`0${index + 1}`} areaKey={key} />
                </li>
              );
            })}
          </ul>
        </div>

        <div
          aria-hidden
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 ${reveal(stage === 0)}`}
        >
          <span className="scroll-cue block" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
```

- [ ] **Step 2: Verificar tipos e build**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros de tipo; build conclui com 8 páginas.

- [ ] **Step 3: Conferir o HTML servido, antes da hidratação**

Run:

Suba `npm run dev` e use a porta que ele imprimir (o Next pula para 3001, 3002… se a 3000
estiver ocupada). Com `PORT` sendo essa porta:

```bash
curl -s "http://localhost:$PORT/" > hero-check.html
grep -c "Infraestrutura" hero-check.html
grep -c "Falar no WhatsApp" hero-check.html
grep -o '<h1[^>]*>[^<]*</h1>' hero-check.html
rm hero-check.html
```

Expected: contagem ≥ 1 para "Infraestrutura" e para "Falar no WhatsApp", e o `<h1>` presente. É a garantia de que nenhuma informação vive apenas na animação. Se der 0, o ramo estático não está sendo o padrão de SSR — corrija o valor inicial de `isStatic`.

- [ ] **Step 4: Conferir a coreografia no navegador**

Abrir a home em desktop (≥768px) e:

1. Primeira tela: headline, sub, eyebrow e o indicador de scroll visíveis; as três áreas invisíveis; sem CTA.
2. Rolar devagar: o planeta abre casca por casca e cada área entra na sua vez e **permanece**.
3. Ao fim dos 300vh: as três áreas visíveis, o CTA visível, a headline sumida.
4. **Rolar rápido de cima a baixo e de volta, cinco vezes.** Nenhuma casca pode ficar presa em estado intermediário, e `stage` não pode dessincronizar de `progress`.
5. Trocar o idioma pelo `LanguageSwitcher` e repetir o passo 2 em inglês.
6. **Contraste.** Parar a rolagem no ponto em que a cena está mais densa atrás do texto e
   conferir que headline, sub e rótulos continuam confortavelmente legíveis. Se não
   estiverem, quem cede é a cena: baixe as opacidades base em `applyProgress`, nunca o
   peso ou a cor do texto.

- [ ] **Step 5: Conferir os dois fallbacks**

1. Estreitar a janela para ~375px e recarregar: layout empilhado, sem 300vh, planeta parado nas cascas abertas.
2. DevTools → Rendering → *Emulate CSS prefers-reduced-motion: reduce*, recarregar em desktop: mesma versão estática, planeta parado.

- [ ] **Step 6: Registrar o delta de bundle**

Run: `npm run build`
Expected: anote o `Size` e o `First Load JS` da rota `/`. A referência antes deste plano é `11.6 kB` / `108 kB`, e o chunk lazy do `three` mede ~80 kB gzipped. O `three` deve continuar **fora** do First Load — se o First Load pular para ~190 kB, o `ssr: false` do `next/dynamic` foi perdido.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: hero com planeta de cascas dirigido por scroll"
```

---

### Task 8: WhatsApp no Header

Com o CTA aparecendo só em `progress ≥ 0.85`, quem abre o site e não rola nunca vê o botão. O header é `sticky`, então uma entrada aqui deixa o contato alcançável em qualquer ponto dos 300vh.

**Files:**
- Modify: `src/components/Header.tsx:26-29` (o array `navItems`), `:52-64` (nav desktop), `:112-121` (gaveta mobile)

**Interfaces:**
- Consumes: `whatsappHref` de `@/lib/whatsapp`
- Produces: nada consumido por outras tasks

- [ ] **Step 1: Tipar e preencher `navItems`**

Em `src/components/Header.tsx`, acrescente ao import:

```tsx
import { whatsappHref } from "@/lib/whatsapp";
```

E troque o bloco de `navItems` (linhas 26-29) por:

```tsx
  // O CTA do hero só aparece no fim da narrativa de scroll; o header é sticky,
  // então é aqui que o contato fica sempre alcançável.
  const navItems: NavItem[] = [
    { href: whatsappHref(t("hero_whatsapp_message")), label: t("hero_whatsapp"), external: true },
  ];
```

Acima do componente, junto de `socialLinks`, declare o tipo e o renderizador — os dois `map` (barra desktop e gaveta) precisam do mesmo comportamento, e duplicar a lógica de link externo é como os `rel` se perdem:

```tsx
interface NavItem {
  href: string;
  label: string;
  /** Link externo: abre em aba nova e leva rel de segurança. */
  external?: boolean;
}

const NavEntry: React.FC<{
  item: NavItem;
  className: string;
  onNavigate?: () => void;
}> = ({ item, className, onNavigate }) => {
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={className}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} onClick={onNavigate} className={className}>
      {item.label}
    </Link>
  );
};
```

- [ ] **Step 2: Usar `NavEntry` nos dois `map`**

No `<nav>` desktop (linhas 54-62), troque o `<Link>` por:

```tsx
            {navItems.map((item) => (
              <NavEntry
                key={item.href}
                item={item}
                className="type-label text-fg-muted no-underline transition-colors hover:text-fg"
              />
            ))}
```

Na gaveta mobile (linhas 112-121), troque por:

```tsx
            {navItems.map((item) => (
              <NavEntry
                key={item.href}
                item={item}
                onNavigate={() => setOpen(false)}
                className="type-label border-b border-line-soft py-4 text-fg-muted no-underline transition-colors hover:text-fg"
              />
            ))}
```

O `navItems.length > 0 &&` da linha 52 e o `navItems.length > 0 ?` da linha 125 continuam como estão — agora simplesmente avaliam verdadeiro.

- [ ] **Step 3: Verificar tipos e build**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros; build conclui.

- [ ] **Step 4: Conferir no navegador**

1. Desktop: o item "Falar no WhatsApp" aparece na barra; clicar abre o wa.me em aba nova com a mensagem preenchida.
2. Mobile (~375px): abrir o hambúrguer; o item aparece na gaveta com o filete de baixo, e a linha de redes sociais agora tem o filete de topo (o ternário da linha 125 passou a ser verdadeiro). Clicar fecha a gaveta e abre o wa.me.
3. Trocar o idioma e confirmar que o rótulo vira "Chat on WhatsApp" e a mensagem muda.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: contato do WhatsApp no header"
```

---

### Task 9: Remoção do NetworkMesh e verificação final

**Files:**
- Delete: `src/components/NetworkMesh.tsx`
- Modify: `CLAUDE.md`, `README.md`

**Interfaces:**
- Consumes: nada
- Produces: nada

- [ ] **Step 1: Confirmar que nada importa o NetworkMesh**

Run: `grep -rn "NetworkMesh" src/ docs/ README.md CLAUDE.md`
Expected: nenhuma ocorrência em `src/` fora do próprio arquivo. Menções nos specs em `docs/` são históricas e ficam. Se `src/` tiver alguma, pare e resolva antes de deletar.

- [ ] **Step 2: Deletar**

```bash
git rm src/components/NetworkMesh.tsx
```

A técnica de ligações sobrevive em `src/lib/planetGeometry.ts`, e o arquivo fica no histórico do git.

- [ ] **Step 3: Atualizar `CLAUDE.md`**

A seção "Architecture" descreve o hero como "`Header`, `Hero`, `Footer`, `<Analytics />`. That is the whole page." e diz que `Hero.tsx` tem "one WhatsApp CTA". Isso deixou de ser verdade. Ajuste:

- A descrição de `Hero.tsx` passa a mencionar os dois ramos (estático e coreografado), o container de 300vh e o `sticky`.
- Acrescente `src/hooks/useScrollProgress.ts`, `src/lib/planetGeometry.ts`, `src/lib/whatsapp.ts` e `src/components/PlanetScene.tsx` com uma linha cada.
- A seção "Styling" diz que `--ease-out-quint` "is still declared in `@theme` but is now orphaned". Ele voltou a ser usado — corrija.
- `Header.tsx` não tem mais `navItems` vazio. Corrija a frase que diz que ele está vazio como ponto de reengate.
- A seção "Contact" diz que "The live path is the WhatsApp CTA in the hero" — agora também há o do header.

- [ ] **Step 4: Atualizar `README.md`**

O `README.md` é o doc humano em português. Mantenha a lista de stack em sincronia: acrescente `three` às tecnologias.

- [ ] **Step 5: Verificação final completa**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros de tipo; `✓ Generating static pages (8/8)`.

Run: `grep -rn "otdr\|NetworkMesh" src/`
Expected: apenas a menção a equipamentos de OTDR em `SkillsSection.tsx` (texto de currículo) e a chave `areas.infra.stack`.

Run:

```bash
node -e "
const p=require('./public/locales/pt/common.json');
const e=require('./public/locales/en/common.json');
const flat=(o,pre='')=>Object.entries(o).flatMap(([k,v])=>
  typeof v==='object'?flat(v,pre+k+'.'):[pre+k]);
const a=flat(p).sort(), b=flat(e).sort();
console.log('pt:',a.length,'en:',b.length,'iguais:',JSON.stringify(a)===JSON.stringify(b));
"
```
Expected: `iguais: true` e a mesma contagem dos dois lados — nenhuma chave foi adicionada nem removida.

No navegador, o passe completo: desktop com a narrativa inteira, scroll rápido de ida e volta cinco vezes, ~375px estático, `prefers-reduced-motion` estático, e os dois idiomas.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove NetworkMesh e atualiza docs para o hero do planeta"
```

---

## Nota sobre calibração

Os valores de `SHELLS`, `COLLAPSED_RADIUS`, `LINK_FACTOR`, `SPIN_SPEED`, `size` dos pontos e as opacidades em `applyProgress` são pontos de partida derivados do spec, não números conferidos a olho. Espere ajustá-los depois de ver a cena rodando. Todos são constantes nomeadas no topo de `PlanetScene.tsx` justamente para que ajuste seja troca de número, não refatoração.

O sintoma mais provável é a cena pequena ou apagada demais: nesse caso mexa em `CAMERA_Z` (menor aproxima) e nas opacidades base de `applyProgress`, nessa ordem.
