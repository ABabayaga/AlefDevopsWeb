import Head from "next/head";
import { Analytics } from "@vercel/analytics/next";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";

import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Intro from "@/components/Intro";
import { useIntroSequence } from "@/hooks/useIntroSequence";
import { getI18nStaticProps } from "@/lib/getI18nStaticProps";

// A home é só o hero. ServicesSection, AboutSection, ContactSection e
// SkillsSection continuam em src/components/sections, sem serem renderizadas;
// o Footer segue em src/components/Footer.tsx, também sem ser renderizado aqui;
// o blog está em src/pages-disabled, fora do roteamento do Next. Ao religar
// qualquer um deles, devolver também o item de menu correspondente no Header.

export default function Home() {
  const { t } = useTranslation("common");
  // Fonte única da sequência intro→logo→hero: Header e Hero recebem a mesma
  // `phase` pra saber quando assumir o logo compartilhado e revelar o
  // conteúdo, sem cada um reimplementar a leitura de matchMedia/sessionStorage.
  const intro = useIntroSequence();

  return (
    <>
      <Head>
        <title>Alef Devops</title>
        <meta name="description" content={t("meta_description")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070b10" />
        <link rel="icon" href="/code-square.svg" />
      </Head>

      {/* Antes do Header de propósito: a cortina é fixed e cobre tudo, mas
          renderizar cedo deixa claro que ela é a primeira coisa da página. */}
      <Intro phase={intro.phase} percent={intro.percent} stage={intro.stage} />

      <Header introPhase={intro.phase} />

      <main id="main">
        <Hero introPhase={intro.phase} />
      </main>

      <Analytics />
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) =>
  getI18nStaticProps(locale as string);
