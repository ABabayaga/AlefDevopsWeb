# Raízes por camada no hero — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a pilha de cards do hero coreografado por uma raiz ortogonal que sai de cada casca do planeta e cresce, presa ao scroll, até o bloco de texto daquela camada, disposto em radial.

**Architecture:** Uma tabela única de camadas (`shellStages.ts`) passa a alimentar a cena WebGL, os limiares de estágio e as raízes. Um `<svg>` sobreposto ao hero desenha três `<path>` ortogonais; um `rAF` próprio lê o `progressRef` que já existe e escreve `d`, `strokeDasharray` e `strokeDashoffset` por frame, sem re-render do React. Os blocos de texto continuam sendo `<AreaCard>` em HTML, posicionados em absoluto ao redor do planeta.

**Tech Stack:** Next.js 14 (pages router), TypeScript strict, Tailwind CSS v4 (config CSS-first em `src/styles/globals.css`), `three` cru, `next-i18next`.

**Spec:** [`docs/superpowers/specs/2026-07-30-hero-raizes-por-camada-design.md`](../specs/2026-07-30-hero-raizes-por-camada-design.md)

## Global Constraints

- **Não existe test runner neste repositório.** Verificar uma mudança é `npx tsc --noEmit` passar, `npm run build` passar, e a checagem visual descrita em cada tarefa. Não instalar vitest/jest — está fora de escopo.
- **`npm run lint` está quebrado e sai com código 0 mesmo assim.** O `npm run build` imprime `⨯ ESLint: Invalid Options` e constrói mesmo assim. Só erro de compilação ou de tipo quebra o build de verdade. Ignorar a linha de ESLint.
- **Nenhuma dependência nova.** Nem para animação, nem para SVG, nem para teste.
- **Comentários em português, explicando o *porquê*, não o *quê*.** É o padrão do repositório inteiro.
- **Só tokens do `@theme`** — `ink`, `surface`, `raised`, `line`, `line-soft`, `fg`, `fg-muted`, `os2` (`#f4c542`), `om3` (`#22d3c5`). Nada de hex solto nem da paleta padrão do Tailwind. Não existe `tailwind.config.js`.
- **Nenhuma chave de locale nova.** As três áreas já têm `areas.infra|web2|web3.{title,desc,stack}` em `public/locales/pt/common.json` e `public/locales/en/common.json`. Não adicionar, não remover, não renomear.
- **O ramo estático do hero não muda.** Mobile (`< 768px`), `prefers-reduced-motion` e o HTML do servidor continuam sendo eyebrow + `<h1>` + sub + CTA + `<ExpertiseAreas />`, byte por byte.
- **Alias de import:** `@/*` → `src/*`.

---

### Task 1: Tabela única de camadas

Hoje a mesma tabela existe duas vezes: `SHELLS` em `PlanetScene.tsx:18-22` e `STAGE_THRESHOLDS` em `useScrollProgress.ts:10`, com um comentário pedindo "mudou lá, muda aqui". As raízes precisam dos mesmos números — seriam a terceira cópia. Esta tarefa cria a fonte única e liga a cena nela. Os limiares de estágio só migram na Task 4, junto com a mudança de semântica deles.

**Files:**
- Create: `src/lib/shellStages.ts`
- Modify: `src/components/PlanetScene.tsx`

**Interfaces:**
- Consumes: `smoothstep` de `@/lib/planetGeometry` (já existe).
- Produces: `Layer`, `LAYERS`, `CAMERA_FOV`, `CAMERA_Z`, `COLLAPSED_RADIUS`, `screenRadiusFraction(radius: number): number`, `layerScreenRadius(layer: Layer, open: number): number`.

- [ ] **Step 1: Criar `src/lib/shellStages.ts`**

