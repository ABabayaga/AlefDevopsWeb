import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { reveal } from "@/lib/reveal";
import { NAV_MODAL_TITLE_KEY, type NavModalKey } from "@/lib/navModal";
import TrabalhosContent from "@/components/TrabalhosContent";
import SobreContent from "@/components/SobreContent";

interface NavRootModalProps {
  modalKey: NavModalKey | null;
  onClose: () => void;
}

/**
 * Aberto pela raiz do nav (ver NavRootReveal) ou, no branch estático do
 * Hero, direto pelo clique. O conteúdo mora aqui mesmo — não há mais página
 * cheia por trás; o título é a mesma chave que o conteúdo usaria como
 * cabeçalho de seção, se ainda existisse uma página.
 */
const NavRootModal: React.FC<NavRootModalProps> = ({ modalKey, onClose }) => {
  const { t } = useTranslation("common");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!modalKey) return;

    // Um frame depois do mount, pra reveal() animar a entrada em vez de já
    // nascer no estado final.
    const frame = window.requestAnimationFrame(() => setVisible(true));
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      setVisible(false);
    };
  }, [modalKey, onClose]);

  if (!modalKey) return null;

  return (
    <div
      className={`fixed inset-0 z-70 flex items-center justify-center bg-ink/85 px-5 backdrop-blur-md ${reveal(
        visible
      )}`}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-sm border border-line bg-surface p-8 sm:p-10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6">
          <h2 className="type-display type-section m-0 text-fg">{t(NAV_MODAL_TITLE_KEY[modalKey])}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t("modal_close")}
            className="type-label shrink-0 text-fg-muted transition-colors hover:text-fg"
          >
            ✕
          </button>
        </div>

        {modalKey === "trabalhos" && <TrabalhosContent />}
        {modalKey === "sobre" && <SobreContent />}
      </div>
    </div>
  );
};

export default NavRootModal;
