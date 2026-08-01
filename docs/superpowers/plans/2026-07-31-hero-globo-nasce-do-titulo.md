# Globo nasce do título — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** No estágio 0 do hero coreografado, o planeta nasce do zero no mesmo lugar onde o título já fica — crescendo enquanto o título dissolve — em vez dos dois ficarem parados, sobrepostos, desde o primeiro frame.

**Architecture:** Um hook novo (`useHeroBirth`) segura o título por um tempo fixo e depois dissolve título e globo juntos, escrevendo um progresso 0→1 numa ref que o `PlanetScene` lê no próprio `rAF` (mesmo padrão que `progressRef` do scroll já usa) para multiplicar a escala das cascas. O gatilho não é o scroll: é o fim da cortina do `Intro`, repassado por `index.tsx` como prop — sem isso a animação rodaria escondida atrás da cortina na primeira visita. Rolar antes do fim do nascimento encerra a espera na hora.

**Tech Stack:** Next.js 14 (pages router), TypeScript strict, Tailwind CSS v4 (config CSS-first em `src/styles/globals.css`), `three` cru, `next-i18next`.

**Spec:** [`docs/superpowers/specs/2026-07-31-hero-globo-nasce-do-titulo-design.md`](../specs/2026-07-31-hero-globo-nasce-do-titulo-design.md)

## Global Constraints

- **Não existe test runner neste repositório.** Verificar uma mudança é `npx tsc --noEmit` passar, `npm run build` passar, e a checagem visual descrita em cada tarefa.
- **`npm run lint` está quebrado e sai com código 0 mesmo assim.** O `npm run build` imprime `⨯ ESLint: Invalid Options` e constrói mesmo assim. Só erro de compilação ou de tipo quebra o build de verdade. Ignorar a linha de ESLint.
- **Nenhuma dependência nova.**
- **Comentários em português, explicando o *porquê*, não o *quê*.** É o padrão do repositório inteiro.
- **Só tokens do `@theme`** — `ink`, `surface`, `raised`, `line`, `line-soft`, `fg`, `fg-muted`, `os2` (`#f4c542`), `om3` (`#22d3c5`). Nada de hex solto. Não existe `tailwind.config.js`.
- **Nenhuma chave de locale nova.** Esta mudança é só coreografia — nenhum texto novo aparece.
- **O ramo estático do hero não muda.** Mobile (abaixo do breakpoint estático), `prefers-reduced-motion` e o HTML do servidor continuam idênticos — eyebrow, `<h1>`, sub, CTA, `<ExpertiseAreas />` — sem o nascimento, sem o `useHeroBirth`.
- **O nascimento não depende do scroll.** Ele dispara quando a cortina do `Intro` some, e roda uma vez. Rolar antes dele terminar encerra a espera na hora — não deve parecer que o scroll está "preso" esperando uma animação de entrada.
- **O título, uma vez dissolvido, não volta** — nem se o usuário rolar de volta ao topo depois.
- **Alias de import:** `@/*` → `src/*`.

---

### Task 1: O relógio do nascimento (`useHeroBirth`)

Hook novo, isolado: não sabe nada de `three` nem de `Hero.tsx`. Segura o título por `HOLD_MS`, depois dissolve título e globo no mesmo relógio ao longo de `FADE_MS`. A curva de easing (`easeOutQuint`) é aplicada **dentro** do hook, então quem lê `birthProgressRef` (o `PlanetScene`, na Task 2) recebe o valor já suavizado — evita uma terceira cópia de `easeOutQuint` no repositório (as outras duas, em `useIntroProgress.ts` e aqui, já são uma duplicação deliberada porque pertencem a domínios diferentes; uma quarta em `PlanetScene.tsx` seria simples descuido).

**Files:**
- Create: `src/hooks/useHeroBirth.ts`

**Interfaces:**
- Produces: `birthProgressAt(elapsed: number): number`, `useHeroBirth(triggered: boolean, scrollStarted: boolean): { birthProgressRef: MutableRefObject<number>; titleVisible: boolean; done: boolean }`.

- [ ] **Step 1: Criar `src/hooks/useHeroBirth.ts`**

