import Head from "next/head";
import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import TrabalhosContent from "@/components/TrabalhosContent";
import { getI18nStaticProps } from "@/lib/getI18nStaticProps";

const Trabalhos = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`${t("nav_trabalhos")} · Alef Devops`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070b10" />
        <link rel="icon" href="/code-square.svg" />
      </Head>

      <Header />

      <main id="main" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <SectionHeader label={t("nav_trabalhos")} title={t("trabalhos_header")} />
        <TrabalhosContent />
      </main>

      <Footer />
    </>
  );
};

export default Trabalhos;

export const getStaticProps: GetStaticProps = async ({ locale }) =>
  getI18nStaticProps(locale as string);
