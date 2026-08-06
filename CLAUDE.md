# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Personal portfolio for Alef Devops (https://alefdevops.com), built with Next.js 14 (pages router) + TypeScript + Tailwind CSS v4. Deployed on Vercel. Most user-facing copy is Brazilian Portuguese; `pt` is the default locale. Code comments are in Portuguese and explain *why*, not *what* — match that when editing.

The site's positioning is a career arc from physical network infrastructure to on-chain development: fifteen years of fiber/POPs/monitoring, now applied to web systems and smart contracts. That framing drives both the copy and the visual language.

## Commands

```bash
npm run dev      # dev server
npm run build    # production build — this is the real check
npm start        # serve production build
npm run lint     # BROKEN, see below
npm test         # alias for `npm run build`
```

There is no test runner. "Testing" a change means `npm run build` succeeding, plus `npm run dev` and clicking through at desktop and ~375px widths, then switching locale with `LanguageSwitcher` to confirm both languages of any new keys.

**`npm run lint` is broken.** ESLint 9 is installed but Next 14's `next lint` passes removed options (`useEslintrc`, `extensions`, `resolvePluginsRelativeTo`, `rulePaths`, `ignorePath`, `reportUnusedDisableDirectives`), so it prints `Invalid Options:` and **exits 1** — `npm run lint` fails as a command. `npm run build` hits the same underlying failure but swallows it: it prints a one-line `⨯ ESLint: Invalid Options` during the "Linting and checking validity of types" step and then proceeds to compile, type-check, and generate pages normally, exiting 0. So: a clean build does *not* mean lint passed (lint never actually ran), and a build is only broken if compilation or type checking fails — the ESLint line in build output is noise. Fixing lint means either migrating to `eslint.config.mjs` flat config or pinning ESLint 8.

## Architecture

**The live site is the hero plus two plain content pages.** Successive refactors reduced a multi-page Bootstrap site to a single hero; "Trabalhos" and "Sobre mim" then came back as real routes. Build output is 3 routes × 2 locales, plus the two API routes and `/404`:

- `/` (`src/pages/index.tsx`) — `PixelBlastBackground`, `Intro`, `Header`, `<main><Hero /></main>`, `<Analytics />`, all fed by one `useIntroSequence()` call. `index.tsx` also owns the full SEO `<Head>` (canonical/hreflang, Open Graph, Twitter Card, and a JSON-LD `<script>` built by `buildJsonLd()`, see SEO below). That's the whole page.
- `/sobre` (`src/pages/sobre.tsx`) and `/trabalhos` (`src/pages/trabalhos.tsx`) — thin pages: `Header` (no `introPhase`/`contentRevealed` props, so it renders its final state with no animation) + a `SectionHeader` (label/title from the `nav_sobre`/`sobre_header` and `nav_trabalhos`/`trabalhos_header` locale keys) + `SobreContent`/`TrabalhosContent` + `Footer`, inside a `mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24` `<main>` — the same shape as the disabled blog pages in `src/pages-disabled/`. Reached from `Header.tsx`'s nav as ordinary `<Link>`s.
- `/api/og` (`src/pages/api/og.tsx`) — edge-runtime (`export const config = { runtime: "edge" }`) route using `next/og`'s `ImageResponse` to render the Open Graph card server-side from a `?locale=en|pt` query param. No static asset; `index.tsx` points `og:image`/`twitter:image` at it.
- `/api/send-email` — see Contact below.
- `/404`.

`SobreContent.tsx` and `TrabalhosContent.tsx` (both in `src/components/`) hold the actual body content for `/sobre` and `/trabalhos` — the page owns the heading via `SectionHeader`, so these components start straight at the content. They used to live only inside a `NavRootModal` overlay, opened by a nav click that first grew a decorative root from the planet to the clicked button (`NavRootReveal`) before the modal appeared; that modal, the root-growing state machine, and `src/lib/navModal.ts` were all deleted when the nav switched to real navigation, since a page transition made the "root travels to the content" narrative moot.

