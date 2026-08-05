import Head from "next/head";
import { Analytics } from "@vercel/analytics/next";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { useCallback, useState } from "react";

import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Intro from "@/components/Intro";
import NavRootModal from "@/components/NavRootModal";
import PixelBlastBackground from "@/components/PixelBlastBackground";
import { useIntroSequence } from "@/hooks/useIntroSequence";
import { getI18nStaticProps } from "@/lib/getI18nStaticProps";
import type { NavModalKey } from "@/lib/navModal";

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

  // Clique em Trabalhos/Sobre mim no nav não navega aqui na home: guarda a
  // origem do clique pro Hero desenhar a raiz até o planeta, e só quando ela
  // chega (ou de imediato, no branch estático) o modal abre.
  const [pendingTarget, setPendingTarget] = useState<{ key: NavModalKey; origin: DOMRect } | null>(
    null
  );
  const [modalKey, setModalKey] = useState<NavModalKey | null>(null);

  const handleModalNav = useCallback((key: NavModalKey, origin: DOMRect) => {
    setPendingTarget({ key, origin });
  }, []);

  const handleRootArrived = useCallback((key: NavModalKey) => {
    setPendingTarget(null);
    setModalKey(key);
  }, []);

  return (
    <>
      <Head>
        <title>Alef Devops</title>
        <meta name="description" content={t("meta_description")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070b10" />
        <link rel="icon" href="/code-square.svg" />
      </Head>

      <PixelBlastBackground />

      {/* Antes do Header de propósito: a cortina é fixed e cobre tudo, mas
          renderizar cedo deixa claro que ela é a primeira coisa da página. */}
      <Intro phase={intro.phase} percent={intro.percent} stage={intro.stage} />

      <Header
        introPhase={intro.phase}
        contentRevealed={intro.contentRevealed}
        onModalNav={handleModalNav}
      />

      <main id="main">
        <Hero
          contentRevealed={intro.contentRevealed}
          pendingTarget={pendingTarget}
          onRootArrived={handleRootArrived}
        />
      </main>

      <NavRootModal modalKey={modalKey} onClose={() => setModalKey(null)} />

      <Analytics />
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) =>
  getI18nStaticProps(locale as string);
