# Página Trabalhos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `src/pages/trabalhos.tsx` from a placeholder ("Em construção.") into a real
projects showcase with three grouped categories — Sites, Apps, Sistemas — using the four
screenshots already staged in `public/trabalhos/`.

**Architecture:** One new data-driven component (`ProjectCard`, following the existing
`AreaCard` pattern) rendered inside three category subsections on the page. All copy comes
from `next-i18next` locale keys, mirroring how `ExpertiseAreas`/`AreaCard` already work.

**Tech Stack:** Next.js 14 (pages router), TypeScript, Tailwind CSS v4, `next-i18next`,
`next/image`.

## Global Constraints

- No test runner exists in this project (see `CLAUDE.md`). Verification is `npm run build`
  succeeding, plus a manual check with `npm run dev` at desktop and ~375px widths, and a
  `LanguageSwitcher` toggle to confirm both locales. Steps below substitute this for the
  usual automated test cycle.
- New UI strings need matching keys in **both** `public/locales/pt/common.json` and
  `public/locales/en/common.json` — the two files must stay key-for-key in sync.
- Tailwind v4 only, via the existing `@theme` tokens: `ink`, `surface`, `raised`, `line`,
  `fg`, `fg-muted`, `os2`, `om3`. No raw hex, no Bootstrap.
- Path alias `@/*` → `src/*`.
- Follow the data-driven pattern already established by `ExpertiseAreas.tsx` +
  `AreaCard.tsx`: a local array of `{ key, ... }`, all copy looked up via
  `t(\`namespace.${key}.field\`)`.
- Images use `next/image` with `fill` inside a `relative` + aspect-ratio container —
  the pattern already used in `src/pages/sobre.tsx` for the profile photo, not `width`/
  `height` props.

---

### Task 1: Locale keys for the Trabalhos page

**Files:**
- Modify: `public/locales/pt/common.json:19-21`
- Modify: `public/locales/en/common.json:19-21`

**Interfaces:**
- Produces: locale keys `trabalhos_header` (changed value), `trabalhos_sites_label`,
  `trabalhos_apps_label`, `trabalhos_sistemas_label`, and
  `trabalhos_projects.{mm,gsn,rt2,rpa}.{title,desc,stack}` — consumed by Task 2
  (`ProjectCard`) and Task 3 (`trabalhos.tsx`).

- [ ] **Step 1: Edit `public/locales/pt/common.json`**

Replace:

```json
  "trabalhos_header": "Em construção.",
  "modal_close": "Fechar",
  "modal_see_more": "Ver mais",
```

With:

```json
  "trabalhos_header": "Sites, apps e sistemas em produção.",
  "trabalhos_sites_label": "Sites",
  "trabalhos_apps_label": "Apps",
  "trabalhos_sistemas_label": "Sistemas",
  "modal_close": "Fechar",
  "modal_see_more": "Ver mais",

  "trabalhos_projects": {
    "mm": {
      "title": "Motora Match",
      "desc": "Plataforma que conecta motoristas profissionais e transportadoras de forma inteligente, segura e eficiente. Encontre fretes, construa seu perfil profissional e faça parte de uma comunidade exclusiva.",
      "stack": "Vite · Tailwind · TypeScript"
    },
    "gsn": {
      "title": "Galeria Sandra Novas",
      "desc": "Site da galeria de artes Sandra Novas.",
      "stack": "React · Vite · Tailwind · TypeScript"
    },
    "rt2": {
      "title": "RepenseTrack",
      "desc": "Conecta motoristas, transportadoras e centros de operação em um aplicativo completo para gestão da jornada, comunicação em tempo real e controle das entregas.",
      "stack": "Flutter · NestJS · MongoDB · Redis"
    },
    "rpa": {
      "title": "RPA Fácil Contábil",
      "desc": "Sistema para envio de documentos automáticos via WhatsApp.",
      "stack": "NestJS · MongoDB · Vite · TypeScript · Tailwind · Docker"
    }
  },
```

- [ ] **Step 2: Edit `public/locales/en/common.json`**

Replace:

```json
  "trabalhos_header": "Under construction.",
  "modal_close": "Close",
  "modal_see_more": "See more",
```

With:

```json
  "trabalhos_header": "Websites, apps and systems in production.",
  "trabalhos_sites_label": "Websites",
  "trabalhos_apps_label": "Apps",
  "trabalhos_sistemas_label": "Systems",
  "modal_close": "Close",
  "modal_see_more": "See more",

  "trabalhos_projects": {
    "mm": {
      "title": "Motora Match",
      "desc": "A platform that connects professional drivers and freight carriers intelligently, safely and efficiently. Find loads, build your professional profile and join an exclusive community.",
      "stack": "Vite · Tailwind · TypeScript"
    },
    "gsn": {
      "title": "Sandra Novas Gallery",
      "desc": "Website for the Sandra Novas art gallery.",
      "stack": "React · Vite · Tailwind · TypeScript"
    },
    "rt2": {
      "title": "RepenseTrack",
      "desc": "Connects drivers, carriers and operations centers in one complete app for trip management, real-time communication and delivery tracking.",
      "stack": "Flutter · NestJS · MongoDB · Redis"
    },
    "rpa": {
      "title": "RPA Fácil Contábil",
      "desc": "System for automated document delivery via WhatsApp.",
      "stack": "NestJS · MongoDB · Vite · TypeScript · Tailwind · Docker"
    }
  },
```

- [ ] **Step 3: Verify both files are valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/locales/pt/common.json')); JSON.parse(require('fs').readFileSync('public/locales/en/common.json')); console.log('ok')"`
Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add public/locales/pt/common.json public/locales/en/common.json
git commit -m "$(cat <<'EOF'
Add locale copy for the Trabalhos projects page

