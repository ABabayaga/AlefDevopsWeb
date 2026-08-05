# Modal de Nav com Conteúdo Inline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the full content of `/trabalhos` and `/sobre` into `NavRootModal` itself,
delete the two now-redundant standalone pages, and update `Header.tsx`'s nav items to
trigger the modal via `<button>` instead of navigating.

**Architecture:** Two new presentational components (`TrabalhosContent`, `SobreContent`)
extracted verbatim from the current page bodies, rendered conditionally inside
`NavRootModal` in place of the old "ver mais" link. `Header.tsx`'s `NavItem`/`NavEntry`
drop their dependency on `href` for internal items, since there's no longer a page to link
to.

**Tech Stack:** Next.js 14 (pages router), TypeScript, Tailwind CSS v4, `next-i18next`,
`next/image`.

## Global Constraints

- No test runner exists in this project (see `CLAUDE.md`). Verification is `npm run build`
  succeeding, plus a manual check with `npm run dev` at desktop and ~375px widths, and a
  `LanguageSwitcher` toggle.
- New/changed UI strings need matching keys in **both** `public/locales/pt/common.json`
  and `public/locales/en/common.json` — this plan only *removes* a key, but it must be
  removed from both.
- Tailwind v4 only, via the existing `@theme` tokens: `ink`, `surface`, `raised`, `line`,
  `fg`, `fg-muted`, `os2`, `om3`. No raw hex, no Bootstrap.
- Path alias `@/*` → `src/*`.
- Images use `next/image` with `fill` inside a `relative` + aspect-ratio container.
- **Accepted regression, do not "fix" it:** internal nav items (`trabalhos`, `sobre`)
  become `<button>` elements with no URL behind them. No-JS visitors, middle-click/open-in-
  new-tab, and direct links to `/trabalhos` or `/sobre` stop working. This is intentional
  per the approved design spec — do not add a fallback route or `href`.

---

### Task 1: Extract modal content components

**Files:**
- Create: `src/components/TrabalhosContent.tsx`
- Create: `src/components/SobreContent.tsx`

**Interfaces:**
- Consumes: `ProjectCard` (`src/components/ProjectCard.tsx`, props `{ projectKey, image,
  orientation? }`, unchanged); locale keys `trabalhos_sites_label` /
  `trabalhos_apps_label` / `trabalhos_sistemas_label` / `trabalhos_projects.*` /
  `sobre_photo_alt` / `sobre_bio.{p1,p2,p3}` — all already exist in both locale files,
  unchanged by this task.
- Produces: `TrabalhosContent: React.FC` (no props), `SobreContent: React.FC` (no props).
  Consumed by Task 2.

- [ ] **Step 1: Create `src/components/TrabalhosContent.tsx`**

```tsx
import { useTranslation } from "next-i18next";
import ProjectCard from "@/components/ProjectCard";

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
 * Corpo do modal de "Trabalhos" (ver NavRootModal) — o modal é dono do
 * cabeçalho (título + fechar); aqui mora só o conteúdo, migrado tal como
 * estava na antiga página /trabalhos.
 */
const TrabalhosContent: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="mt-6 flex flex-col gap-16 lg:gap-20">
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
  );
};

export default TrabalhosContent;
```

- [ ] **Step 2: Create `src/components/SobreContent.tsx`**

```tsx
import Image from "next/image";
import { useTranslation } from "next-i18next";

const paragraphs = ["p1", "p2", "p3"] as const;

/**
 * Corpo do modal de "Sobre" (ver NavRootModal) — mesma foto + bio da antiga
 * página /sobre, só que a coluna da foto encolhe (era lg:w-72, painel de
 * página inteira; agora sm:w-56, painel de modal mais estreito).
 */
const SobreContent: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">
      <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden rounded-sm border border-line sm:w-56">
        <Image src="/me.jpeg" alt={t("sobre_photo_alt")} fill className="object-cover" />
      </div>

      <div className="measure flex flex-col gap-6">
        {paragraphs.map((p) => (
          <p key={p} className="m-0 text-fg-muted">
            {t(`sobre_bio.${p}`)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default SobreContent;
```

- [ ] **Step 3: Verify both files compile**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `TrabalhosContent.tsx` or `SobreContent.tsx`. (Nothing
imports them yet — this only confirms the files themselves type-check.)

- [ ] **Step 4: Commit**

