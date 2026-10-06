import Head from "next/head";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Intro from "@/components/Intro";
import PixelBlastBackground from "@/components/PixelBlastBackground";
import { useIntroSequence } from "@/hooks/useIntroSequence";
import { getI18nStaticProps } from "@/lib/getI18nStaticProps";
import { buildJsonLd } from "@/lib/jsonLd";
import { SITE_LOCALES, toSiteLocale } from "@/lib/siteLocales";

// A home é só o hero. ServicesSection, AboutSection, ContactSection e
// SkillsSection continuam em src/components/sections, sem serem renderizadas;
// o Footer segue em src/components/Footer.tsx, também sem ser renderizado aqui;
// o blog está em src/pages-disabled, fora do roteamento do Next. Ao religar
// qualquer um deles, devolver também o item de menu correspondente no Header.

export default function Home() {
  const { t } = useTranslation("common");
  // Fonte única da sequência intro→logo→hero: Header e Hero recebem a mesma
  // `phase` pra saber quando assumir o logo compartilhado e revelar o
  // conteúdo, sem cada um reimplementar a leitura de matchMedia nem os tempos.
  const intro = useIntroSequence();

  const { locale: rawLocale } = useRouter();
  const locale = toSiteLocale(rawLocale);
  const { url: canonicalUrl, og: ogLocale } = SITE_LOCALES[locale];
  const ogImageUrl = `https://www.alefdevops.com/api/og?locale=${locale}`;
  const metaTitle = t("meta_title");
  const metaDescription = t("meta_description");

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070b10" />
        <link rel="icon" href="/code-square.svg" />

        <link rel="canonical" href={canonicalUrl} />
        {Object.values(SITE_LOCALES).map(({ hrefLang, url }) => (
          <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={url} />
        ))}
        <link rel="alternate" hrefLang="x-default" href="https://www.alefdevops.com/" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:locale" content={ogLocale} />
        {Object.values(SITE_LOCALES)
          .filter((l) => l.og !== ogLocale)
          .map(({ og }) => (
            <meta key={og} property="og:locale:alternate" content={og} />
          ))}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildJsonLd({ locale, canonicalUrl, metaTitle, metaDescription, t })
            ),
          }}
        />
      </Head>

      <PixelBlastBackground />

      {/* Antes do Header de propósito: a cortina é fixed e cobre tudo, mas
          renderizar cedo deixa claro que ela é a primeira coisa da página. */}
      <Intro phase={intro.phase} percent={intro.percent} stage={intro.stage} />

      <Header introPhase={intro.phase} contentRevealed={intro.contentRevealed} />

      <main id="main">
        <Hero contentRevealed={intro.contentRevealed} />
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) =>
  getI18nStaticProps(locale as string);