`Hero.tsx` renders one of two branches, decided once on mount by `prefersStaticHero()`. Below the 1024px breakpoint, under `prefers-reduced-motion`, and in the server-rendered HTML, it falls back to a static branch: eyebrow, the single `<h1>`, a support paragraph, one always-visible WhatsApp CTA, and `<ExpertiseAreas />`. Otherwise it mounts the choreographed branch: a `300vh` container (`containerRef`) with a `sticky top-0` child that stays pinned while `useScrollProgress` drives a WebGL scene. That branch is **radial**: the headline sits centred over the closed planet and leaves as soon as the first root starts growing, and the three area blocks are absolutely positioned around the planet — Web2 upper-left, Web3 right, Infrastructure lower-left — each joined to its own shell by an orthogonal "root" that grows with the scroll. Web2 is the featured layer: it's the core shell (smallest radius, opens first) and carries the primary `os2` accent; Infrastructure is the outer/surface shell that opens last, alongside the CTA, carrying the neutral `fg` colour that used to belong to Web2's slot. The WhatsApp CTA returns centred at the bottom in the last stage. The WhatsApp number and URL builder live in `src/lib/whatsapp.ts`, shared by `Hero.tsx` and `Header.tsx`; the pre-filled message is a locale key, so it differs per language. `Hero` also takes a `contentRevealed` prop (see the loading-intro section below): its content is hidden only while the curtain covers it, and returns slightly after the logo starts travelling to the header.

**The 1024px breakpoint is load-bearing, not a round number.** The radial layout sizes the planet off the viewport *height* and the text blocks off its *width*, so a squarish window puts the outer shell underneath the Web2 block and the text stops being readable. It was 768 while the choreographed branch was a two-column grid.

- `src/lib/shellStages.ts` — **the single source for the three layers**: colour (both the `three` hex and the CSS custom property), point count, shell radius, the progress window in which the shell opens, and the branch angle. Also the camera constants and `STAGE_THRESHOLDS`. Consumed by `PlanetScene`, `useScrollProgress` and `CircuitRoots` — this table used to be duplicated across the first two, with a comment asking you to keep them in sync by hand.
- `src/hooks/useScrollProgress.ts` — tracks scroll position against the 300vh container and exposes a continuous `progressRef` plus a discrete `stage` (0 to 5) used to gate reveals. The thresholds now live in `shellStages.ts` and mark the **end** of each shell's window, not the start: a layer's text arrives when its root reaches the block, not when it leaves the planet.
- `src/components/CircuitRoots.tsx` — the three roots and the three text blocks. Owns an overlaid `<svg>` and its own rAF loop, which reads `progressRef` and writes each path's `d`, `strokeDasharray` and `strokeDashoffset` directly — no React re-render. The text blocks stay put and only the path's planet-side end tracks the expanding shell; tracking the shell with the whole block would push Web3's text off-screen. A `ResizeObserver` on the container and the blocks re-measures the joins, which is what keeps the roots attached when fonts load or the locale changes.
- `src/lib/rootPath.ts` — `orthogonalRoot()`: three segments, two 90° elbows, plus the closed-form length (`getTotalLength()` would cost a reflow per frame). The last horizontal segment *is* the hairline above the text block.
- `src/lib/reveal.ts` — the shared enter/leave transition string, used by `Hero` and `CircuitRoots`.
- `src/lib/planetGeometry.ts` — Fibonacci-sphere point distribution, inter-shell link positions, and the `smoothstep` easing shared by the scene and the roots.
- `src/lib/whatsapp.ts` — the WhatsApp number constant and `whatsappHref()` builder, consumed by both `Hero.tsx` and `Header.tsx`.
- `src/components/PlanetScene.tsx` — the three-concentric-shell WebGL scene (raw `three`, no renderer library), loaded via `next/dynamic` with `ssr: false` so `three` stays out of the first paint and the static HTML.