```ts
/**
 * As três camadas da narrativa, num lugar só.
 *
 * Esta tabela vivia duplicada — as janelas de progresso em PlanetScene, os
 * limiares de estágio em useScrollProgress — com um comentário pedindo para
 * mudar as duas juntas. As raízes seriam a terceira cópia do mesmo número.
 *
 * As cores espelham --color-os2, --color-fg e --color-om3 de globals.css;
 * `color` é o que o three consome, `cssColor` é o que o SVG consome, e as duas
 * saem da mesma linha justamente para não divergirem.
 */

export const CAMERA_FOV = 45;
export const CAMERA_Z = 5.2;

/** Raio comum das cascas em repouso: fechadas, leem como um planeta sólido. */
export const COLLAPSED_RADIUS = 0.67;

export interface Layer {
  /** Chave do locale: areas.<key>.title */
  key: "infra" | "web2" | "web3";
  /** Hex para o three. */
  color: number;
  /** Custom property para o SVG. */
  cssColor: string;
  count: number;
  /** Raio da casca aberta, em unidades de cena. */
  radius: number;
  /** Janela de progresso em que a casca abre e a raiz cresce. */
  from: number;
  to: number;
  /**
   * Ângulo do ramo em graus, medido do centro da tela, anti-horário a partir
   * da direita. Infra sai para cima-esquerda, Web2 para a direita, Web3 para
   * baixo-esquerda.
   */
  angle: number;
}

// O raio é a trajetória: a infra é o núcleo, a web2 o meio, a web3 a
// superfície. Uma sustenta a outra, de dentro para fora.
export const LAYERS: readonly Layer[] = [
  {
    key: "infra",
    color: 0xf4c542,
    cssColor: "var(--color-os2)",
    count: 260,
    radius: 0.72,
    from: 0.1,
    to: 0.35,
    angle: 150,
  },
  {
    key: "web2",
    color: 0xdde5ee,
    cssColor: "var(--color-fg)",
    count: 380,
    radius: 1.2,
    from: 0.32,
    to: 0.58,
    angle: 5,
  },
  {
    key: "web3",
    color: 0x22d3c5,
    cssColor: "var(--color-om3)",
    count: 520,
    radius: 1.6,
    from: 0.55,
    to: 0.82,
    angle: 215,
  },
];

/**
 * Raio aparente de uma esfera de raio `radius`, como fração da ALTURA da
 * viewport. Sai da própria câmera, então mexer em CAMERA_FOV ou CAMERA_Z leva
 * as raízes junto. asin e não atan porque a silhueta tangencia a esfera — a
 * diferença chega a 2% da altura da tela na casca externa, que é visível.
 */
export function screenRadiusFraction(radius: number): number {
  const halfView = Math.tan((CAMERA_FOV * Math.PI) / 360);
  return Math.tan(Math.asin(radius / CAMERA_Z)) / halfView / 2;
}

/**
 * Raio corrente da casca na tela, para `open` entre 0 e 1. Interpola em
 * unidades de cena antes de projetar, que é exatamente o que o `scale` do grupo
 * faz no PlanetScene — interpolar já em pixels daria outra curva.
 */
export function layerScreenRadius(layer: Layer, open: number): number {
  const sceneRadius = COLLAPSED_RADIUS + (layer.radius - COLLAPSED_RADIUS) * open;
  return screenRadiusFraction(sceneRadius);
}
```

- [ ] **Step 2: Conferir os números da projeção**

Rodar:

```bash
node -e '
const FOV = 45, Z = 5.2;
const f = r => Math.tan(Math.asin(r / Z)) / Math.tan((FOV * Math.PI) / 360) / 2;
for (const [name, r] of [["fechada", 0.67], ["infra", 0.72], ["web2", 1.2], ["web3", 1.6]])
  console.log(name, (f(r) * 100).toFixed(1) + "%");
'
```

Esperado, batendo com a tabela da spec:

```
fechada 15.7%
infra 16.9%
web2 28.6%
web3 39.0%
```

Se não bater, a fórmula foi transcrita errado — parar e corrigir antes de seguir.

- [ ] **Step 3: Ligar o `PlanetScene` na tabela**

Em `src/components/PlanetScene.tsx`, apagar o bloco `SHELLS` (linhas 11-22), as constantes `CAMERA_FOV`, `CAMERA_Z` e `COLLAPSED_RADIUS`, e importar da nova fonte. `TILT_X` e `SPIN_SPEED` ficam onde estão: são da cena, ninguém mais usa.

O import passa a ser:

```ts
import {
  CAMERA_FOV,
  CAMERA_Z,
  COLLAPSED_RADIUS,
  LAYERS,
} from "@/lib/shellStages";
```

E o `SHELLS.map(...)` vira `LAYERS.map(...)`. O corpo do map não muda: `config.count`, `config.radius`, `config.color`, `config.from`, `config.to` existem todos em `Layer` com os mesmos nomes e valores.

O cabeçalho do arquivo perde o docblock das cascas (que foi para `shellStages.ts`) e ganha, acima de `TILT_X`:

```ts
// Inclinação para o planeta não ser lido de frente exata.
const TILT_X = 0.35;
```

- [ ] **Step 4: Verificar tipos e build**

Rodar: `npx tsc --noEmit`
Esperado: sem saída, código 0.

Rodar: `npm run build`
Esperado: `⨯ ESLint: Invalid Options` (ruído conhecido) e depois `✓ Generating static pages (8/8)`. 8 páginas: 4 rotas × 2 locales.

- [ ] **Step 5: Verificar que a cena não mudou**

Rodar `npm run dev`, abrir `http://localhost:3000` em ≥ 1024px de largura e rolar o hero inteiro. O planeta deve abrir exatamente como antes — três cascas, núcleo amarelo quase parado, superfície aqua se afastando. Esta tarefa é refactor puro: qualquer diferença visual é bug.

- [ ] **Step 6: Commit**

```bash
git add src/lib/shellStages.ts src/components/PlanetScene.tsx
git commit -m "refactor: tabela única de camadas para cena e raízes

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Traçado ortogonal e o helper de revelação

Duas peças pequenas e puras que a Task 3 consome. `orthogonalRoot` devolve o `d` do path e o comprimento em fechado — nada de `getTotalLength()`, que forçaria um reflow por frame. `reveal` sai do `Hero.tsx` porque passa a ter dois consumidores.

**Files:**
- Create: `src/lib/rootPath.ts`
- Create: `src/lib/reveal.ts`
- Modify: `src/components/sections/Hero.tsx:14-19`

**Interfaces:**
- Produces: `Point`, `RootPath`, `orthogonalRoot(anchor: Point, entry: Point, far: Point): RootPath`, `reveal(visible: boolean): string`.

- [ ] **Step 1: Criar `src/lib/rootPath.ts`**

```ts
export interface Point {
  x: number;
  y: number;
}

export interface RootPath {
  /** Atributo `d` do <path>, em pixels do container. */
  d: string;
  /** Comprimento do traçado, para o dasharray. */
  length: number;
}

/** Uma casa decimal já é subpixel; mais que isso só engorda a string por frame. */
function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Traçado de patch panel entre a casca e o bloco de texto: três segmentos e
 * dois cotovelos de 90°, com o cotovelo vertical a meio caminho na horizontal —
 * fora da caixa do bloco, então a linha nunca cruza o texto.
 *
 * `entry` é a ponta do filete virada para o planeta e `far` a outra ponta: o
 * último segmento horizontal atravessa o bloco inteiro e É o filete acima dele.
 * Como o traço é revelado do começo para o fim, a raiz chega e depois varre a
 * régua — nessa ordem.
 *
 * O comprimento sai da soma dos segmentos porque todos são ortogonais.
 * getTotalLength() daria o mesmo número ao custo de um reflow por frame.
 */