```ts
import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";

/** Título pleno por esse tanto depois do gatilho — dá tempo de ler antes de dissolver. */
const HOLD_MS = 400;

/** Globo cresce / título dissolve nessa janela, o mesmo relógio pros dois. */
const FADE_MS = 1200;

/** Desaceleração: a curva chega perto do fim e afrouxa, em vez de bater seco. */
function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

/**
 * Progresso do nascimento (0 a 1) `elapsed` ms depois do gatilho: parado
 * durante HOLD_MS, daí uma curva ease-out-quint até 1 ao fim de FADE_MS.
 * Extraída à parte por ser a única peça que dá pra testar sem DOM.
 */
export function birthProgressAt(elapsed: number): number {
  if (elapsed <= HOLD_MS) return 0;
  return easeOutQuint(Math.min((elapsed - HOLD_MS) / FADE_MS, 1));
}

interface HeroBirth {
  /** 0 a 1, já com easing aplicado. Atualizado por rAF, sem re-render — o
   * PlanetScene lê isso no próprio rAF, do mesmo jeito que já lê progressRef
   * do scroll. */
  birthProgressRef: MutableRefObject<number>;
  /** Pleno até HOLD_MS depois do gatilho, daí falso. Nunca volta a true. */
  titleVisible: boolean;
  /** O nascimento terminou (naturalmente ou porque o scroll o encerrou). */
  done: boolean;
}

/**
 * O relógio do nascimento do globo: segura o título por HOLD_MS, depois
 * dissolve título e globo juntos em FADE_MS. Não depende de scroll — só de
 * `triggered` virar true, que o Hero liga ao fim da cortina do Intro.
 *
 * `scrollStarted` é a válvula de escape: quem começa a rolar antes do
 * nascimento terminar não deve ficar esperando uma animação de entrada, então
 * o progresso pula pro fim na hora.
 */
export function useHeroBirth(triggered: boolean, scrollStarted: boolean): HeroBirth {
  const birthProgressRef = useRef(0);
  const [titleVisible, setTitleVisible] = useState(true);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  // O relógio contínuo: só escreve na ref, sem re-render.
  useEffect(() => {
    if (!triggered || doneRef.current) return;

    const start = performance.now();
    let frameId: number | null = null;

    const tick = () => {
      if (doneRef.current) return;

      const elapsed = performance.now() - start;
      birthProgressRef.current = birthProgressAt(elapsed);

      if (birthProgressRef.current < 1) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      doneRef.current = true;
      setDone(true);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [triggered]);

  // O flip discreto do título: um setTimeout só, igual ao "leaving" do
  // Intro.tsx — não precisa de rAF porque é um booleano, não um valor contínuo.
  useEffect(() => {
    if (!triggered) return;
    const timer = window.setTimeout(() => setTitleVisible(false), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [triggered]);

  // A válvula de escape do scroll.
  useEffect(() => {
    if (!scrollStarted || doneRef.current) return;
    doneRef.current = true;
    birthProgressRef.current = 1;
    setTitleVisible(false);
    setDone(true);
  }, [scrollStarted]);

  return { birthProgressRef, titleVisible, done };
}
```

- [ ] **Step 2: Conferir a curva com números à mão**

Rodar:

```bash
node -e '
function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }
const HOLD_MS = 400, FADE_MS = 1200;
function birthProgressAt(elapsed) {
  if (elapsed <= HOLD_MS) return 0;
  return easeOutQuint(Math.min((elapsed - HOLD_MS) / FADE_MS, 1));
}
for (const t of [0, 200, 400, 401, 1000, 1600, 1601, 5000])
  console.log(t, birthProgressAt(t).toFixed(3));
'
```

Esperado:

```
0 0.000
200 0.000
400 0.000
401 0.004
1000 0.969
1600 1.000
1601 1.000
5000 1.000
```

`0.969` aos 1000ms (a meio caminho da janela de fade) é o comportamento esperado da curva — ease-out-quint é fortemente adiantada, a mesma característica que a cortina do Intro já usa no fechamento. Se os números não baterem, a fórmula foi transcrita errado; corrigir antes de seguir.

