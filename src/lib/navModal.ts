export type NavModalKey = "trabalhos" | "sobre";

/** Chave de locale do título mostrado no modal — a mesma que a página cheia
 *  correspondente usa, pra não duplicar o texto em dois lugares. */
export const NAV_MODAL_TITLE_KEY: Record<NavModalKey, string> = {
  trabalhos: "trabalhos_header",
  sobre: "sobre_header",
};
