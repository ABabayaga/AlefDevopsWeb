import { useTranslation } from "next-i18next";

/**
 * DESATIVADO: saiu da home em 2026-07-30 — o hero ocupa a tela inteira e a
 * barra de copyright quebrava o fim da rolagem coreografada. O componente
 * continua íntegro e traduzido; ainda é usado pelas páginas de blog em
 * src/pages-disabled. Para religar, basta voltar a renderizá-lo em
 * src/pages/index.tsx (a chave `allfooter` segue nos dois locales).
 */
const Footer: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span className="type-label text-fg-muted">Alef Devops</span>
        <span className="type-label text-fg-muted">
          © {new Date().getFullYear()} · {t("allfooter")}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