`ExpertiseAreas.tsx` renders in the static hero branch as two rows: a full-width featured band for Web2 (index `01`), then a `sm:grid-cols-2` row with Web3 (`02`) and Infraestrutura (`03`) compact — Web2 is the primary offering, the other two are supporting. The compact row is data-driven in the same pattern as `ServicesSection`: a local `compactAreas` array of `{ id, key }` mapped over `<li>`s. The actual content of a card — the index, `t(\`areas.${key}.title\`)`, `.desc`, `.stack`, and for the featured card `.items` — lives in `src/components/AreaCard.tsx`, which returns a bare fragment (no `<li>`, no grid) so it can be dropped into three different containers: `ExpertiseAreas`'s featured band, its compact grid, and `CircuitRoots`'s absolutely positioned blocks. `AreaCard` takes an optional `variant?: "compact" | "featured"` (default `"compact"`) — `CircuitRoots` never passes it, so the radial hero's cards are unaffected by the featured treatment; only `ExpertiseAreas`'s Web2 band passes `"featured"`, which renders the `.items` sub-list and swaps the index colour from `om3` to `os2`. Adding or renaming an area means updating `ExpertiseAreas`/`AreaCard` **and** the `LAYERS` table in `shellStages.ts`, plus both locale files — never the layout. The `01/02/03` numbering is `aria-hidden` decoration and is the surviving trace of a deleted OTDR graph (see below); it follows reading order (Web2 → Web3 → Infra), not a fixed per-topic id.

**Most of the codebase is deliberately disabled, and it is still type-checked.** Two separate mechanisms:

- `src/components/sections/` — `ServicesSection`, `AboutSection`, `ContactSection`, `SkillsSection` are imported nowhere.
- `src/pages-disabled/` — the two blog pages (`blog.tsx`, `blog/pagehashfile.tsx`), moved out of `src/pages/` so Next stops routing them. `/blog` currently 404s.

`src/components/Footer.tsx` is a third case, but only a partial one: dropped from `index.tsx` so the home page ends with the hero, it's still live on `/sobre`, `/trabalhos`, and both blog pages in `src/pages-disabled/`.

`tsconfig.json` includes `**/*.tsx` from the repo root, so **everything under `src/pages-disabled/` and the unused sections is still compiled and type-checked** — a type error in dormant code breaks the build even though the route doesn't exist. Verified with `npx tsc --noEmit --listFiles`. Conversely, they render nowhere, so a visual or runtime bug there is invisible until re-enabled.

`AboutSection`, `ContactSection`, and `SkillsSection` each open with a `DESATIVADO` docblock explaining their state — read it before touching one. `ServicesSection` does not have one; it was switched off later, by removing its import from `index.tsx`.

Their readiness differs sharply:
- `ServicesSection`, `AboutSection`, `ContactSection` — dark-themed, translated, keys already in both locales. Cheap to re-enable.
- `SkillsSection` — **still Bootstrap-era**: `className="container py-5"`, large inline `style={{}}` objects, white-background modals, `<img src="/bootstrap.svg">`. Bootstrap CSS is no longer loaded, so those classes resolve to nothing. Content was preserved verbatim from the old `AboutSection`; decide the form (tabs / expanding cards / timeline) before restyling.

`navItems` in `Header.tsx` carries two entries, "Trabalhos" and "Sobre mim", each a plain `NavItem` (`label`, `href`) pointing at `/trabalhos` and `/sobre`, rendered by `NavEntry` as a `<Link>`. `NavItem.external` is the only special case: reserved for a link that should open in a new tab via `<a target="_blank">`, unused today. Both entries are mapped in the desktop `<nav>` and the mobile drawer, so adding a third restores both automatically.

`Header` itself is one `sticky top-0` component, transparent over the hero and switching to `bg-ink/85 backdrop-blur-md` past 24px of scroll via a `scroll` listener. It owns the mobile hamburger (`open` state) and renders `LanguageSwitcher` in both the desktop bar and the drawer. Its logo is `<BrandLogo>` (see below), not inline markup.

**The loading intro is server-rendered on purpose, and it ends in a shared-element morph into the header logo — that whole sequence is one state machine.** `src/hooks/useIntroSequence.ts` is the single source, lifted to `index.tsx` and passed down (as `introPhase` to `Intro` and `Header`, as `contentRevealed` to `Header` and `Hero`) — nobody else re-reads `matchMedia` or re-derives the timing independently. Its `IntroPhase` is `"pending" | "loading" | "reveal" | "morphing" | "done"`:

- **pending** — server value and the client's first render, so there's no hydration mismatch; `Header`/`Hero` treat it exactly like `"done"` (final content, visible), because that's what a no-JS visitor gets. An effect then decides whether to animate at all.
- **loading** — the curtain shows the server/desktop icon animation, driven by `src/hooks/useIntroProgress.ts` (unchanged curve: self-runs to 90% via `SELF_RUN_MS`, closes only once both `document.fonts.ready` and `import("@/components/PlanetScene")` resolve — the same dynamic import `Hero`'s `next/dynamic` makes, deduped by the module registry, so "the `three` chunk landed" needs no `onReady` prop — floors total time at `MIN_TOTAL_MS` 1.8s, hard-caps at `MAX_TOTAL_MS` 6s so a stalled promise or a backgrounded tab, where rAF is suspended, can't strand the curtain).
- **reveal** — `useIntroProgress` reported `done`; the curtain swaps its loading UI for a centred large `BrandLogo` (`src/components/BrandLogo.tsx`, the "Alef Devops" icon+wordmark lockup), which enters as a **left-to-right wipe** (animated `clip-path: inset()`, right edge `100%` → `0%`, `WIPE_MS` 650ms) and then holds. `REVEAL_MS` is wipe + hold (1050ms); the wipe must finish inside it, or the trip would start with the wordmark still half-masked.
- **morphing** — the curtain stops rendering its own `BrandLogo` copy in the same instant `Header` starts rendering its `BrandLogo` with the same Framer Motion `layoutId="brand-logo"`; that tree swap is what Framer Motion reads as one element travelling from screen-centre to the header slot, over `MORPH_MS` (700ms), rather than two independent animations. The curtain itself fades out (`opacity-0`) over the same duration. `CONTENT_DELAY_MS` (180ms) into this phase, `contentRevealed` flips true and the hero content plus the header's nav/language/social groups fade in behind the travelling logo — deliberately not on the same frame, or the two movements compete instead of one reading as the consequence of the other.
- **done** — `Intro` unmounts (returns `null`).

**The intro replays on every page load, and the "already played" mark is a module-scope variable in `useIntroSequence.ts`, not `sessionStorage` — that choice is the whole behaviour.** Module state dies with the JS context, so it resets on every refresh and every new tab (intro plays again, which is what's wanted) but survives client-side navigation — which is what stops `LanguageSwitcher` from replaying the entire curtain when someone switches locale mid-visit, since that remounts the home page without reloading. `phase` is therefore lazily initialised from that flag: on a client remount it starts at `"done"` and never renders a curtain frame, whereas correcting it in an effect would happen after paint and flash. On the server and during hydration the flag is always `false` (only an effect writes it, and effects don't run server-side), so both sides agree on `"pending"`.

**That flag is written at the *start* of the sequence, which collides with `reactStrictMode: true` — hence the `ownsIntro` ref.** In dev, React 18 StrictMode invokes a mount effect twice on the same instance (setup → cleanup → setup). Without the ref, the second invocation reads the flag the first one just wrote, takes the skip branch, and jumps to `"done"` — the curtain never renders a single frame. It fails **only in dev**: a production build invokes the effect once, so `npm run build` and the deployed site look fine while `npm run dev` shows no intro at all. The ref survives between the two invocations of one mount and does not survive a real remount, which is exactly the distinction the module flag alone can't make. The old `sessionStorage` gate never hit this because it wrote at the *end* of the sequence.

`useIntroSequence` also owns the scroll lock: `document.body.style.overflow` is `"hidden"` for every phase except `"done"`, keyed off `phase` rather than component lifecycle — otherwise the hero's 300vh scroll choreography could advance behind the curtain and a visitor would land mid-narrative the moment it clears.

Other details that still hold:
- The curtain (`src/components/Intro.tsx`) renders in server HTML on purpose: appearing only after mount would let a first-time visitor see the hero for an instant before being covered.
- Whoever must *not* see it needs it gone before first paint. The only skip condition left is `prefers-reduced-motion`, so `globals.css` hides `[data-intro-curtain]` inside a plain media query. That rule lives **outside every `@layer`**, deliberately — the curtain carries the `flex` utility and in Tailwind v4 layer order beats specificity, so inside `@layer components` the rule lost to the utility and the curtain stayed visible. `_document.tsx` used to carry an inline pre-paint script setting `data-intro="seen"` on `<html>`; it existed only because `sessionStorage` can't be read from CSS, and went away with the once-per-session gate.
- `z-60`, one above `Header`'s `z-50`, because the header comes later in the DOM and would win a tie.
- A `<noscript>` block hides the curtain too, since without JS it would never unmount.
- The curtain is `aria-hidden` so screen readers read the page underneath directly. Known trade-off: a keyboard user tabbing during the ~2s+ sequence can focus a link behind it; the fix, if it matters, is `inert` on the content, not a focus trap.