Real title, per-category labels, and per-project title/desc/stack for the four projects staged in public/trabalhos/, replacing the "Em construção." placeholder.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `ProjectCard` component

**Files:**
- Create: `src/components/ProjectCard.tsx`

**Interfaces:**
- Consumes: locale keys `trabalhos_projects.${projectKey}.{title,desc,stack}` from Task 1.
- Produces:
  ```ts
  interface ProjectCardProps {
    projectKey: string; // "mm" | "gsn" | "rt2" | "rpa"
    image: string;
    orientation?: "landscape" | "portrait"; // default "landscape"
  }
  const ProjectCard: React.FC<ProjectCardProps>;
  ```
  Consumed by Task 3.

- [ ] **Step 1: Create `src/components/ProjectCard.tsx`**

```tsx
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
            ? "relative aspect-9/19 bg-ink"
            : "relative aspect-video"
        }
      >
        <Image
          src={image}
          alt={title}
          fill
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `ProjectCard.tsx` (Task 3 doesn't exist yet, so nothing
imports it — this only confirms the file itself type-checks in isolation as part of the
project-wide compile).

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectCard.tsx
git commit -m "$(cat <<'EOF'
Add ProjectCard component

Data-driven card (image + title + desc + stack) for the Trabalhos page, following the same t(`namespace.${key}.field`) pattern as AreaCard. Supports a "portrait" orientation so the RepenseTrack phone screenshot displays uncropped instead of being forced into a 16:9 frame.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Wire up the Trabalhos page

**Files:**
- Modify: `src/pages/trabalhos.tsx` (full rewrite of the component body)

**Interfaces:**
- Consumes: `ProjectCard` from Task 2 (`projectKey`, `image`, `orientation` props); locale
  keys `trabalhos_sites_label` / `trabalhos_apps_label` / `trabalhos_sistemas_label` from
  Task 1.

- [ ] **Step 1: Replace `src/pages/trabalhos.tsx`**

```tsx
import Head from "next/head";
import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "@/components/ProjectCard";
import { getI18nStaticProps } from "@/lib/getI18nStaticProps";

const projects = [
  { key: "mm", category: "sites", image: "/trabalhos/mm.png", orientation: "landscape" },
  { key: "gsn", category: "sites", image: "/trabalhos/gsn.png", orientation: "landscape" },
  { key: "rt2", category: "apps", image: "/trabalhos/rt2.png", orientation: "portrait" },
  { key: "rpa", category: "sistemas", image: "/trabalhos/rpa.png", orientation: "landscape" },
] as const;

const categories = [
  { id: "sites", labelKey: "trabalhos_sites_label" },
  { id: "apps", labelKey: "trabalhos_apps_label" },
  { id: "sistemas", labelKey: "trabalhos_sistemas_label" },
] as const;

/**
 * Fallback fora da home: na home o nav abre isso em modal (ver NavRootModal),
 * mas o link em si sempre aponta pra cá, então funciona sem JS e a partir de
 * qualquer outra página.
 */
const Trabalhos = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`${t("nav_trabalhos")} · Alef Devops`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070b10" />
        <link rel="icon" href="/code-square.svg" />
      </Head>

      <Header />

      <main id="main" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <SectionHeader label={t("nav_trabalhos")} title={t("trabalhos_header")} />

        <div className="flex flex-col gap-16 lg:gap-20">
          {categories.map((category) => (
            <section key={category.id}>
              <div className="flex items-center gap-4">
                <span className="type-label text-os2">{t(category.labelKey)}</span>
                <span aria-hidden className="h-px flex-1 bg-line" />
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {projects
                  .filter((project) => project.category === category.id)
                  .map((project) => (
                    <ProjectCard
                      key={project.key}
                      projectKey={project.key}
                      image={project.image}
                      orientation={project.orientation}
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Trabalhos;

export const getStaticProps: GetStaticProps = async ({ locale }) =>
  getI18nStaticProps(locale as string);
```

- [ ] **Step 2: Track the screenshot assets**

The four images referenced above are already on disk but untracked by git.

```bash
git add public/trabalhos/mm.png public/trabalhos/gsn.png public/trabalhos/rt2.png public/trabalhos/rpa.png
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds (ignore the pre-existing `⨯ ESLint: Invalid Options` noise — see
`CLAUDE.md`, that's a known-broken lint config, not a build failure). A real failure looks
like a TypeScript or compilation error, not the ESLint line.

- [ ] **Step 4: Manual check**

Run: `npm run dev`, open `/trabalhos`.

- Desktop width: confirm three sections (Sites with 2 cards side by side, Apps with 1
  card, Sistemas with 1 card), each screenshot legible and not distorted.
- ~375px width: confirm the grid collapses to one column and the page reads top to bottom.
- Confirm the RepenseTrack (`rt2.png`) card shows the whole phone screenshot uncropped
  (letterboxed inside its frame), while the other three fill their frame via crop.
- Toggle `LanguageSwitcher` and confirm the header title, the three category labels, and
  all four project titles/descriptions/stacks switch between pt and en.

- [ ] **Step 5: Commit**

```bash
git add src/pages/trabalhos.tsx public/trabalhos/mm.png public/trabalhos/gsn.png public/trabalhos/rt2.png public/trabalhos/rpa.png
git commit -m "$(cat <<'EOF'
Build out the Trabalhos page with real projects

Replaces the "Em construção." placeholder with three category sections (Sites, Apps, Sistemas) rendering ProjectCard for each of the four screenshots staged in public/trabalhos/.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
