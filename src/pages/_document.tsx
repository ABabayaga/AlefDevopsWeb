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
        {/* Esconde os [data-reveal] de /sobre antes da primeira pintura, para o
            GSAP animar a entrada sem o conteúdo piscar (ver useGsapReveal).
            A classe sai sozinha em 4s: se o bundle falhar, o texto não fica
            preso invisível. Quando o GSAP já assumiu, ele segura a opacidade
            inline e a saída da classe não muda nada. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js-reveal");setTimeout(function(){document.documentElement.classList.remove("js-reveal")},4000);`,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
