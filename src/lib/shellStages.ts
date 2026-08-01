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

/**
 * No topo da página (progress 0) o globo nasce deslocado à direita, com a
 * frase ocupando a coluna esquerda; ao rolar, ele desliza até o centro. A
 * janela desse deslizamento tem que fechar antes de `LAYERS[0].from` (0.1),
 * senão a primeira raiz começa a crescer com o globo ainda fora do centro.
 */
export const INTRO_SHIFT_END = 0.08;

/** Deslocamento inicial do globo, em vw, no progress 0. */
export const GLOBE_INTRO_OFFSET_VW = 18;

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