`BrandLogo` takes an optional `layoutId` — only passed when it's the active end of the shared morph (the curtain's `reveal`-phase copy, and `Header`'s copy once `introPhase` is `"morphing"` or `"done"`).

**`Header` must remount `BrandLogo` when it takes the `layoutId`, and that is not cosmetic.** Framer Motion registers a `layoutId` in its shared-node group inside the projection node's `mount()`, which early-returns once the node has an instance (`node_modules/motion-dom/dist/es/projection/node/create-projection-node.mjs`). Handing a `layoutId` to an element that is *already mounted* registers nothing, so nothing is promoted and the whole morph silently does not happen — the big copy just vanishes. Hence the `key={morphed ? "shared" : "plain"}` on `Header`'s `BrandLogo`. That bug shipped once; don't remove the key.

`BrandLogo`'s two children (icon chip and wordmark) are `motion.span`s carrying `layout` — but only while `layoutId` is set. The lg and sm boxes have different width-to-height ratios, so without the children measuring themselves the parent's projection stretches the lockup horizontally mid-trip; and outside the morph, an unconditional `layout` would animate every unrelated box change (locale switch, font load).

`Header` accepts `introPhase` and `contentRevealed` as optional props defaulting to `"done"`/`true`, for pages outside the intro flow — `/sobre`, `/trabalhos`, and the disabled blog pages under `src/pages-disabled/` all render `Header` with no intro at all.

**Two pieces of chrome live in `_app.tsx`, above every page, not in `index.tsx`:** `<Component />` then `<MusicToggle />`, both siblings inside the font-variable wrapper div. `MusicToggle.tsx` is a fixed bottom-right button (`z-40`) that loops `public/audio/background.mp3`; it attempts autoplay on the page's first pointer/keyboard/wheel/touch/scroll event (browsers block audio-with-sound before any interaction) and falls back to the manual toggle if that `.play()` rejects. `PixelBlastBackground.tsx`, by contrast, renders inside `index.tsx` itself (not `_app.tsx`) as the first child before `Intro`/`Header`/`Hero` — a fixed, `-z-10`, `pointer-events-none`, low-opacity (`opacity-28`) wrapper around `PixelBlast.tsx`, a `three`-based particle/pixel field loaded via `next/dynamic` with `ssr: false` (same reasoning as `PlanetScene`: keep `three` out of the first paint and the static HTML). It's decorative texture behind the whole page, independent of the hero's own WebGL scene.

## SEO

`index.tsx`'s `<Head>` carries canonical/hreflang (`pt-BR`, `en`, `x-default`), Open Graph, and Twitter Card tags, plus a JSON-LD `<script type="application/ld+json">` built by `buildJsonLd()` in `src/lib/jsonLd.ts`. That function returns a single `@graph` — `WebSite`, `Person`, and `Organization` linked by `@id` (e.g. `${canonicalUrl}#person`) rather than nested, so search engines resolve them as one connected entity instead of three disconnected ones. The `Person` node's `knowsAbout` array is a long, near-duplicated (EN/PT) keyword list spanning the full stack — frontend, backend, databases, mobile, cloud, and the infra/networking vocabulary (BGP, GPON, VLAN, Zabbix, …) that is this site's whole positioning; keep both language arrays in sync if it's ever edited. `og:image`/`twitter:image` point at `/api/og` (see the route above), not a static file. `public/robots.txt` and `public/sitemap.xml` are static and hand-maintained — the sitemap lists just the two locale URLs (`/` and `/en`) with reciprocal `hreflang` alternates; there's no `next-sitemap` generation step, so a new route/locale means editing the XML by hand.

