import Link from "next/link";
import { useTranslation } from "next-i18next";

import { whatsappHref } from "@/lib/whatsapp";

interface CtaBandProps {
  /** id do título, que nomeia a seção. Único por página. */
  id: string;
  label: string;
  title: string;
  whatsappLabel: string;
  /** Rota interna do botão secundário: cada página aponta para a outra. */
  secondary: { href: string; label: string };
}

/**
 * Fecho de /sobre e /trabalhos. O primário é o mesmo pill do CTA do hero e a
 * mesma mensagem pré-preenchida; o secundário leva para a outra página, para
 * quem ainda quer ver antes de falar. Os textos chegam traduzidos porque cada
 * página tem a sua chamada.
 */
const CtaBand: React.FC<CtaBandProps> = ({ id, label, title, whatsappLabel, secondary }) => {
  const { t } = useTranslation("common");

  return (
    <section
      aria-labelledby={id}
      data-reveal
      className="flex flex-col gap-8 border border-line bg-surface/60 px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <span className="type-label text-accent-2">{label}</span>
        <h2 id={id} className="type-display type-section mt-4 mb-0 text-fg">
          {title}
        </h2>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
        <a
          href={whatsappHref(t("hero_whatsapp_message"))}
          target="_blank"
          rel="noopener noreferrer"
          className="type-label inline-block rounded-full bg-button px-6 py-3.5 text-center text-white no-underline transition-colors hover:bg-button-hover"
        >
          {whatsappLabel}
        </a>
        <Link
          href={secondary.href}
          className="type-label inline-block rounded-full border border-line px-6 py-3.5 text-center text-fg no-underline transition-colors hover:bg-surface-hover"
        >
          {secondary.label}
        </Link>
      </div>
    </section>
  );
};

export default CtaBand;