```bash
git add src/components/TrabalhosContent.tsx src/components/SobreContent.tsx
git commit -m "$(cat <<'EOF'
Extract Trabalhos/Sobre content into standalone components

Pulls the body of the /trabalhos and /sobre pages into TrabalhosContent and SobreContent, with no page chrome (Head/Header/Footer/SectionHeader) — groundwork for rendering them directly inside the nav modal instead of linking out to a full page.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Render content inline in the modal; nav items become buttons

**Files:**
- Modify: `src/components/NavRootModal.tsx` (full rewrite)
- Modify: `src/components/Header.tsx:17-26` (`NavItem` interface)
- Modify: `src/components/Header.tsx:28-61` (`NavEntry` component)
- Modify: `src/components/Header.tsx:99-102` (`navItems` array)

**Interfaces:**
- Consumes: `TrabalhosContent`, `SobreContent` from Task 1 (both `React.FC`, no props).
- Produces: no new exports; `NavItem.href` becomes optional (`href?: string`) — this
  interface is not consumed by any later task in this plan.

- [ ] **Step 1: Replace `src/components/NavRootModal.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { reveal } from "@/lib/reveal";
import { NAV_MODAL_TITLE_KEY, type NavModalKey } from "@/lib/navModal";
import TrabalhosContent from "@/components/TrabalhosContent";
import SobreContent from "@/components/SobreContent";

interface NavRootModalProps {
  modalKey: NavModalKey | null;
  onClose: () => void;
}

/**
 * Aberto pela raiz do nav (ver NavRootReveal) ou, no branch estático do
 * Hero, direto pelo clique. O conteúdo mora aqui mesmo — não há mais página
 * cheia por trás; o título é a mesma chave que o conteúdo usaria como
 * cabeçalho de seção, se ainda existisse uma página.
 */
const NavRootModal: React.FC<NavRootModalProps> = ({ modalKey, onClose }) => {
  const { t } = useTranslation("common");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!modalKey) return;

    // Um frame depois do mount, pra reveal() animar a entrada em vez de já
    // nascer no estado final.
    const frame = window.requestAnimationFrame(() => setVisible(true));
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      setVisible(false);
    };
  }, [modalKey, onClose]);

  if (!modalKey) return null;

  return (
    <div
      className={`fixed inset-0 z-70 flex items-center justify-center bg-ink/85 px-5 backdrop-blur-md ${reveal(
        visible
      )}`}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-sm border border-line bg-surface p-8 sm:p-10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6">
          <h2 className="type-display type-section m-0 text-fg">{t(NAV_MODAL_TITLE_KEY[modalKey])}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t("modal_close")}
            className="type-label shrink-0 text-fg-muted transition-colors hover:text-fg"
          >
            ✕
          </button>
        </div>

        {modalKey === "trabalhos" && <TrabalhosContent />}
        {modalKey === "sobre" && <SobreContent />}
      </div>
    </div>
  );
};

export default NavRootModal;
```

- [ ] **Step 2: Edit `src/components/Header.tsx` — `NavItem` interface**

Replace:

```tsx
interface NavItem {
  href: string;
  label: string;
  /** Link externo: abre em aba nova e leva rel de segurança. */
  external?: boolean;
  /** Só na home: em vez de navegar, dispara a raiz até o planeta e abre o
   *  modal correspondente. Fora da home (onModalClick ausente) o link navega
   *  normalmente para `href`. */
  modalKey?: NavModalKey;
}
```

With:

```tsx
interface NavItem {
  label: string;
  /** Só itens externos usam href pra navegar de verdade. */
  href?: string;
  /** Link externo: abre em aba nova e leva rel de segurança. */
  external?: boolean;
  /** Dispara a raiz até o planeta e abre o modal correspondente. Todo item
   *  interno tem um — não existe mais página por trás pra navegar, então o
   *  item renderiza como <button>, não <Link>. */
  modalKey?: NavModalKey;
}
```

- [ ] **Step 3: Edit `src/components/Header.tsx` — `NavEntry` component**

Replace:

```tsx
const NavEntry: React.FC<{
  item: NavItem;
  className: string;
  onNavigate?: () => void;
  onModalClick?: (key: NavModalKey, origin: DOMRect) => void;
}> = ({ item, className, onNavigate, onModalClick }) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.modalKey && onModalClick) {
      event.preventDefault();
      onModalClick(item.modalKey, event.currentTarget.getBoundingClientRect());
    }
    onNavigate?.();
  };

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
    <Link href={item.href} onClick={handleClick} className={className}>
      {item.label}
    </Link>
  );
};
```

With:

```tsx
const NavEntry: React.FC<{
  item: NavItem;
  className: string;
  onNavigate?: () => void;
  onModalClick?: (key: NavModalKey, origin: DOMRect) => void;
}> = ({ item, className, onNavigate, onModalClick }) => {
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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (item.modalKey && onModalClick) {
      onModalClick(item.modalKey, event.currentTarget.getBoundingClientRect());
    }
    onNavigate?.();
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {item.label}
    </button>
  );
};
```

- [ ] **Step 4: Edit `src/components/Header.tsx` — `navItems` array**

Replace:

```tsx
  const navItems: NavItem[] = [
    { href: "/trabalhos", label: t("nav_trabalhos"), modalKey: "trabalhos" },
    { href: "/sobre", label: t("nav_sobre"), modalKey: "sobre" },
  ];
