# SEO: boas práticas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o Google conseguir indexar, rankear e mostrar corretamente `alefdevops.com` — title/description focados em Web2, Open Graph/Twitter Card com imagem gerada dinamicamente, `canonical`/`hreflang` pt↔en, `robots.txt`, `sitemap.xml` e um bloco JSON-LD `Person`.

**Architecture:** Todo o SEO de página vive no `<Head>` de `src/pages/index.tsx` (única rota real do site, ver `CLAUDE.md`), lendo copy localizada via `next-i18next`. A imagem OG é gerada por uma rota edge nova (`src/pages/api/og.tsx`) usando `ImageResponse` do pacote `next/og`, já embutido no Next 14 instalado — nenhuma dependência nova. `robots.txt` e `sitemap.xml` são arquivos estáticos em `public/`, escritos à mão porque o site só tem duas URLs indexáveis (`/` e `/en`).

**Tech Stack:** Next.js 14 (pages router), `next-i18next`, `next/og` (`ImageResponse`, edge runtime), TypeScript.

## Global Constraints

- Domínio canônico: `https://www.alefdevops.com` (sem barra final nas URLs exceto a home).
- Foco de busca: "serviço + termo técnico", liderando com Web2 (sites e sistemas sob medida); Web3/infra é diferencial secundário.
- Sem dependências novas no `package.json` — `next/og` já vem com o Next instalado.
- Sem test runner no projeto: "testar" uma mudança é `npm run build` passar, mais inspeção manual no navegador (ver `CLAUDE.md`). As tarefas abaixo usam esse fluxo em vez de testes automatizados.
- `public/locales/pt/common.json` e `public/locales/en/common.json` devem continuar chave-por-chave em sincronia.
- Path alias `@/*` → `src/*`.

---

### Task 1: Copy localizada (`meta_title` + `meta_description` revisada)

**Files:**
- Modify: `public/locales/pt/common.json:3`
- Modify: `public/locales/en/common.json:3`

**Interfaces:**
- Produces: chave `meta_title` (string) e `meta_description` (string, texto novo) em ambos os locales, consumidas na Task 3 via `t("meta_title")` / `t("meta_description")`.

- [ ] **Step 1: Adicionar `meta_title` e atualizar `meta_description` no locale pt**

Em `public/locales/pt/common.json`, trocar a linha 3 (`"meta_description": "Alef Devops — smart contracts, sistemas web e consultoria, com quinze anos de infraestrutura de telecomunicações por trás."`) por duas linhas, inserindo `meta_title` antes:

```json
  "title": "Sites e sistemas sob medida.",
  "meta_title": "Alef Devops — Sites e Sistemas Web sob Medida",
  "meta_description": "Desenvolvimento de sites e sistemas web sob medida, com quinze anos de infraestrutura de telecomunicações por trás e integração Web3 quando o projeto pede.",
```

- [ ] **Step 2: Adicionar `meta_title` e atualizar `meta_description` no locale en**

Em `public/locales/en/common.json`, trocar a linha 3 (`"meta_description": "Alef Devops — smart contracts, web systems and consulting, backed by fifteen years of telecom infrastructure."`) por:

```json
  "title": "Custom websites and systems.",
  "meta_title": "Alef Devops — Custom Websites & Web Systems",
  "meta_description": "Custom website and web system development, backed by fifteen years of telecom infrastructure experience, with Web3 integration when the project calls for it.",
```

- [ ] **Step 3: Verificar que os dois arquivos continuam JSON válido e chave-por-chave em sincronia**

Run: `node -e "const a=require('./public/locales/pt/common.json'); const b=require('./public/locales/en/common.json'); const ka=Object.keys(a).sort(); const kb=Object.keys(b).sort(); console.log(JSON.stringify(ka)===JSON.stringify(kb) ? 'OK: chaves em sincronia' : 'DIVERGENTE'); "`
Expected: `OK: chaves em sincronia`

- [ ] **Step 4: Commit**

```bash
git add public/locales/pt/common.json public/locales/en/common.json
git commit -m "Add meta_title and revise meta_description to lead with Web2"
```

---

### Task 2: Rota de imagem OG (`/api/og`)

**Files:**
- Create: `src/pages/api/og.tsx`

**Interfaces:**
- Produces: endpoint `GET /api/og?locale=pt|en` retornando `image/png` 1200×630. Consumido na Task 3 como `og:image`/`twitter:image` via `https://www.alefdevops.com/api/og?locale=${locale}`.

- [ ] **Step 1: Criar a rota edge**

Criar `src/pages/api/og.tsx`:

