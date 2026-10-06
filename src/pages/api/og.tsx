import { ImageResponse } from "next/og";

export const config = { runtime: "edge" };

const WIDTH = 1200;
const HEIGHT = 630;

// Mesmos tokens do @theme em globals.css — o Satori não lê CSS, então os
// valores precisam estar aqui em cru.
const INK = "#02001a";
const FG = "#f0f5fb";
const OM3 = "#22d3c5";

const WORDMARK = "Alef Devops";

/**
 * Archivo em wdth 125 / peso 700, o mesmo corte do `.type-display` do site.
 * O Satori não lida com fonte variável nem woff2; com `text=` o Google devolve
 * um TTF estático já fatiado só com os glifos do wordmark, alguns KB.
 */
async function loadArchivo(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,700&text=${encodeURIComponent(WORDMARK)}`
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    // Sem a fonte o card ainda sai, só com a sans padrão do Satori — melhor
    // que um preview quebrado no WhatsApp.
    return null;
  }
}

/**
 * Grade de pixels esparsa ecoando o PixelBlastBackground da home. Hash
 * determinístico em vez de Math.random: a imagem fica cacheada na CDN e nos
 * apps de mensagem, e cada geração sair diferente só confundiria.
 */
function pixelField() {
  const STEP = 30;
  const SIZE = 10;
  const cells: { x: number; y: number; o: number }[] = [];
  for (let y = 0; y < HEIGHT; y += STEP) {
    for (let x = 0; x < WIDTH; x += STEP) {
      const h = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      // Mais denso nas bordas, quase vazio no centro, para não brigar com o logo.
      const dx = (x - WIDTH / 2) / (WIDTH / 2);
      const dy = (y - HEIGHT / 2) / (HEIGHT / 2);
      const edge = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      if (h > edge * 0.75) continue;
      cells.push({ x, y, o: 0.06 + h * 0.18 });
    }
  }
  return cells.map(({ x, y, o }) => (
    <div
      key={`${x}-${y}`}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: SIZE,
        height: SIZE,
        backgroundColor: OM3,
        opacity: o,
      }}
    />
  ));
}

// O card é o lockup do BrandLogo e nada mais: título e descrição já vêm das
// meta tags em todo preview, então repetir texto aqui só duplicava a mensagem.
// Por isso também não depende mais de `?locale` — o parâmetro que o index.tsx
// manda é simplesmente ignorado.
export default async function handler() {
  const archivo = await loadArchivo();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundColor: INK,
        }}
      >
        {pixelField()}
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 168,
              height: 168,
              borderRadius: 28,
              backgroundColor: FG,
            }}
          >
            {/* public/code-square.svg inline, com o fill explícito: no chip
                claro o glifo precisa ser da cor do fundo da página. */}
            <svg width="100" height="100" viewBox="0 0 16 16" fill={INK}>
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
              <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0m2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0" />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 116,
              fontWeight: 700,
              letterSpacing: -2,
              color: FG,
              fontFamily: archivo ? "Archivo" : "sans-serif",
            }}
          >
            {WORDMARK}
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: archivo ? [{ name: "Archivo", data: archivo, weight: 700, style: "normal" }] : undefined,
    }
  );
}
