/**
 * DESATIVADO — não está renderizado em nenhuma página.
 *
 * Já segue a identidade escura e já lê a bio de public/locales/{pt,en}/common.json
 * (chaves `about_header` e `about_bio.p1..p3`), então religar é só importar em
 * index.tsx e devolver o item "Sobre" ao navItems do Header.
 */
import { useTranslation } from "next-i18next";
import SectionHeader from "@/components/SectionHeader";

const paragraphs = ["p1", "p2", "p3"] as const;

const AboutSection: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
      <SectionHeader label={t("about")} title={t("about_header")} />

      <div className="measure flex flex-col gap-6">
        {paragraphs.map((p) => (
          <p key={p} className="m-0 text-fg-muted">
            {t(`about_bio.${p}`)}
          </p>
        ))}
      </div>
    </section>
  );
};

export default AboutSection;
