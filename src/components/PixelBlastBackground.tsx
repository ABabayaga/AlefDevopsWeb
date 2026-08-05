import dynamic from "next/dynamic";

// ssr:false pelo mesmo motivo do PlanetScene: mantém o three fora do JS da
// primeira pintura e do HTML estático.
const PixelBlast = dynamic(() => import("@/components/PixelBlast"), { ssr: false });

/** Fundo decorativo fixo, atrás de todo o conteúdo da página. pointer-events-none
 *  pra nunca competir com cliques em nav/CTA/modal — é textura, não interação.
 *  Cor próxima de `raised`/`line` e opacidade baixa: o padrão precisa ler como
 *  ruído ambiente atrás do texto e do planeta, não como uma camada disputando
 *  atenção com eles. */
const PixelBlastBackground: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-60">
    <PixelBlast
      color="#1c2733"
      variant="square"
      pixelSize={4}
      patternScale={3}
      patternDensity={0.35}
      speed={0.35}
      edgeFade={0.1}
      enableRipples={false}
      transparent
    />
  </div>
);

export default PixelBlastBackground;
