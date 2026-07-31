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
