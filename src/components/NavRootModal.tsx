import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { reveal } from "@/lib/reveal";
import { NAV_MODAL_TITLE_KEY, type NavModalKey } from "@/lib/navModal";

/** Chave de nav → página cheia correspondente, pro link de "ver mais". */
const SEE_MORE_HREF: Partial<Record<NavModalKey, string>> = {
  trabalhos: "/trabalhos",
  sobre: "/sobre",
};

interface NavRootModalProps {
  modalKey: NavModalKey | null;
  onClose: () => void;
}

/**
 * Placeholder aberto pela raiz do nav (ver NavRootReveal) ou, no branch
 * estático do Hero, direto pelo clique. O título é a mesma chave que a
 * página cheia (/trabalhos, /sobre) usa — o texto mora num lugar só.
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

  const seeMoreHref = SEE_MORE_HREF[modalKey];

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
        className="w-full max-w-lg rounded-sm border border-line bg-surface p-8 sm:p-10"
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

        {seeMoreHref && (
          <Link
            href={seeMoreHref}
            className="type-label mt-6 inline-block text-os2 no-underline transition-opacity hover:opacity-80"
          >
            {t("modal_see_more")} →
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavRootModal;
