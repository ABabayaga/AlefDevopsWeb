import Head from "next/head";
import Link from "next/link";
import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getI18nStaticProps } from "@/lib/getI18nStaticProps";

// O artigo em si é escrito em português e fica fora do i18n — um post é redigido
// numa língua, não traduzido chave por chave. A navegação em volta dele traduz.
const title = "Por que gerar o hash de um arquivo e salvá-lo na blockchain?";

const body = [
  'A principal finalidade de gerar o hash de um arquivo e armazená-lo na blockchain é garantir que o arquivo não sofreu alterações. A explicação é simples: um hash é como a "identidade digital" do arquivo. Ele é gerado a partir do conteúdo do arquivo e qualquer mínima modificação, como a adição de um espaço em branco, altera completamente essa sequência única de números e letras, resultando em um novo hash.',
  "Por exemplo, imagine que você assinou um contrato de venda e deseja garantir que o arquivo não seja alterado de má-fé. A solução seria gerar o hash do arquivo e armazená-lo na blockchain. Mas por que usar a blockchain? Porque uma vez que o hash é salvo na blockchain, ele se torna imutável — ninguém pode alterá-lo ou excluí-lo. Isso oferece uma garantia contra fraudes, pois a integridade do arquivo pode ser verificada por qualquer pessoa a partir do hash armazenado.",
  "Além disso, a blockchain é pública e transparente, o que permite que qualquer pessoa possa acessar e verificar o hash, garantindo ainda mais segurança e confiança no processo.",
];

const Pagehashfile = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`${title} · Alef Devops`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070b10" />
        <link rel="icon" href="/code-square.svg" />
      </Head>

      <Header />

      <main id="main" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <article>
          <div className="flex items-center gap-4">
            <span className="type-label text-os2">{t("blog")}</span>
            <span aria-hidden className="h-px flex-1 bg-line" />
          </div>

          <h1 className="type-display type-section measure mt-7 mb-10 text-fg">{title}</h1>

          <div className="measure flex flex-col gap-6">
            {body.map((paragraph, i) => (
              <p key={i} className="m-0 text-fg-muted">
                {paragraph}
              </p>
            ))}
          </div>

          <Link
            href="/blog"
            className="type-label mt-14 inline-flex items-center gap-2 text-fg-muted no-underline transition-colors hover:text-fg"
          >
            <span aria-hidden>←</span>
            {t("blog_back")}
          </Link>
        </article>
      </main>

      <Footer />
    </>
  );
};

export default Pagehashfile;

export const getStaticProps: GetStaticProps = async ({ locale }) =>
  getI18nStaticProps(locale as string);