- [ ] **Step 3: Verificar tipos e build**

Rodar: `npx tsc --noEmit`
Esperado: sem saída, código 0.

Rodar: `npm run build`
Esperado: `⨯ ESLint: Invalid Options` (ruído conhecido) e depois `✓ Generating static pages (8/8)`. O hook ainda não é usado por ninguém, então nada muda na tela — este passo só prova que compila.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useHeroBirth.ts
git commit -m "$(cat <<'EOF'
feat: relógio do nascimento do globo (useHeroBirth)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `PlanetScene` recebe o multiplicador de nascimento

Mudança cirúrgica: uma prop opcional e uma linha na fórmula de escala que já existe. Sem a prop (ramo estático), o comportamento não muda em nada.

**Files:**
- Modify: `src/components/PlanetScene.tsx`

**Interfaces:**
- Consumes: nada novo — `birthProgressRef` chega pronto (já com easing) da Task 1.
- Produces: `PlanetSceneProps` ganha `birthProgressRef?: MutableRefObject<number>`.

- [ ] **Step 1: Adicionar a prop à interface**

Em `src/components/PlanetScene.tsx:34-37`, trocar:

```ts
interface PlanetSceneProps {
  progressRef: MutableRefObject<number>;
  staticMode: boolean;
}
```

por:

```ts
interface PlanetSceneProps {
  progressRef: MutableRefObject<number>;
  staticMode: boolean;
  /** 0 a 1, já com easing. Ausente = sempre 1 — é o caso do ramo estático. */
  birthProgressRef?: MutableRefObject<number>;
}
```

- [ ] **Step 2: Desestruturar a prop nova**

Em `src/components/PlanetScene.tsx:39`, trocar:

```ts
const PlanetScene: React.FC<PlanetSceneProps> = ({ progressRef, staticMode }) => {
```

por:

```ts
const PlanetScene: React.FC<PlanetSceneProps> = ({ progressRef, staticMode, birthProgressRef }) => {
```

- [ ] **Step 3: Multiplicar a escala pelo nascimento**

Em `src/components/PlanetScene.tsx:121-130`, trocar:

```ts
    const applyProgress = (progress: number) => {
      for (const shell of shells) {
        const open = smoothstep(shell.from, shell.to, progress);
        const scale = shell.collapsedScale + (1 - shell.collapsedScale) * open;

        shell.group.scale.setScalar(scale);
        shell.pointsMaterial.opacity = 0.5 + 0.5 * open;
        shell.lineMaterial.opacity = 0.18 + 0.32 * open;
      }
    };
```

por:

```ts
    const applyProgress = (progress: number) => {
      // Antes do nascimento terminar, birth multiplica a escala por algo
      // entre 0 e 1 — o planeta cresce do nada no mesmo lugar onde já ia
      // ficar parado. Sem a prop (ramo estático), o multiplicador é sempre 1.
      const birth = birthProgressRef ? birthProgressRef.current : 1;

      for (const shell of shells) {
        const open = smoothstep(shell.from, shell.to, progress);
        const scale = (shell.collapsedScale + (1 - shell.collapsedScale) * open) * birth;

        shell.group.scale.setScalar(scale);
        shell.pointsMaterial.opacity = 0.5 + 0.5 * open;
        shell.lineMaterial.opacity = 0.18 + 0.32 * open;
      }
    };
```

- [ ] **Step 4: Incluir a ref nas dependências do efeito**

Em `src/components/PlanetScene.tsx:222`, trocar:

```ts
  }, [progressRef, staticMode]);
```

por:

```ts
  }, [progressRef, staticMode, birthProgressRef]);
```

(`birthProgressRef` é uma ref, identidade estável entre renders — o mesmo motivo pelo qual `progressRef` já está nessa lista mesmo sendo estável.)

- [ ] **Step 5: Verificar tipos e build**

Rodar: `npx tsc --noEmit`
Esperado: sem saída, código 0.

Rodar: `npm run build`
Esperado: build conclui, 8 páginas.

- [ ] **Step 6: Checagem visual — nada mudou**

