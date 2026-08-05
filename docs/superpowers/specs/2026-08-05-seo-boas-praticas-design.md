# SEO: boas práticas para ser encontrado no Google

Data: 2026-08-05

## Problema

O site não tem nenhuma camada de SEO além de um `<title>` fixo ("Alef Devops", não
localizado) e uma `meta_description` já traduzida. Falta tudo que ajuda o Google a indexar,
rankear e mostrar a página corretamente: Open Graph/Twitter Card (preview ao compartilhar o
link), `canonical`/`hreflang` (o site é bilíngue pt/en e hoje as duas versões concorrem entre
si sem sinalização), `robots.txt`, `sitemap.xml` e dados estruturados (JSON-LD).

## Decisões

| Decisão | Escolha |
|---|---|
| Foco de busca | "Serviço + termo técnico" (quem ainda não conhece o Alef, procurando por especialidade) |
| Área priorizada no title/description | Web2 (sites e sistemas sob medida) — Web3/infra como diferencial secundário, mesma hierarquia que `ExpertiseAreas` já usa |
| Domínio canônico | `https://www.alefdevops.com` |
| Imagem OG | Gerada dinamicamente via `next/og` (`ImageResponse`), não um arquivo estático desenhado à mão |
| Sitemap | Escrito à mão em `public/sitemap.xml` — só 2 URLs (`/` e `/en`), não justifica a dependência `next-sitemap` |
| Dados estruturados | Schema `Person` (marca pessoal, não `Organization`) |
| Ícones/manifest (apple-touch-icon etc.) | Fora de escopo — baixo impacto em SEO puro |

## Copy (novas chaves de locale)

Adiciona `meta_title` em `public/locales/{pt,en}/common.json`, ao lado da `meta_description`
existente (que também é reescrita para liderar com Web2):

| Chave | pt | en |
|---|---|---|
| `meta_title` | `Alef Devops — Sites e Sistemas Web sob Medida` | `Alef Devops — Custom Websites & Web Systems` |
| `meta_description` | `Desenvolvimento de sites e sistemas web sob medida, com quinze anos de infraestrutura de telecomunicações por trás e integração Web3 quando o projeto pede.` | `Custom website and web system development, backed by fifteen years of telecom infrastructure experience, with Web3 integration when the project calls for it.` |

## Arquitetura

### `src/pages/index.tsx` — `<Head>` reescrito

Troca o `<title>` fixo e a `meta_description` isolada por um bloco completo, usando
`t("meta_title")`/`t("meta_description")` e o `locale` do router (já disponível via
`next-i18next`/`next/router`):

- `<title>{t("meta_title")}</title>`
- `<meta name="description" content={t("meta_description")} />` (mantém)
- `<link rel="canonical" href={canonicalUrl} />` — `canonicalUrl` é
  `https://www.alefdevops.com/` para `pt` (locale padrão, sem prefixo) e
  `https://www.alefdevops.com/en` para `en`
- `<link rel="alternate" hrefLang="pt-BR" href="https://www.alefdevops.com/" />`
- `<link rel="alternate" hrefLang="en" href="https://www.alefdevops.com/en" />`
- `<link rel="alternate" hrefLang="x-default" href="https://www.alefdevops.com/" />`
- `og:type="website"`, `og:title`, `og:description`, `og:url={canonicalUrl}`,
  `og:image={ogImageUrl}`, `og:locale` (`pt_BR`/`en_US`), `og:locale:alternate` (o outro)
- `twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`,
  `twitter:image={ogImageUrl}`
- `<script type="application/ld+json">` com o objeto `Person` (ver seção JSON-LD)

`ogImageUrl` é `https://www.alefdevops.com/api/og?locale=${locale}`.

### `src/pages/api/og.tsx` (novo)

Rota edge usando `ImageResponse` de `next/og` (embutido no Next 14, sem dependência nova):

```ts
export const config = { runtime: "edge" };

export default function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "pt";
  const title =
    locale === "en"
      ? "Custom Websites & Web Systems"
      : "Sites e Sistemas Web sob Medida";

  return new ImageResponse(
    (
      <div style={{ /* fundo ink (#070b10), texto os2 (#f4c542), wordmark mono */ }}>
        <span>Alef Devops</span>
        <span>{title}</span>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

Reaproveita as cores `ink`/`os2`/`om3` do `@theme` como valores inline (a rota edge não tem
acesso ao CSS do Tailwind), já que o texto precisa ser hardcoded em JSX — o handler não
importa `next-i18next`.

### JSON-LD (`Person`)

Objeto embutido em `index.tsx`, montado a partir do `locale` atual:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Alef Devops",
  "url": "https://www.alefdevops.com/",
  "jobTitle": "Desenvolvedor de sites e sistemas web sob medida",
  "description": "<meta_description do locale ativo>",
  "sameAs": [
    "https://www.linkedin.com/in/alefdevops/",
    "https://github.com/ABabayaga",
    "https://www.instagram.com/alef.lim4/"
  ],
  "knowsAbout": ["Next.js", "TypeScript", "React", "Web3", "Smart Contracts"]
}
```

Os três links de `sameAs` são os mesmos já usados em `Header.tsx` (`socialLinks`) — não
inventa nenhuma URL nova.

### `public/robots.txt` (novo)

```
User-agent: *
Allow: /

Sitemap: https://www.alefdevops.com/sitemap.xml
```

### `public/sitemap.xml` (novo)

Duas entradas (`/` e `/en`), cada uma com `xhtml:link` apontando para a alternativa de
idioma — mesmo papel do `hreflang` do HTML, sinalizado também no sitemap:

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

Escrito à mão porque só existem essas duas URLs; se novas rotas voltarem a existir
(`/trabalhos`, `/sobre`, o blog em `src/pages-disabled/`), o arquivo é atualizado manualmente
— não há geração automática.

## Fora de escopo

- Favicon adicional / `apple-touch-icon` / `site.webmanifest` — baixo impacto em SEO puro,
  não foi pedido.
- Google Search Console / submissão manual do sitemap — ação fora do repositório, cabe ao
  usuário depois do deploy.
- Reescrever `AboutSection`/`ServicesSection`/`ContactSection` (código morto, ver
  `CLAUDE.md`) — não afeta a página que de fato é servida.

## Teste

Sem test runner no projeto (ver `CLAUDE.md`). Verificação:

- `npm run build` precisa passar (checa a rota edge nova e os tipos do JSON-LD).
- `npm run dev`, abrir `/` e `/en`, inspecionar `<head>` via devtools: `title`, `canonical`,
  `hreflang`, `og:*`, `twitter:*`, `<script type="application/ld+json">`.
- Abrir `/api/og?locale=pt` e `/api/og?locale=en` direto no navegador — devem renderizar a
  imagem 1200×630.
- Abrir `/robots.txt` e `/sitemap.xml` direto — devem servir como estático.
- Validar o JSON-LD colando o `<script>` no
  [Rich Results Test](https://search.google.com/test/rich-results) do Google (fora do
  repositório, mas vale citar como passo manual).
