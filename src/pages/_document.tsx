import { Html, Head, Main, NextScript } from "next/document";
import type { DocumentProps } from "next/document";

/**
 * Roda antes da primeira pintura. A cortina de carregamento é renderizada pelo
 * servidor de propósito — se ela só existisse depois da montagem, quem chega
 * veria o hero por um instante antes de ser coberto. Em compensação, quem NÃO
 * deve vê-la precisa que ela suma antes de qualquer quadro, e isso o React não
 * consegue fazer a tempo: as duas condições (sessionStorage e matchMedia) só
 * existem no cliente.
 *
 * Daí este script: marca o <html> e o CSS esconde a cortina pelo atributo. O
 * React chega depois só para desmontar.
 *
 * Sem aspas duplas nem quebras de linha — vai inteiro dentro de um atributo.
 */
const INTRO_FLASH_GUARD = `try{if(sessionStorage.getItem('intro-seen')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-intro','seen')}}catch(e){}`;

export default function Document(props: DocumentProps) {
  // Acompanha o locale ativo em vez de fixar "en", senão leitores de tela
  // pronunciam o português com fonética inglesa.
  const locale = props.__NEXT_DATA__.locale ?? "pt";

  return (
    <Html lang={locale}>
      <Head>
        {/* Sem JS a cortina nunca seria removida e o site ficaria inacessível
            atrás de um overlay. */}
        <noscript>
          <style>{`[data-intro-curtain]{display:none!important}`}</style>
        </noscript>
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: INTRO_FLASH_GUARD }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