`npm run dev`, abrir em ≥ 1024px, rolar o hero inteiro. Como nenhum dos dois pontos de uso de `<PlanetScene>` em `Hero.tsx` passa `birthProgressRef` ainda, `birth` é sempre `1` e a cena deve se comportar exatamente como antes desta tarefa. Qualquer diferença visual aqui é bug.

- [ ] **Step 7: Commit**

```bash
git add src/components/PlanetScene.tsx
git commit -m "$(cat <<'EOF'
feat: PlanetScene aceita multiplicador de nascimento

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Ligar tudo — Intro avisa, Hero nasce

A tarefa grande e visível. `Intro.tsx` ganha um callback opcional chamado nos dois pontos onde já marca `gone`. `index.tsx` guarda esse sinal e repassa pro `Hero`. `Hero.tsx` consome `useHeroBirth`, passa a ref pro `PlanetScene`, esconde o título pelos dois motivos possíveis (nascimento terminou ou o scroll começou) e só mostra o `ScrollCue` depois do nascimento.

**Files:**
- Modify: `src/components/Intro.tsx`
- Modify: `src/pages/index.tsx`
- Modify: `src/components/sections/Hero.tsx`

**Interfaces:**
- Consumes: `useHeroBirth` de `@/hooks/useHeroBirth` (Task 1); `birthProgressRef` de `PlanetScene` (Task 2).
- Produces: `IntroProps.onGone?: () => void`; `Hero` passa a exigir a prop `introGone: boolean`.

- [ ] **Step 1: `Intro.tsx` ganha `onGone`**

Em `src/components/Intro.tsx:97`, trocar:

```tsx
const Intro: React.FC = () => {
```

por:

```tsx
interface IntroProps {
  /** Chamado nos dois pontos em que a cortina marca `gone` — é o sinal que o
   * Hero usa pra saber quando é seguro começar o nascimento do globo. Sem
   * isso a animação rodaria escondida atrás da cortina na primeira visita. */
  onGone?: () => void;
}

const Intro: React.FC<IntroProps> = ({ onGone }) => {
```

No efeito de skip, em `src/components/Intro.tsx:111-123`, trocar:

```tsx
  useEffect(() => {
    const skip =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      readSeen();

    if (skip) {
      setEnabled(false);
      setGone(true);
      return;
    }

    setEnabled(true);
  }, []);
```

por:

```tsx
  useEffect(() => {
    const skip =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      readSeen();

    if (skip) {
      setEnabled(false);
      setGone(true);
      onGone?.();
      return;
    }

    setEnabled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

No efeito de saída, em `src/components/Intro.tsx:140-159`, trocar:

```tsx
  useEffect(() => {
    if (!done) return;

    const flash = window.setTimeout(() => setLeaving(true), FLASH_MS);
    const unmount = window.setTimeout(() => {
      setGone(true);
      window.scrollTo(0, 0);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Storage bloqueado (modo privado, cookies off): a intro simplesmente
        // volta na próxima navegação. Não é motivo para quebrar a página.
      }
    }, FLASH_MS + FADE_MS);

    return () => {
      window.clearTimeout(flash);
      window.clearTimeout(unmount);
    };
  }, [done]);
```

por:

```tsx
  useEffect(() => {
    if (!done) return;

    const flash = window.setTimeout(() => setLeaving(true), FLASH_MS);
    const unmount = window.setTimeout(() => {
      setGone(true);
      onGone?.();
      window.scrollTo(0, 0);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Storage bloqueado (modo privado, cookies off): a intro simplesmente
        // volta na próxima navegação. Não é motivo para quebrar a página.
      }
    }, FLASH_MS + FADE_MS);

    return () => {
      window.clearTimeout(flash);
      window.clearTimeout(unmount);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
```

Os dois `eslint-disable` documentam que `onGone` fica de fora de propósito: cada efeito roda uma vez por transição real (`[]` no mount, `[done]` na virada de `done`), e `onGone` é chamado imperativamente lá dentro — incluí-lo nas deps faria o efeito re-rodar a cada render do `Home` sem motivo. `npm run lint` está quebrado (ver Global Constraints), então isso é documentação, não silenciamento de um erro real de build.

- [ ] **Step 2: `index.tsx` guarda o sinal e repassa**

Substituir `src/pages/index.tsx` inteiro por:

```tsx
import Head from "next/head";
import { Analytics } from "@vercel/analytics/next";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { useState } from "react";

import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Intro from "@/components/Intro";
import { getI18nStaticProps } from "@/lib/getI18nStaticProps";

// A home é só o hero. ServicesSection, AboutSection, ContactSection e
// SkillsSection continuam em src/components/sections, sem serem renderizadas;
// o Footer segue em src/components/Footer.tsx, também sem ser renderizado aqui;
// o blog está em src/pages-disabled, fora do roteamento do Next. Ao religar
// qualquer um deles, devolver também o item de menu correspondente no Header.

export default function Home() {
  const { t } = useTranslation("common");

  // Sinal de "cortina sumiu": o Hero usa isso pra saber quando é seguro
  // começar o nascimento do globo — sem ele a animação rodaria escondida
  // atrás do Intro na primeira visita.
  const [introGone, setIntroGone] = useState(false);

  return (
    <>
      <Head>
        <title>Alef Devops</title>
        <meta name="description" content={t("meta_description")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070b10" />
        <link rel="icon" href="/code-square.svg" />
      </Head>

      {/* Antes do Header de propósito: a cortina é fixed e cobre tudo, mas
          renderizar cedo deixa claro que ela é a primeira coisa da página. */}
      <Intro onGone={() => setIntroGone(true)} />

      <Header />

      <main id="main">
        <Hero introGone={introGone} />
      </main>

      <Analytics />
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) =>
  getI18nStaticProps(locale as string);
```

- [ ] **Step 3: `Hero.tsx` nasce**

Substituir `src/components/sections/Hero.tsx` inteiro por:

```tsx
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import CircuitRoots from "@/components/CircuitRoots";
import ExpertiseAreas from "@/components/ExpertiseAreas";
import ScrollCue from "@/components/ScrollCue";
import { useHeroBirth } from "@/hooks/useHeroBirth";
import { prefersStaticHero, useScrollProgress } from "@/hooks/useScrollProgress";
import { reveal } from "@/lib/reveal";
import { STAGE_CTA, STAGE_TITLE_OUT } from "@/lib/shellStages";
import { whatsappHref } from "@/lib/whatsapp";

// ssr:false mantém o three fora do JS da primeira pintura e do HTML estático.
const PlanetScene = dynamic(() => import("@/components/PlanetScene"), { ssr: false });

interface HeroProps {
  /** Sinal do index.tsx: a cortina do Intro já saiu. Dispara o nascimento do
   * globo — ver useHeroBirth. */
  introGone: boolean;
}

const Hero: React.FC<HeroProps> = ({ introGone }) => {
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

  // Chamado incondicionalmente (regra dos hooks) mesmo no ramo estático, que
  // simplesmente nunca lê o resultado. scrollStarted é a válvula de escape:
  // rolar antes do nascimento terminar não deve parecer que o scroll está
  // preso esperando uma animação de entrada.
  const birth = useHeroBirth(introGone, stage >= STAGE_TITLE_OUT);

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
  // Mesmos textos, mesmas chaves — o que muda é só a apresentação. Sem
  // nascimento: o planeta já entra pronto, igual a hoje.
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

  // Título some por dois motivos possíveis — o nascimento terminou, ou o
  // scroll começou — e não volta por nenhum dos dois: useHeroBirth nunca
  // reseta titleVisible para true, e stage voltar a 0 não muda isso.
  const titleVisible = birth.titleVisible && stage < STAGE_TITLE_OUT;
  const ctaVisible = stage >= STAGE_CTA;
  const scrollCueVisible = stage === 0 && birth.done;

  return (
    // 300vh é a distância de scroll que a narrativa consome; o filho sticky é
    // a tela que fica parada enquanto isso.
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <PlanetScene
          progressRef={progressRef}
          staticMode={false}
          birthProgressRef={birth.birthProgressRef}
        />
        <CircuitRoots progressRef={progressRef} stage={stage} />

        {/* O título vive sobre o planeta fechado e dissolve nele assim que o
            nascimento termina — o bloco de Infraestrutura ocupa este canto
            depois que o título já se foi. */}
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

        {/* bottom-28 e não bottom-8: no topo da página o filho sticky ainda não
            está pinado, então seus 100vh começam abaixo do header e transbordam
            a dobra na altura dele (~67px). O indicador só aparece nesse trecho,
            justamente onde a folga é necessária. Some até o nascimento
            terminar, pra nada competir com a transição título→globo. */}
        <div
          aria-hidden
          className={`absolute bottom-28 left-1/2 -translate-x-1/2 ${reveal(scrollCueVisible)}`}
        >
          <ScrollCue />
        </div>
      </div>
    </section>
  );
};

export default Hero;
```

- [ ] **Step 4: Verificar tipos e build**

Rodar: `npx tsc --noEmit`
Esperado: sem saída, código 0. Em particular, `<Hero introGone={introGone} />` em `index.tsx` bate com `HeroProps`.

Rodar: `npm run build`
Esperado: build conclui, 8 páginas.

- [ ] **Step 5: Checagem visual — primeira visita**

`npm run dev`, abrir `http://localhost:3000` numa **aba anônima** (sessionStorage limpo, garante que a cortina apareça), janela ≥ 1024px. Observar:

1. Cortina do Intro roda normalmente (servidor → cabo → desktop) e some.
2. No instante em que ela some: título pleno (eyebrow + `<h1>` + sub), globo ainda não visível ou muito pequeno.
3. Por ~400ms nada muda — o título segura.
4. Nos ~1200ms seguintes: o título dissolve enquanto o globo cresce, no mesmo lugar, até o tamanho de repouso de sempre (as três cascas fechadas, lendo como uma esfera sólida).
5. Só depois disso o `ScrollCue` aparece embaixo.
6. Rolar a partir daí: comportamento idêntico ao que já existia (raízes abrindo, textos entrando, CTA no fim).

- [ ] **Step 6: Checagem visual — recarregar na mesma aba**

Recarregar a página (não anônima — sessionStorage já tem `intro-seen`). A cortina não aparece (ou aparece e some quase instantaneamente, conforme `readSeen()`), e o nascimento do globo ainda roda, só que começa muito mais cedo.

- [ ] **Step 7: Checagem visual — rolar durante o nascimento**

Recarregar em aba anônima de novo. Assim que a cortina sumir, rolar a página imediatamente (dentro da janela de ~1.6s do nascimento). Esperado: o título some na hora (sem esperar os 400ms de segurar), o globo salta para a escala plena sem um salto visual feio, e a partir daí o scroll comanda a cena normalmente — nada trava nem "pula" de forma perceptível na abertura da primeira raiz.

- [ ] **Step 8: Checagem do ramo estático e de movimento reduzido**

Estreitar abaixo do breakpoint estático (ver `STATIC_BREAKPOINT` em `useScrollProgress.ts`) e recarregar: hero volta a ser eyebrow + `<h1>` + sub + CTA + `<ExpertiseAreas />`, planeta já pronto, sem nenhuma animação de nascimento.

Com a janela larga, ligar `prefers-reduced-motion` no sistema (macOS: Ajustes → Acessibilidade → Tela → Reduzir movimento), recarregar e confirmar o mesmo ramo estático.

- [ ] **Step 9: Checagem de idioma**

Com a janela larga, deixar o nascimento terminar, depois trocar para EN no `LanguageSwitcher` e recarregar (o `LanguageSwitcher` navega, então a cortina e o nascimento rodam de novo). O crossfade título/globo deve se comportar igual com o texto em inglês — a simplificação de nascer no centro compartilhado, sem medir a última linha do texto, existe exatamente para isto não importar.

- [ ] **Step 10: Commit**

```bash
git add src/components/Intro.tsx src/pages/index.tsx src/components/sections/Hero.tsx
git commit -m "$(cat <<'EOF'
feat: globo nasce do título no hero coreografado

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Atualizar a documentação

O `CLAUDE.md` descreve o título como "aparece no estágio 0, sai ao rolar" e não menciona nascimento nenhum. Também não lista `useHeroBirth.ts` nem a prop `onGone` do `Intro`.

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Corrigir a seção Architecture**

No parágrafo de `Hero.tsx` (a descrição do ramo coreografado, `300vh`/sticky/radial), acrescentar a frase de que o título não sai só ao rolar: ele nasce em cima do planeta fechado e o planeta cresce do zero no mesmo lugar enquanto o título dissolve, ~1.6s depois que a cortina do `Intro` sai — gatilho que não depende de scroll. Rolar antes disso encerra a espera na hora. Uma vez dissolvido, o título não volta.

Acrescentar à lista de módulos, no mesmo estilo dos itens existentes:

```
- `src/hooks/useHeroBirth.ts` — o relógio do nascimento: segura o título por
  400ms depois que o Intro sai, depois dissolve título e globo juntos em
  1.2s. Escreve um progresso 0-1 (já suavizado) numa ref que `PlanetScene` lê
  no próprio rAF, sem re-render — mesmo padrão do `progressRef` do scroll.
```

No parágrafo do `Intro.tsx` ("A intro de carregamento é renderizada no servidor de propósito..."), acrescentar que `Intro` aceita uma prop `onGone`, chamada nos dois pontos em que a cortina marca `gone` (skip e fim do fade) — é o sinal que `index.tsx` repassa para `Hero` como `introGone`, e que dispara `useHeroBirth`.

- [ ] **Step 2: Conferir o `README.md`**

Ler `README.md`. Se ele descrever o comportamento do título no hero ou listar arquivos que mudaram, atualizar. Se só tiver stack e a nota sobre as seções desativadas, deixar como está.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "$(cat <<'EOF'
docs: globo nasce do título

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Auto-revisão

**Cobertura da spec:**

| Requisito da spec | Tarefa |
|---|---|
| Gatilho automático, sincronizado com o fim do Intro | 3 (Steps 1-2) |
| Nascer no centro compartilhado, sem reposicionar o grupo 3D | 2 |
| Título dissolve e não volta | 1 (`titleVisible` nunca reseta), 3 (`titleVisible = birth.titleVisible && stage < STAGE_TITLE_OUT`) |
| ScrollCue só depois do nascimento | 3 (`scrollCueVisible = stage === 0 && birth.done`) |
| Scroll durante o nascimento encerra a espera na hora | 1 (`scrollStarted` na assinatura do hook), 3 (`stage >= STAGE_TITLE_OUT` passado como `scrollStarted`) |
| `HOLD_MS` / `FADE_MS` (400 / 1200) | 1 |
| Sem WebGL, título ainda dissolve no relógio do hook | herdado: `useHeroBirth` não depende de `PlanetScene`; `PlanetScene` já retorna cedo sem WebGL (comportamento existente) |
| Ramo estático intacto | 1 (hook chamado mas ignorado), 2 (prop ausente = `birth` sempre 1), 3 (Step 8) |
| `prefers-reduced-motion` cai no ramo estático | 3 (Step 8) |

**Consistência de tipos:** `birthProgressAt(elapsed: number): number` é definida na Task 1 e usada apenas dentro do próprio hook. `useHeroBirth(triggered, scrollStarted)` é definida na Task 1 e chamada em `Hero.tsx` na Task 3 com `(introGone, stage >= STAGE_TITLE_OUT)`. `HeroBirth.birthProgressRef` é produzido na Task 1, consumido por `PlanetSceneProps.birthProgressRef` (Task 2) e passado em `Hero.tsx` (Task 3) — mesmo nome, mesmo tipo `MutableRefObject<number>` nos três lugares. `IntroProps.onGone` é definido na Task 3 e passado de `index.tsx` para `Intro`; `HeroProps.introGone` é definido na Task 3 e passado de `index.tsx` para `Hero` — não são a mesma prop, e o plano não os confunde em nenhum passo.

**Sem placeholder:** todo passo de código traz o código completo (arquivos pequenos como `index.tsx` e `useHeroBirth.ts` por inteiro; `PlanetScene.tsx` e `Hero.tsx` por trecho ou por inteiro, sempre com o antes-e-depois); todo passo de verificação traz o comando e a saída esperada; os passos visuais trazem a lista do que olhar.