**Path alias**: `@/*` → `src/*`. `strict` is on.

## Design docs

`docs/superpowers/specs/` holds dated design specs written before implementation, five of them so far. `2026-07-30-hero-raizes-por-camada-design.md` covers the current hero — the radial layout, the orthogonal roots, the anchor-radius formula and the stage table — and its implementation plan sits in `docs/superpowers/plans/`. `2026-07-30-intro-de-carregamento-design.md` covers the loading curtain (`Intro.tsx`) — the dual-readiness promise, the 1.8s floor / 6s cap curve, and why the server must render it. `2026-07-30-hero-planeta-cascas-scroll-design.md` covers the generation before the radial hero and is still the best explanation of the three-shell geometry and the `three` integration decisions, but the two-column choreography it describes is no longer what ships. `2026-07-30-hero-areas-de-experiencia-design.md` covers the generation before *that* (eyebrow/`<h1>`/single static CTA/`<ExpertiseAreas />`, no WebGL) and is the best explanation of *why* the OTDR panel and manifesto headline were removed. `2026-07-30-hero-network-mesh-design.md` is an intermediate exploration — a `NetworkMesh` particle-mesh component — that was scrapped in favor of the planet scene before ever being committed; it survives only as an uncommitted `git stash` entry, not as a file in `src/`.

Treat specs as historical intent, not current truth. The áreas-de-experiência spec specifies two CTAs (an internal `/#services` pill plus an outline WhatsApp link) and says the `.scroll-cue` indicator stays; shipped reality at that point was a single WhatsApp CTA in the pill style and the scroll indicator deleted, both because `ServicesSection` was disabled afterward. The planet-hero work then reintroduced a choreographed, scroll-pinned hero, and `.scroll-cue` came back with it (see Styling below) — so "indicator deleted" is no longer current either, only a description of that intermediate state.

## Styling

Tailwind v4 only — no Bootstrap, no Sass, no CSS modules. Config is CSS-first in `src/styles/globals.css` (imported by `_app.tsx`); there is no `tailwind.config.js`. `postcss.config.mjs` loads `@tailwindcss/postcss`.

The design language is fiber-optic / network-operations-center: dark blue-tinted surfaces, mono technical labels, accents taken from fiber jacket colors. Use the `@theme` tokens rather than raw hex or Tailwind's default palette:

- Surfaces: `ink` (page bg), `surface`, `raised`, `line`, `line-soft` (borders)
- Text: `fg`, `fg-muted`
- Accents: `os2` `#f4c542` (singlemode yellow — primary), `om3` `#22d3c5` (multimode aqua — secondary)

`--ease-out-quint`, declared in `@theme`, is used again: `.scroll-cue` (the pinned-hero scroll indicator, back after the planet hero reintroduced a choreographed scroll) animates with it, and the shared `reveal()` helper in `src/lib/reveal.ts` applies it inline via `ease-[var(--ease-out-quint)]` for the staged reveal transitions.

Component classes in `@layer components`:
- `.type-display` — Archivo at `font-stretch: 125%`, headings only. Depends on the `wdth` axis being loaded.
- `.type-hero` — `clamp(2.75rem, 7vw, 5.5rem)`. The high ceiling assumes the short two-line headline; it was raised from a much lower value when the long manifesto sentence was replaced. Only the hero `<h1>` uses it.
- `.type-label` — mono uppercase, wide tracking, for eyebrows and technical data. It force-uppercases, so don't apply it to unit strings.
- `.type-section`, `.measure` (62ch reading width, replaced an old `text-align: justify`) — used by `SectionHeader` (live on `/sobre` and `/trabalhos`, plus the moved blog pages and the dormant sections) and by `.measure` in the hero.

`SectionHeader.tsx` (labeled rule + title) is the heading pattern for `/sobre` and `/trabalhos`, the blog pages, and any dormant section that comes back.

Global base layer sets `color-scheme: dark`, `scroll-behavior: smooth`, `scroll-padding-top: 5rem` (so hash anchors clear the sticky header), an `os2` selection colour and focus ring, and a `prefers-reduced-motion` block that collapses all animation/transition durations.

