import { Html, Head, Main, NextScript } from "next/document";
import type { DocumentProps } from "next/document";

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
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
