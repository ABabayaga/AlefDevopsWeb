import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import { getI18nStaticProps } from "@/lib/getI18nStaticProps";

const posts = [
  {
    href: "/blog/pagehashfile",
    cover: "/pagehashfile.jpg",
    titleKey: "blogtitle",
  },
] as const;

const Blog = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`${t("blog")} · Alef Devops`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070b10" />
        <link rel="icon" href="/code-square.svg" />
      </Head>

      <Header />

      <main id="main" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <SectionHeader label={t("blog")} title={t("blog_header")} />

        <ul className="m-0 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.href}>
              <Link href={post.href} className="group block no-underline">
                <div className="overflow-hidden rounded-sm border border-line transition-colors group-hover:border-om3/50">
                  <Image
                    src={post.cover}
                    alt=""
                    width={640}
                    height={400}
                    className="h-auto w-full opacity-85 transition-opacity group-hover:opacity-100"
                  />
                </div>
                <h2 className="mt-5 mb-0 text-[1.0625rem] font-semibold leading-snug text-fg">
                  {t(post.titleKey)}
                </h2>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </>
  );
};

export default Blog;

export const getStaticProps: GetStaticProps = async ({ locale }) =>
  getI18nStaticProps(locale as string);
