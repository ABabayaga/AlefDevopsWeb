/**
 * Todos os projetos de /trabalhos, na ordem em que aparecem. Os destaques
 * seguem a mesma ordem entre si: o primeiro `featured` é o card grande.
 *
 * Título e descrição não moram aqui: o site é traduzido, então ficam em
 * `trabalhos_projects.<slug>.{title,desc}` nos três common.json. O que é
 * igual em qualquer idioma — tecnologias, imagem, link — fica neste arquivo,
 * e é por isso que `tech` é array aqui e não string nos locales.
 */

export type ProjectCategory = "site" | "app" | "sistema";

export interface Project {
  /** Também é a chave em trabalhos_projects.<slug>. */
  slug: string;
  category: ProjectCategory;
  tech: string[];
  /** Caminho em /public/trabalhos/. Prints de site: 1440x900 em 2x. */
  image: string;
  /** "contain" para prints de celular, que são mais altos que largos e
   * perderiam a tela inteira num corte 16:10. */
  imageFit?: "cover" | "contain";
  url?: string;
  /** Sobe para a faixa de destaques no topo de /trabalhos e sai da grade. */
  featured?: boolean;
  /** Ano de entrega, mostrado na etiqueta do card ao lado do tipo. */
  year?: number;
}

/** Marcador de stack ainda não confirmada. O card nunca mostra este valor:
 * um projeto só com ele aparece sem tags. */
export const TECH_PLACEHOLDER = "[CONFIRMAR]";

const REACT_SITE = ["React", "Vite", "Tailwind"];

export const projects: Project[] = [
  {
    slug: "game-truck",
    category: "site",
    featured: true,
    tech: REACT_SITE,
    image: "/trabalhos/gametruck.app.png",
    url: "https://www.gametruck.app/",
  },
  {
    slug: "game-truck-calculadora",
    category: "site",
    tech: REACT_SITE,
    image: "/trabalhos/gametruck-calc.png",
    url: "https://calculadora.gametruck.app/",
  },
  {
    slug: "transmano",
    category: "site",
    tech: REACT_SITE,
    image: "/trabalhos/transmano.png",
    url: "https://site-transmano-red.vercel.app/",
  },
  {
    slug: "avante",
    category: "site",
    tech: REACT_SITE,
    image: "/trabalhos/avante.png",
    url: "https://www.avanteglobalseguros.com.br/",
  },
  {
    slug: "br7",
    category: "site",
    tech: REACT_SITE,
    image: "/trabalhos/br7.png",
    url: "https://www.agenciabr7.com.br/",
  },
  {
    slug: "upper-gr",
    category: "site",
    tech: REACT_SITE,
    image: "/trabalhos/upper-gr.png",
    url: "https://www.grupouppergr.com.br/",
  },
  {
    slug: "motora-match",
    category: "site",
    tech: ["Vite", "Tailwind", "TypeScript"],
    image: "/trabalhos/mm.png",
  },
  {
    slug: "galeria-sandra-novas",
    category: "site",
    tech: ["React", "Vite", "Tailwind", "TypeScript"],
    image: "/trabalhos/gsn.png",
  },
  {
    slug: "repense-track",
    category: "app",
    featured: true,
    tech: ["Flutter", "NestJS", "MongoDB", "Redis"],
    image: "/trabalhos/rt2.png",
    imageFit: "contain",
  },
  {
    slug: "rpa-facil-contabil",
    category: "sistema",
    tech: ["NestJS", "MongoDB", "Vite", "TypeScript", "Tailwind", "Docker"],
    image: "/trabalhos/rpa.png",
  },
  {
    slug: "upper-quiz",
    category: "sistema",
    tech: ["React", "Vite", "Tailwind", "TypeScript", "Supabase"],
    image: "/trabalhos/upper-quiz.png",
    url: "https://upper-quiz.vercel.app/",
  },
  {
    // Sistema da BR7, separado do site da agência (slug "br7"). Sem url: a
    // entrada é uma tela de login.
    slug: "br7-sistema",
    category: "sistema",
    featured: true,
    tech: ["NestJS", "MongoDB", "React", "Vite", "Tailwind"],
    image: "/trabalhos/sistemabr7.png",
  },
];
