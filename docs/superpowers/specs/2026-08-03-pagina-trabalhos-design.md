# Página Trabalhos: vitrine de projetos

Data: 2026-08-03

## Problema

`src/pages/trabalhos.tsx` existe como fallback de navegação (o link do menu sempre aponta
pra cá, mesmo quando a home abre o mesmo conteúdo num modal), mas hoje só renderiza um
`SectionHeader` com o texto placeholder "Em construção." Quatro capturas de tela já estão
em `public/trabalhos/` (`mm.png`, `gsn.png`, `rt2.png`, `rpa.png`) esperando para virar
conteúdo real: dois sites, um app e um sistema.

## Decisões

| Decisão | Escolha |
|---|---|
| Conteúdo por card | Imagem + título + descrição curta + linha de stack |
| Link externo | Nenhum projeto tem URL ainda; cards não são clicáveis |
| Agrupamento | Três subseções empilhadas — Sites, Apps, Sistemas — não um grid único com tags |
| Aspect ratio das imagens | Sites/Sistemas em `aspect-video` (prints ~16:9); Apps num frame vertical mais estreito, sem cortar a tela do celular |

## Arquitetura

### `src/components/ProjectCard.tsx` (novo)

Mesmo espírito de `AreaCard`: componente de conteúdo puro, data-driven via chave de locale,
sem dono do grid externo. Diferente de `AreaCard`, é dono do próprio frame de imagem (não
um fragmento nu), porque a imagem é parte do card, não um bloco de texto reaproveitado em
dois layouts.

```ts
interface ProjectCardProps {
  projectKey: string;     // "mm" | "gsn" | "rt2" | "rpa" — chave em t(`projects.${key}.*`)
  image: string;          // "/trabalhos/mm.png"
  width: number;
  height: number;
  orientation?: "landscape" | "portrait"; // default "landscape"
}
```

Marcação: `<div className="border border-line bg-raised rounded-sm overflow-hidden">`
contendo:

1. Frame de imagem — `relative aspect-video` (landscape) ou `relative aspect-[9/19]`
   (portrait), com `<Image fill className="object-cover" />` no landscape e
   `object-contain` no portrait (pra não cortar a tela do app, que é bem mais alta que
   larga — 1290×2678px, contra ~2880×1630 dos prints de site)
2. Bloco de texto com padding — título (`type-display`, mesmo tamanho do `AreaCard`),
   descrição (`text-fg-muted`) e stack em mono (clone do padrão `.stack` do `AreaCard`,
   `·` como separador, `aria-hidden` no separador)

### `src/pages/trabalhos.tsx` (editado)

Array local, mesmo padrão de `areas` em `ExpertiseAreas`:

```ts
const projects = [
  { key: "mm", category: "sites", image: "/trabalhos/mm.png", width: 2880, height: 1626 },
  { key: "gsn", category: "sites", image: "/trabalhos/gsn.png", width: 2880, height: 1626 },
  { key: "rt2", category: "apps", image: "/trabalhos/rt2.png", width: 1290, height: 2678, orientation: "portrait" },
  { key: "rpa", category: "sistemas", image: "/trabalhos/rpa.png", width: 2880, height: 1638 },
] as const;

const categories = [
  { id: "sites", labelKey: "trabalhos_sites_label" },
  { id: "apps", labelKey: "trabalhos_apps_label" },
  { id: "sistemas", labelKey: "trabalhos_sistemas_label" },
] as const;
```

Abaixo do `SectionHeader` existente ("Trabalhos" / `trabalhos_header`), uma subseção por
categoria: rótulo mono (`type-label text-os2`) + filete `h-px flex-1 bg-line` (o mesmo par
label+régua que `SectionHeader` já usa internamente, só que sem o `<h2>` grande — três
títulos de nível de seção na mesma página competiriam com o principal), seguido de um grid
(`grid gap-6 sm:grid-cols-2`) com os `ProjectCard` daquela categoria. Sites preenche as duas
colunas; Apps e Sistemas têm um item só, então o grid cai pra uma coluna sozinho.

## Copy

### Página

| Chave | PT | EN |
|---|---|---|
| `trabalhos_header` | Sites, apps e sistemas em produção. | Websites, apps and systems in production. |
| `trabalhos_sites_label` | Sites | Websites |
| `trabalhos_apps_label` | Apps | Apps |
| `trabalhos_sistemas_label` | Sistemas | Systems |

### Projetos

| Chave | PT | EN |
|---|---|---|
| `projects.mm.title` | Motora Match | Motora Match |
| `projects.mm.desc` | Plataforma que conecta motoristas profissionais e transportadoras de forma inteligente, segura e eficiente. Encontre fretes, construa seu perfil profissional e faça parte de uma comunidade exclusiva. | A platform that connects professional drivers and freight carriers intelligently, safely and efficiently. Find loads, build your professional profile and join an exclusive community. |
| `projects.mm.stack` | Vite · Tailwind · TypeScript | Vite · Tailwind · TypeScript |
| `projects.gsn.title` | Galeria Sandra Novas | Sandra Novas Gallery |
| `projects.gsn.desc` | Site da galeria de artes Sandra Novas. | Website for the Sandra Novas art gallery. |
| `projects.gsn.stack` | React · Vite · Tailwind · TypeScript | React · Vite · Tailwind · TypeScript |
| `projects.rt2.title` | RepenseTrack | RepenseTrack |
| `projects.rt2.desc` | Conecta motoristas, transportadoras e centros de operação em um aplicativo completo para gestão da jornada, comunicação em tempo real e controle das entregas. | Connects drivers, carriers and operations centers in one complete app for trip management, real-time communication and delivery tracking. |
| `projects.rt2.stack` | Flutter · NestJS · MongoDB · Redis | Flutter · NestJS · MongoDB · Redis |
| `projects.rpa.title` | RPA Fácil Contábil | RPA Fácil Contábil |
| `projects.rpa.desc` | Sistema para envio de documentos automáticos via WhatsApp. | System for automated document delivery via WhatsApp. |
| `projects.rpa.stack` | NestJS · MongoDB · Vite · TypeScript · Tailwind · Docker | NestJS · MongoDB · Vite · TypeScript · Tailwind · Docker |

## Acessibilidade

- Nenhum `<h1>`/`<h2>` novo compete com o `SectionHeader` principal — os rótulos de
  categoria são `<span>` mono, não headings
- Separador `·` da stack leva `aria-hidden`, como no `AreaCard`
- `alt` de cada imagem vem do título do projeto (`t(\`projects.${key}.title\`)`), não de uma
  chave genérica

## Verificação

Não há test runner no projeto. Verificar é:

1. `npm run build` passa
2. `npm run dev`, abrir `/trabalhos` em desktop e em ~375px — conferir que o card de app
   (retrato) não estica nem corta a tela do celular, e que os cards de site mantêm o print
   legível em `object-cover`
3. Trocar de idioma pelo `LanguageSwitcher` e confirmar as duas versões das chaves novas
4. `git add public/trabalhos/*.png` — os quatro arquivos estão untracked hoje