**The scrollbar is hidden site-wide** — `scrollbar-width: none` plus a bare `::-webkit-scrollbar { display: none }` — because the thumb jumping through the hero's 300vh gave away the mechanics before the narrative. Scrolling itself is untouched. Two consequences: `src/components/ScrollCue.tsx` (the mouse-and-chevrons indicator at the foot of stage 0) is now the *only* affordance saying the page continues, so don't remove it without putting something else there; and the `::-webkit-scrollbar` rule is deliberately unscoped, so any scrollable container added later inherits it.

**Recurring layout idiom**: hairline separators are the background showing through a grid gap — `grid gap-px bg-line` with `bg-ink` children. Used in both `ExpertiseAreas` and `ServicesSection`, and it degrades to a single column with horizontal rules on mobile without extra rules.

**Line-art PNGs need `className="invert"`.** The icons in `public/` and `public/icons/` are pure black line art; on the dark background they vanish without it.

## i18n

`next-i18next`, locales `pt` (default) and `en`, configured in `next-i18next.config.js` and spread into `next.config.js`. `localeDetection` is deliberately omitted — Next only accepts `false` there, and passing `true` fails config validation.

- Strings live in `public/locales/{en,pt}/common.json` — 116 leaf keys, with nested objects (`areas.infra.title`, `smart_contracts.desc1`, `form.send`, `about_bio.p1`, `intro.*` for the four curtain stage labels, `music.play`/`music.pause`). The two files are currently key-for-key in sync; keep them that way. `MusicToggle` is the one caller that passes a literal English fallback as `t()`'s second argument (`t("music.play", "Play background music")`) — belt-and-suspenders since the keys already exist in both locales.
- Many keys serve only disabled sections. Don't assume an unreferenced key is dead — check `src/components/sections/` and `src/pages-disabled/` before removing one.
- Stack strings (`areas.*.stack`) are single strings with `·` separators baked in, not arrays joined in JSX. Translating one means editing the string.
- `ServicesSection` looks up `t(\`${service.key}.title\`)` and `t(\`${service.key}.${detail}\`)` from local `services`/`details` arrays. Adding a service means the array entry **plus** `title`/`desc1`/`desc2`/`desc3` in both locale files.
- Components call `useTranslation("common")`. `_app.tsx` wraps with `appWithTranslation`.
- All pages load translations through `getI18nStaticProps(locale)` from `src/lib/getI18nStaticProps.ts` — use it for new pages rather than calling `serverSideTranslations` inline.
- `LanguageSwitcher` switches via `router.push(asPath, asPath, { locale })` and handles outside-click/Escape dismissal itself.
- `_document.tsx` reads `props.__NEXT_DATA__.locale` so `<Html lang>` follows the active locale.
- Fonts: `Archivo` (with the `wdth` axis) and `IBM_Plex_Mono`, loaded via `next/font/google` in `_app.tsx` and bridged into Tailwind through `@theme inline` as `--font-sans` / `--font-mono`.

## Contact

The live path is WhatsApp: the CTA in the hero (static branch always, choreographed branch once `stage >= 4`). The hero design spec states email contact is being retired.

`src/pages/api/send-email.js` nonetheless still exists and works: POST-only, `nodemailer` over Gmail SMTP using `SMTP_USER` / `SMTP_PASS` (see `.env.example`), relaying to a recipient hardcoded in the file. Its only consumer is the disabled `ContactSection`, so nothing currently calls it. An earlier version sat in `src/api/`, outside `pages/`, and 404'd — don't move it back.

## Other notes

- `package.json` still carries starter metadata from the Bootstrap template this was forked from: `"name": "react-nextjs"`, `"repository": "twbs/examples"`.
- `react-router-dom` is in `dependencies` but unused (Next handles routing).
- `public/` still holds assets only referenced by disabled code (`pagehashfile.jpg`, `bootstrap.svg`, the service icons) — check `src/pages-disabled/` and the dormant sections before deleting any.
- `README.md` is the human-facing doc (Portuguese) and points here for architecture. Keep its tech-stack list and its note about the disabled sections in sync when either changes.
- No Cursor (`.cursor/rules/`, `.cursorrules`) or Copilot (`.github/copilot-instructions.md`) rule files exist in this repo.