```tsx
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const config = { runtime: "edge" };

const COPY = {
  pt: {
    brand: "Alef Devops",
    tagline: "Sites e Sistemas Web sob Medida",
  },
  en: {
    brand: "Alef Devops",
    tagline: "Custom Websites & Web Systems",
  },
} as const;

export default function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "pt";
  const { brand, tagline } = COPY[locale];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          backgroundColor: "#070b10",
          color: "#f4c542",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#22d3c5",
            marginBottom: 24,
          }}
        >
          {brand}
        </div>
        <div style={{ display: "flex", fontSize: 64, color: "#f4c542", maxWidth: 900 }}>
          {tagline}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build finishes (ignore the pre-existing `⨯ ESLint: Invalid Options` noise, see `CLAUDE.md`); no TypeScript compilation errors from `src/pages/api/og.tsx`.

- [ ] **Step 3: Verificar manualmente**

Run: `npm run dev`, then open `http://localhost:3000/api/og?locale=pt` and `http://localhost:3000/api/og?locale=en` in the browser.
Expected: each URL renders a 1200×630 dark image with the ink background, the "Alef Devops" label in aqua, and the tagline in yellow, matching its locale's copy.

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/og.tsx
git commit -m "Add dynamic OG image route via next/og"
```

---

### Task 3: `<Head>` de `index.tsx` — title, canonical, hreflang, OG/Twitter, JSON-LD

**Files:**
- Modify: `src/pages/index.tsx:1-54`

**Interfaces:**
- Consumes: `t("meta_title")`, `t("meta_description")` (Task 1); `/api/og?locale=` (Task 2); `useRouter().locale` (`"pt" | "en"`, from `next/router`).

- [ ] **Step 1: Importar `useRouter` e montar as URLs derivadas**

Em `src/pages/index.tsx`, adicionar o import e as constantes logo após `useIntroSequence()`:

```tsx
import { useRouter } from "next/router";
```

Dentro de `Home()`, após a linha `const intro = useIntroSequence();`:

```tsx
  const { locale } = useRouter();
  const isEn = locale === "en";
  const canonicalUrl = isEn
    ? "https://www.alefdevops.com/en"
    : "https://www.alefdevops.com/";
  const ogImageUrl = `https://www.alefdevops.com/api/og?locale=${isEn ? "en" : "pt"}`;
  const metaTitle = t("meta_title");
  const metaDescription = t("meta_description");
```

- [ ] **Step 2: Substituir o bloco `<Head>` atual**

Trocar (linhas 48-54 atuais):

```tsx
      <Head>
        <title>Alef Devops</title>
        <meta name="description" content={t("meta_description")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070b10" />
        <link rel="icon" href="/code-square.svg" />
      </Head>
```

por:

```tsx
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070b10" />
        <link rel="icon" href="/code-square.svg" />

        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="pt-BR" href="https://www.alefdevops.com/" />
        <link rel="alternate" hrefLang="en" href="https://www.alefdevops.com/en" />
        <link rel="alternate" hrefLang="x-default" href="https://www.alefdevops.com/" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:locale" content={isEn ? "en_US" : "pt_BR"} />
        <meta property="og:locale:alternate" content={isEn ? "pt_BR" : "en_US"} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Alef Devops",
              url: "https://www.alefdevops.com/",
              jobTitle: isEn
                ? "Custom website and web system developer"
                : "Desenvolvedor de sites e sistemas web sob medida",
              description: metaDescription,
              sameAs: [
                "https://www.linkedin.com/in/alefdevops/",
                "https://github.com/ABabayaga",
                "https://www.instagram.com/alef.lim4/",
              ],
              knowsAbout: ["Next.js", "TypeScript", "React", "Web3", "Smart Contracts"],
            }),
          }}
        />
      </Head>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build finishes with no TypeScript errors (same pre-existing ESLint noise as before is fine).

- [ ] **Step 4: Verificar manualmente nos dois locales**

Run: `npm run dev`, open `http://localhost:3000/` and `http://localhost:3000/en`, inspect `<head>` via devtools.
Expected: `<title>` matches the locale's `meta_title`; `rel="canonical"` points to that locale's URL; three `hreflang` `<link>` tags present; `og:*`/`twitter:*` tags present with the locale-correct `og:image` URL; the `application/ld+json` script parses as valid JSON (paste into `JSON.parse()` in the devtools console to confirm).

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.tsx
git commit -m "Add canonical, hreflang, Open Graph, Twitter Card and JSON-LD to the home Head"
```

---

### Task 4: `robots.txt` e `sitemap.xml`

**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`

**Interfaces:**
- None (static files, no code dependencies).

- [ ] **Step 1: Criar `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://www.alefdevops.com/sitemap.xml
```

- [ ] **Step 2: Criar `public/sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.alefdevops.com/</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://www.alefdevops.com/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.alefdevops.com/en"/>
  </url>
  <url>
    <loc>https://www.alefdevops.com/en</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://www.alefdevops.com/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.alefdevops.com/en"/>
  </url>
</urlset>
```

- [ ] **Step 3: Verificar manualmente**

Run: `npm run dev`, then open `http://localhost:3000/robots.txt` and `http://localhost:3000/sitemap.xml`.
Expected: both are served as-is (plain text / XML), matching the content above exactly.

- [ ] **Step 4: Commit**

```bash
git add public/robots.txt public/sitemap.xml
git commit -m "Add robots.txt and sitemap.xml"
```

---

## Self-Review Notes

- **Spec coverage:** title/description (Task 1) · OG/Twitter/canonical/hreflang (Task 3) · robots.txt/sitemap.xml (Task 4) · JSON-LD `Person` (Task 3) · imagem OG dinâmica via `next/og` (Task 2). Todos os itens do spec `2026-08-05-seo-boas-praticas-design.md` têm tarefa correspondente. Itens explicitamente fora de escopo (favicon extra, Search Console, seções desativadas) não geram tarefa, como o spec pede.
- **Placeholder scan:** nenhum "TBD"/"handle edge cases" — cada step tem o código ou o comando exato.
- **Type consistency:** `canonicalUrl`, `ogImageUrl`, `metaTitle`, `metaDescription` são definidos uma vez na Task 3 Step 1 e usados com os mesmos nomes no Step 2; `COPY`/`locale` na Task 2 usam os mesmos dois valores (`"pt" | "en"`) que `isEn` na Task 3.