```

With:

```tsx
  const navItems: NavItem[] = [
    { label: t("nav_trabalhos"), modalKey: "trabalhos" },
    { label: t("nav_sobre"), modalKey: "sobre" },
  ];
```

- [ ] **Step 5: Update the two `.map()` calls that key on `item.href`**

`Header.tsx` has two `navItems.map((item) => <NavEntry key={item.href} ...>)` calls — one
in the desktop `<nav>`, one in the mobile drawer. `item.href` is now `undefined` for both
current items, so it can no longer be the React key. In both places, change:

```tsx
key={item.href}
```

to:

```tsx
key={item.label}
```

(`item.label` is unique across `navItems` here, same as `item.href` was.)

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit`
Expected: no errors. In particular, confirm no remaining reference to `Link` being passed
`item.href` as a required prop, and that `NavItem`'s now-optional `href` doesn't break the
`external` branch (which still reads `item.href`, fine since that branch is only taken
when `item.external` is true and an external item always supplies `href`).

- [ ] **Step 7: Commit**

```bash
git add src/components/NavRootModal.tsx src/components/Header.tsx
git commit -m "$(cat <<'EOF'
Render Trabalhos/Sobre content inline in the nav modal

NavRootModal renders TrabalhosContent/SobreContent directly instead of a "ver mais" link to a full page, and grows from max-w-lg to max-w-3xl with internal scroll to fit the richer content. Header's internal nav items (no longer having a page to link to) become <button> instead of <Link>.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Delete the standalone pages, remove the dead locale key, update docs

**Files:**
- Delete: `src/pages/trabalhos.tsx`
- Delete: `src/pages/sobre.tsx`
- Modify: `public/locales/pt/common.json:24`
- Modify: `public/locales/en/common.json:24`
- Modify: `CLAUDE.md:27-33`
- Modify: `CLAUDE.md:65`
- Modify: `CLAUDE.md:150`

**Interfaces:** None — this task only removes files/keys and updates documentation. No
code in later tasks depends on anything here (this is the last task).

- [ ] **Step 1: Delete the two pages**

```bash
git rm src/pages/trabalhos.tsx src/pages/sobre.tsx
```

- [ ] **Step 2: Remove `modal_see_more` from `public/locales/pt/common.json`**

Find (currently line 23-24):

```json
  "modal_close": "Fechar",
  "modal_see_more": "Ver mais",
```

Replace with:

```json
  "modal_close": "Fechar",
```

- [ ] **Step 3: Remove `modal_see_more` from `public/locales/en/common.json`**

Find (currently line 23-24):

```json
  "modal_close": "Close",
  "modal_see_more": "See more",
```

Replace with:

```json
  "modal_close": "Close",
```

- [ ] **Step 4: Verify both locale files are valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/locales/pt/common.json')); JSON.parse(require('fs').readFileSync('public/locales/en/common.json')); console.log('ok')"`
Expected: `ok`

- [ ] **Step 5: Update `CLAUDE.md` — architecture opening paragraph**

Find (currently lines 27-33):