export function orthogonalRoot(anchor: Point, entry: Point, far: Point): RootPath {
  const elbowX = anchor.x + (entry.x - anchor.x) / 2;

  const d =
    `M ${round(anchor.x)} ${round(anchor.y)}` +
    ` H ${round(elbowX)}` +
    ` V ${round(entry.y)}` +
    ` H ${round(far.x)}`;

  const length =
    Math.abs(elbowX - anchor.x) +
    Math.abs(entry.y - anchor.y) +
    Math.abs(far.x - elbowX);

  return { d, length };
}
```

- [ ] **Step 2: Criar `src/lib/reveal.ts`**

Mover o helper que hoje está em `Hero.tsx:14-19`, sem mudar o corpo:

```ts
/** Entrada e saída dos blocos coreografados. */
export function reveal(visible: boolean): string {
  return `transition-[opacity,transform] duration-700 ease-[var(--ease-out-quint)] ${
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
  }`;
}
```

- [ ] **Step 3: Apontar o `Hero.tsx` para o helper movido**

Apagar a função `reveal` de `Hero.tsx` (linhas 14-19) e adicionar aos imports:

```ts
import { reveal } from "@/lib/reveal";
```

Nada mais no `Hero.tsx` muda nesta tarefa — as chamadas a `reveal(...)` continuam idênticas.

- [ ] **Step 4: Conferir o traçado com números à mão**

Rodar:

```bash
node -e '
const round = v => Math.round(v * 10) / 10;
function orthogonalRoot(anchor, entry, far) {
  const elbowX = anchor.x + (entry.x - anchor.x) / 2;
  const d = `M ${round(anchor.x)} ${round(anchor.y)} H ${round(elbowX)} V ${round(entry.y)} H ${round(far.x)}`;
  const length = Math.abs(elbowX - anchor.x) + Math.abs(entry.y - anchor.y) + Math.abs(far.x - elbowX);
  return { d, length };
}
console.log(orthogonalRoot({x: 700, y: 500}, {x: 400, y: 200}, {x: 100, y: 200}));
console.log(orthogonalRoot({x: 900, y: 450}, {x: 1100, y: 440}, {x: 1400, y: 440}));
'
```

Esperado:

```
{ d: 'M 700 500 H 550 V 200 H 100', length: 750 }
{ d: 'M 900 450 H 1000 V 440 H 1400', length: 510 }
```

O primeiro é um bloco à esquerda (a linha vai para a esquerda e para cima), o segundo um bloco à direita quase na mesma altura da âncora — o segmento vertical vira um degrau de 10px, que é o caso da Web2. Se algum número divergir, a função está errada; corrigir antes de seguir.

- [ ] **Step 5: Verificar tipos e build**

Rodar: `npx tsc --noEmit`
Esperado: sem saída, código 0.

Rodar: `npm run build`
Esperado: build conclui, 8 páginas.

- [ ] **Step 6: Commit**

```bash
git add src/lib/rootPath.ts src/lib/reveal.ts src/components/sections/Hero.tsx
git commit -m "feat: traçado ortogonal das raízes e reveal compartilhado

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: O componente das raízes

O componente novo: um SVG sobreposto com três paths e três blocos de texto em absoluto. É dono do scrub — um `rAF` próprio lê o `progressRef` e escreve atributos direto, sem passar pelo React.

**Files:**
- Create: `src/components/CircuitRoots.tsx`

**Interfaces:**
- Consumes: `LAYERS`, `Layer`, `layerScreenRadius` de `@/lib/shellStages`; `orthogonalRoot` de `@/lib/rootPath`; `reveal` de `@/lib/reveal`; `smoothstep` de `@/lib/planetGeometry`; `AreaCard` de `@/components/AreaCard`.
- Produces: `default CircuitRoots`, com props `{ progressRef: MutableRefObject<number>; stage: number }`. Exporta também `stageForLayer(index: number): number`, que a Task 4 usa para nada — o `Hero` só precisa dos estágios do título e do CTA — mas que fica junto da tabela de posições por ser a regra de quando cada bloco entra.

- [ ] **Step 1: Criar `src/components/CircuitRoots.tsx`**

```tsx
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
 * A ordem é a mesma de LAYERS.
 */
const BOXES = [
  "left-[4%] top-[11%]",
  "right-[4%] top-1/2 -translate-y-1/2",
  "left-[4%] bottom-[11%]",
] as const;

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
        return (
          <div
            key={layer.key}
            ref={(element) => {
              blockRefs.current[index] = element;
            }}
            aria-hidden={!visible}
            className={`absolute flex w-[clamp(13rem,20vw,19rem)] flex-col gap-3 pt-4 ${BOXES[index]} ${reveal(visible)}`}
          >
            <AreaCard index={`0${index + 1}`} areaKey={layer.key} />
          </div>
        );
      })}
    </div>
  );
};

export default CircuitRoots;
```

- [ ] **Step 2: Verificar tipos e build**

Rodar: `npx tsc --noEmit`
Esperado: sem saída, código 0.

Rodar: `npm run build`
Esperado: build conclui, 8 páginas. O componente ainda não é usado por ninguém, então nada muda na tela — este passo só prova que compila.

- [ ] **Step 3: Commit**

