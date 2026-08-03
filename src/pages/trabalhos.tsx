import Head from "next/head";
import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "@/components/ProjectCard";
import { getI18nStaticProps } from "@/lib/getI18nStaticProps";

const projects = [
  { key: "mm", category: "sites", image: "/trabalhos/mm.png", orientation: "landscape" },
  { key: "gsn", category: "sites", image: "/trabalhos/gsn.png", orientation: "landscape" },
  { key: "rt2", category: "apps", image: "/trabalhos/rt2.png", orientation: "portrait" },
  { key: "rpa", category: "sistemas", image: "/trabalhos/rpa.png", orientation: "landscape" },
] as const;

const categories = [
  { id: "sites", labelKey: "trabalhos_sites_label" },
  { id: "apps", labelKey: "trabalhos_apps_label" },
  { id: "sistemas", labelKey: "trabalhos_sistemas_label" },
] as const;

/**
 * Fallback fora da home: na home o nav abre isso em modal (ver NavRootModal),
 * mas o link em si sempre aponta pra cá, então funciona sem JS e a partir de
 * qualquer outra página.
 */
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

        <div className="flex flex-col gap-16 lg:gap-20">
          {categories.map((category) => (
            <section key={category.id}>
              <div className="flex items-center gap-4">
                <span className="type-label text-os2">{t(category.labelKey)}</span>
                <span aria-hidden className="h-px flex-1 bg-line" />
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {projects
                  .filter((project) => project.category === category.id)
                  .map((project) => (
                    <ProjectCard
                      key={project.key}
                      projectKey={project.key}
                      image={project.image}
                      orientation={project.orientation}
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Trabalhos;

export const getStaticProps: GetStaticProps = async ({ locale }) =>
  getI18nStaticProps(locale as string);
