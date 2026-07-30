import { Html, Head, Main, NextScript } from "next/document";
import type { DocumentProps } from "next/document";

export default function Document(props: DocumentProps) {
  // Acompanha o locale ativo em vez de fixar "en", senão leitores de tela
  // pronunciam o português com fonética inglesa.
  const locale = props.__NEXT_DATA__.locale ?? "pt";

  return (
    <Html lang={locale}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