```bash
git add src/components/CircuitRoots.tsx
git commit -m "feat: componente das raízes por camada

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Religar o hero

Troca o ramo coreografado: fora a grid de duas colunas e a `<ul>` de cards, dentro o layout radial. Os limiares de estágio migram para `shellStages.ts` e passam a marcar o *fim* de cada janela — o texto de uma camada entra quando a raiz dela chega, não quando ela parte.

**Files:**
- Modify: `src/lib/shellStages.ts`
- Modify: `src/hooks/useScrollProgress.ts:7-10`
- Modify: `src/components/sections/Hero.tsx`

**Interfaces:**
- Consumes: `CircuitRoots` e `stageForLayer` de `@/components/CircuitRoots`; `LAYERS` de `@/lib/shellStages`.
- Produces: `STAGE_THRESHOLDS`, `STAGE_TITLE_OUT`, `STAGE_CTA` em `@/lib/shellStages`.

- [ ] **Step 1: Mover os limiares para `shellStages.ts`**

Acrescentar ao fim de `src/lib/shellStages.ts`:

```ts
/**
 * Limiares dos estágios do HTML, derivados da tabela acima.
 *
 * Marcam o FIM de cada janela, não o começo: com raiz, o texto de uma camada
 * tem que chegar quando a linha encosta no bloco, não quando ela parte do
 * planeta. O primeiro limiar é a saída do título — que ocupa o mesmo canto do
 * bloco de Infraestrutura — e o último traz o CTA.
 *
 * Rende [0.1, 0.35, 0.58, 0.82, 0.9].
 */
export const STAGE_THRESHOLDS: readonly number[] = [
  LAYERS[0].from,
  ...LAYERS.map((layer) => layer.to),
  0.9,
];

/** A partir daqui o título sai e a primeira raiz já está crescendo. */
export const STAGE_TITLE_OUT = 1;

/** O último: as três raízes chegaram, o CTA entra. */
export const STAGE_CTA = STAGE_THRESHOLDS.length;
```

- [ ] **Step 2: Apontar o hook para os limiares novos**

Em `src/hooks/useScrollProgress.ts`, apagar as linhas 7-10 (o comentário e a constante `STAGE_THRESHOLDS`) e importar:

```ts
import { STAGE_THRESHOLDS } from "@/lib/shellStages";
```

O hook deixa de exportar `STAGE_THRESHOLDS`. `stageFromProgress` não muda — já itera o array, seja qual for o tamanho. `STATIC_BREAKPOINT` e `prefersStaticHero` ficam onde estão.

- [ ] **Step 3: Reescrever o ramo coreografado do `Hero.tsx`**

O arquivo inteiro passa a ser:

```tsx
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import CircuitRoots from "@/components/CircuitRoots";
import ExpertiseAreas from "@/components/ExpertiseAreas";
import { prefersStaticHero, useScrollProgress } from "@/hooks/useScrollProgress";
import { reveal } from "@/lib/reveal";
import { STAGE_CTA, STAGE_TITLE_OUT } from "@/lib/shellStages";
import { whatsappHref } from "@/lib/whatsapp";

