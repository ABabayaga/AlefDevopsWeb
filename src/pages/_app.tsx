import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { Archivo, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import MusicToggle from "@/components/MusicToggle";

// Archivo é variável nos eixos de peso e largura. O eixo wdth é o que dá aos
// títulos a largura de placa de sinalização técnica (.type-display usa 125%).
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Mono para rótulos, medidas e dados — o vocabulário de quem lê Zabbix.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

// Serifada condensada só para a segunda linha da headline do hero (.type-hero-serif):
// o contraste com a Archivo estreita é o desenho do título. Um peso só, 400.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

function App({ Component, pageProps }: AppProps) {
  return (
    <div
      className={`${archivo.variable} ${plexMono.variable} ${instrumentSerif.variable} font-sans`}
    >
      <Component {...pageProps} />
      <MusicToggle />
      {/* Aqui e não no index: assim /sobre e /trabalhos também contam visitas. */}
      <Analytics />
    </div>
  );
}

export default appWithTranslation(App);
