import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";

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

function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${archivo.variable} ${plexMono.variable} font-sans`}>
      <Component {...pageProps} />
      <MusicToggle />
    </div>
  );
}

export default appWithTranslation(App);