// ssr:false mantém o three fora do JS da primeira pintura e do HTML estático.
const PlanetScene = dynamic(() => import("@/components/PlanetScene"), { ssr: false });

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

  // O filete à esquerda do eyebrow só faz sentido alinhado; centralizado, ele
  // vira um traço solto, então a coreografia centraliza a linha inteira.
  const eyebrow = (centered: boolean) => (
    <p
      className={`type-label mb-6 flex items-center gap-3 text-fg-muted ${
        centered ? "justify-center" : ""
      }`}
    >
      <span aria-hidden className="h-px w-8 shrink-0 bg-os2" />
      <span className="min-w-0 leading-relaxed">{t("hero_eyebrow")}</span>
    </p>
  );

  // Cria o CTA com tabIndex condicional para respeitar aria-hidden.
  // Quando oculto (aria-hidden=true), tabIndex={-1} tira o link do fluxo de
  // tabulação, evitando foco em elemento invisível e violação de WAI-ARIA APG
  // (axe-core). No ramo estático o link está sempre visível; na coreografia o
  // link é focável apenas no último estágio.
  const createCta = (isFocusable: boolean) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={isFocusable ? 0 : -1}
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
          {eyebrow(false)}
          <h1 className="type-display type-hero m-0 max-w-[18ch] text-fg">{t("title")}</h1>
          <p className="measure mt-7 text-fg-muted">{t("hero_sub")}</p>
          <div className="mt-10">{createCta(true)}</div>
          <ExpertiseAreas />
        </div>
      </section>
    );
  }

  const titleVisible = stage < STAGE_TITLE_OUT;
  const ctaVisible = stage >= STAGE_CTA;

  return (
    // 300vh é a distância de scroll que a narrativa consome; o filho sticky é
    // a tela que fica parada enquanto isso.
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <PlanetScene progressRef={progressRef} staticMode={false} />
        <CircuitRoots progressRef={progressRef} stage={stage} />

        {/* O título vive sobre o planeta fechado e sai quando a primeira raiz
            começa a crescer — o bloco de Infraestrutura ocupa este canto. */}
        <div
          aria-hidden={!titleVisible}
          className={`relative max-w-3xl px-8 text-center ${reveal(titleVisible)}`}
        >
          {eyebrow(true)}
          <h1 className="type-display type-hero m-0 text-fg">{t("title")}</h1>
          <p className="measure mx-auto mt-7 text-fg-muted">{t("hero_sub")}</p>
        </div>

        <div
          aria-hidden={!ctaVisible}
          className={`absolute bottom-16 left-1/2 -translate-x-1/2 ${reveal(ctaVisible)}`}
        >
          {createCta(ctaVisible)}
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

Some com isso: o import de `AreaCard`, a constante `AREA_KEYS`, a grid `grid-cols-2` e a `<ul>` de cards. `AreaCard` continua sendo importado por `ExpertiseAreas` e por `CircuitRoots`.

- [ ] **Step 4: Verificar tipos e build**

Rodar: `npx tsc --noEmit`
Esperado: sem saída, código 0. Em particular, nenhum "declared but never used" de `AreaCard` ou `AREA_KEYS`.

Rodar: `npm run build`
Esperado: build conclui, 8 páginas.

- [ ] **Step 5: Checagem visual em 1440px**

`npm run dev`, janela em ~1440×900, rolar o hero devagar de cima a baixo e de volta. Conferir:

1. No topo: título centralizado sobre o planeta fechado, scroll-cue embaixo, nenhuma raiz visível.
2. Rolando: o título sai e a raiz amarela começa a brotar da casca do núcleo, para cima-esquerda.
3. Cada raiz cresce em segmentos retos com cotovelos de 90°, sem diagonal.
4. O último segmento de cada raiz vira o filete acima do bloco de texto, e o `01`/`02`/`03` fica logo abaixo dele.
5. O texto de cada camada entra quando a raiz dela termina de varrer o filete, não antes.
6. A cor de cada raiz bate com a da casca: amarela (Infra), branca (Web2), aqua (Web3).
7. A ponta da raiz que fica no planeta acompanha a borda da casca enquanto ela abre — visível principalmente na Web3, que viaja bastante; a da Infra quase não sai do lugar.
8. Nenhuma linha cruza por cima de um bloco de texto.
9. No fim: as três raízes inteiras, os três textos, e o CTA do WhatsApp centralizado embaixo.
10. Rolando de volta para cima, tudo recolhe na ordem inversa, sem salto e sem sumir de uma vez.

- [ ] **Step 6: Checagem visual em 1024px e 768px**

Repetir a checagem acima em ~1024×800 e ~800×800.

Em 768–1023px os blocos ficam mais estreitos. Se o texto colidir com o planeta ou as linhas ficarem espremidas a ponto de não se ler o traçado, **não improvisar posições novas**: subir `STATIC_BREAKPOINT` de 768 para 1024 em `src/hooks/useScrollProgress.ts:6`, ajustar o comentário dele, e registrar a mudança na mensagem de commit. O ramo estático já é uma apresentação completa do mesmo conteúdo.

- [ ] **Step 7: Checagem do ramo estático e de movimento reduzido**

Estreitar abaixo de 768px (ou do novo `STATIC_BREAKPOINT`) e recarregar: o hero tem que voltar a ser eyebrow alinhado à esquerda, `<h1>`, sub, CTA e a faixa de três áreas — sem raiz, sem scroll pinado.

Depois, com a janela larga, ligar `prefers-reduced-motion` no sistema (macOS: Ajustes → Acessibilidade → Tela → Reduzir movimento), recarregar e confirmar o mesmo ramo estático.

- [ ] **Step 8: Checagem de idioma**

Com a janela larga e o hero coreografado, trocar para EN no `LanguageSwitcher` e rolar de novo. Os textos em inglês quebram em alturas diferentes; as raízes têm que continuar encostando exatamente na borda de cima de cada bloco. É o caso que o `ResizeObserver` cobre — se a linha ficar deslocada do filete, o observer não está observando os blocos.

- [ ] **Step 9: Commit**

```bash
git add src/lib/shellStages.ts src/hooks/useScrollProgress.ts src/components/sections/Hero.tsx
git commit -m "feat: hero radial com raízes ligando cascas e tópicos

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Atualizar a documentação

O `CLAUDE.md` descreve o hero coreografado como grid de duas colunas com uma `<ul>` de cards, e cita `STAGE_THRESHOLDS` em `useScrollProgress`. Nada disso continua verdade.

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md` (só se a lista de arquivos/stack lá tiver ficado errada)

- [ ] **Step 1: Corrigir o `CLAUDE.md`**

Passar por estes pontos, todos hoje desatualizados:

1. Na seção **Architecture**, o parágrafo do `Hero.tsx`: o ramo coreografado não é mais "reveals the headline, the WhatsApp CTA, and the three area cards stage by stage" numa grid de duas colunas. Descrever o radial: título centralizado no estágio 0, três blocos ao redor do planeta, cada um ligado à sua casca por uma raiz ortogonal que cresce presa ao scroll.
2. Acrescentar `src/lib/shellStages.ts` à lista de módulos, como a fonte única das camadas (cores, contagens, raios, janelas de progresso, ângulos e limiares de estágio), consumida por `PlanetScene`, `useScrollProgress` e `CircuitRoots`.
3. Acrescentar `src/components/CircuitRoots.tsx` à mesma lista.
4. Acrescentar `src/lib/rootPath.ts` e `src/lib/reveal.ts`.
5. Corrigir a descrição de `useScrollProgress.ts`: os limiares não moram mais lá, e o `stage` agora vai de 0 a 5.
6. Corrigir a descrição de `AreaCard.tsx`: os dois contêineres agora são o grid do `ExpertiseAreas` e os blocos absolutos do `CircuitRoots` — não mais uma `<ul>` no `Hero`.
7. Na seção **Design docs**, acrescentar `2026-07-30-hero-raizes-por-camada-design.md` como a spec do hero atual, e rebaixar `2026-07-30-hero-planeta-cascas-scroll-design.md` para a geração anterior — ele ainda é a melhor explicação da geometria das cascas e da integração com o `three`, mas a coreografia que ele descreve não é mais a que está no ar.
8. Se o `STATIC_BREAKPOINT` tiver subido para 1024 na Task 4, corrigir todas as menções a 768px.

- [ ] **Step 2: Conferir o `README.md`**

Ler `README.md`. Se ele descrever o hero ou listar arquivos que mudaram, atualizar. Se só tiver stack e a nota sobre as seções desativadas, deixar como está — nada disso mudou.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: hero radial com raízes por camada

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Auto-revisão

**Cobertura da spec:**

| Requisito da spec | Tarefa |
|---|---|
| `shellStages.ts` como fonte única | 1 (tabela + câmera), 4 (limiares) |
| `CircuitRoots.tsx` com rAF próprio | 3 |
| `Hero.tsx` radial, sem grid nem `<ul>` | 4 |
| Fórmula e números do raio da âncora | 1 (Steps 1-2) |
| Bloco parado, ponta do planeta em movimento | 3 (`measure` + `draw`) |
| Traçado ortogonal, filete como fim da raiz | 2 (`orthogonalRoot`), 3 (`joints`) |
| Comprimento em fechado, sem `getTotalLength()` | 2 |
| Limiares pelo fim das janelas | 4 (Step 1) |
| Tabela de coreografia (0.1 / 0.35 / 0.58 / 0.82 / 0.9) | 4 (Step 1), verificada em 4 (Step 5) |
| Responsividade e escape para 1024px | 4 (Step 6) |
| `aria-hidden` no SVG, nos blocos, `tabIndex` no CTA | 3, 4 |
| Ordem no DOM Infra → Web2 → Web3 | 3 (map sobre `LAYERS`) |
| Ramo estático intacto | 4 (Step 7) |
| Degradação sem WebGL | herdada: `PlanetScene` já retorna cedo, e `CircuitRoots` não depende dele |

**Consistência de tipos:** `Layer` (Task 1) é consumido por `PlanetScene` (Task 1), `CircuitRoots` (Task 3) e `STAGE_THRESHOLDS` (Task 4) — sempre pelos mesmos campos. `orthogonalRoot(anchor, entry, far)` é definido na Task 2 e chamado na Task 3 com três `Point`. `reveal(visible)` é definido na Task 2 e usado nas Tasks 3 e 4. `stageForLayer(index)` é definido e usado na Task 3.

**Sem placeholder:** todo passo de código traz o código; todo passo de verificação traz o comando e a saída esperada; os passos visuais trazem a lista do que olhar e o que fazer se falhar.
