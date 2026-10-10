import Link from "next/link";
import { useTranslation } from "next-i18next";

import { useInView } from "@/hooks/useInView";
import { reveal } from "@/lib/reveal";
import { whatsappHref } from "@/lib/whatsapp";

/**
 * Fecho da página. O primário é o mesmo pill do CTA do hero e a mesma
 * mensagem pré-preenchida; o secundário leva para /trabalhos, para quem ainda
 * quer ver antes de falar.
 */
const SobreCta: React.FC = () => {
  const { t } = useTranslation("common");
  const [ref, visible] = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-labelledby="sobre-cta"
      className={`flex flex-col gap-8 border border-line bg-surface/60 px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between ${reveal(
        visible,
      )}`}
    >
      <div>
        <span className="type-label text-os2">{t("sobre.cta.label")}</span>
        <h2 id="sobre-cta" className="type-display type-section mt-4 mb-0 text-fg">
          {t("sobre.cta.title")}
        </h2>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
        <a
          href={whatsappHref(t("hero_whatsapp_message"))}
          target="_blank"
          rel="noopener noreferrer"
          className="type-label inline-block rounded-full bg-os2 px-6 py-3.5 text-center text-ink no-underline transition-opacity hover:opacity-85"
        >
          {t("sobre.cta.whatsapp")}
        </a>
        <Link
          href="/trabalhos"
          className="type-label inline-block rounded-full border border-fg/30 px-6 py-3.5 text-center text-fg no-underline transition-colors hover:border-os2 hover:text-os2"
        >
          {t("sobre.cta.work")}
        </Link>
      </div>
    </section>
  );
};

export default SobreCta;