```markdown
**The live site is mostly one page, plus two content routes reached through a nav modal.** Successive refactors reduced a multi-page Bootstrap site to a single hero; `/trabalhos` and `/sobre` are the first real pages added since. Build output is 10 static pages — 5 routes × 2 locales — plus one dynamic API route:

- `/` (`src/pages/index.tsx`) — `Intro`, `Header`, `Hero`, `<Analytics />`, all fed by one `useIntroSequence()` call. That is the whole page.
- `/trabalhos` (`src/pages/trabalhos.tsx`) — projects showcase: three category sections (Sites/Apps/Sistemas), each a grid of `ProjectCard`.
- `/sobre` (`src/pages/sobre.tsx`) — full bio and photo.
- `/api/send-email` — see Contact below.
- `/404`.
```

Replace with:

```markdown
**The live site is one page.** Successive refactors reduced a multi-page Bootstrap site to a single hero. Build output is 8 static pages — 4 routes × 2 locales:

- `/` (`src/pages/index.tsx`) — `Intro`, `Header`, `Hero`, `<Analytics />`, all fed by one `useIntroSequence()` call. That is the whole page.
- `/api/send-email` — see Contact below.
- `/404`.

"Trabalhos" and "Sobre" are not pages — they're `NavRootModal` content, rendered by
`TrabalhosContent.tsx` and `SobreContent.tsx` (both in `src/components/`) and opened from
`Header.tsx`'s nav. There used to be `/trabalhos` and `/sobre` pages that this same content
lived in, reached via a "ver mais" link from a teaser modal; the pages were deleted once the
modal grew to show the content directly, so there's no longer a URL for either.
```

- [ ] **Step 6: Update `CLAUDE.md` — `navItems` paragraph**

Find (currently line 65):

```markdown
**`navItems` in `Header.tsx` is the re-attachment point for internal nav.** It is no longer empty: it carries one entry, the WhatsApp link built from `whatsappHref()`, with `external: true` so `NavEntry` renders it as an `<a target="_blank">` instead of a `next/link`. The `NavItem` type has an `external?: boolean` field for exactly this. Re-enabling an internal section means adding a non-external entry to the same array — it's mapped in both the desktop `<nav>` and the mobile drawer, so restoring one entry restores both.
```

Replace with:

```markdown
**`navItems` in `Header.tsx` carries two entries, "Trabalhos" and "Sobre mim", both opening `NavRootModal` instead of navigating.** Neither has an `href` — `NavItem.href` is reserved for a future `external: true` entry, which `NavEntry` would render as `<a target="_blank">` (the `external` field exists for exactly this, unused today). Every current item has a `modalKey` instead and renders as `<button type="button">`, since its content lives entirely inside the modal (`NavRootModal.tsx`, via `TrabalhosContent`/`SobreContent`) and there's nothing to link to. Both entries are mapped in the desktop `<nav>` and the mobile drawer, so adding a third restores both automatically.
```

- [ ] **Step 7: Update `CLAUDE.md` — Contact section**

Find (currently line 150):

```markdown
The live path is WhatsApp: the CTA in the hero (static branch always, choreographed branch once `stage >= 4`) and the always-present entry in `Header.tsx`'s `navItems`. The hero design spec states email contact is being retired.
```

Replace with:

```markdown
The live path is WhatsApp: the CTA in the hero (static branch always, choreographed branch once `stage >= 4`). The hero design spec states email contact is being retired.
```

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: build succeeds (ignore the pre-existing `⨯ ESLint: Invalid Options` noise). Confirm
the route list no longer includes `/trabalhos` or `/sobre`.

- [ ] **Step 9: Manual check**

Run: `npm run dev`, open the home page.

- Click "Trabalhos" in the desktop nav — modal opens with the three category sections and
  all four project cards, scrollable if it overflows the viewport.
- Click "Sobre mim" — modal opens with the photo and three bio paragraphs.
- Confirm Escape, the ✕ button, and clicking the backdrop all close the modal.
- Open the mobile hamburger drawer at ~375px width, confirm both nav items still open the
  same modals from there.
- Visit `/trabalhos` and `/sobre` directly — confirm both now 404.
- Toggle `LanguageSwitcher` and confirm the modal content (titles, category labels,
  project text, bio) switches language correctly, both with a modal open and closed.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Delete standalone Trabalhos/Sobre pages, now redundant

Their content moved into NavRootModal in the prior commit. Also removes the now-unused modal_see_more locale key and updates CLAUDE.md's architecture, navItems, and Contact sections to match — the site is back to being one page, with two content-rich modals instead of two pages.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
