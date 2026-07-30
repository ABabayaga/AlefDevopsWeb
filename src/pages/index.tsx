import Head from "next/head";
import { Analytics } from "@vercel/analytics/next";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import { getI18nStaticProps } from "@/lib/getI18nStaticProps";

// A home é só o hero. ServicesSection, AboutSection, ContactSection e
// SkillsSection continuam em src/components/sections, sem serem renderizadas;
// o blog está em src/pages-disabled, fora do roteamento do Next. Ao religar
// qualquer um deles, devolver também o item de menu correspondente no Header.

export default function Home() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>Alef Devops</title>
        <meta name="description" content={t("meta_description")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070b10" />
        <link rel="icon" href="/code-square.svg" />
      </Head>

      <Header />

      <main id="main">
        <Hero />
      </main>

      <Footer />
      <Analytics />
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) =>
  getI18nStaticProps(locale as string);
