import { useTranslation } from "next-i18next";
import ExpertiseAreas from "@/components/ExpertiseAreas";

// wa.me só aceita dígitos, com DDI e DDD e sem sinais de pontuação.
const WHATSAPP_NUMBER = "5567981846847";

const Hero: React.FC = () => {
  const { t } = useTranslation("common");

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    t("hero_whatsapp_message"),
  )}`;

  return (
    <section className="relative overflow-hidden">
      {/* atmosfera: um único halo frio, como o brilho de um monitor de NOC */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_78%_8%,rgba(34,211,197,0.08),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 lg:pt-24 lg:pb-28">
        <p className="type-label mb-6 flex items-center gap-3 text-fg-muted">
          <span aria-hidden className="h-px w-8 shrink-0 bg-os2" />
          <span className="min-w-0 leading-relaxed">{t("hero_eyebrow")}</span>
        </p>

        {/* max-w em ch: a headline é curta e sem trava quebraria em uma linha só
            no desktop largo, perdendo a escala que justifica o tamanho. 18ch
            quebra em duas linhas nos dois idiomas. */}
        <h1 className="type-display type-hero m-0 max-w-[18ch] text-fg">{t("title")}</h1>

        <p className="measure mt-7 text-fg-muted">{t("hero_sub")}</p>

        {/* CTA único: com a home reduzida ao hero, não há âncora interna para
            onde mandar ninguém. */}
        <div className="mt-10">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="type-label inline-block rounded-full bg-os2 px-6 py-3.5 text-ink no-underline transition-opacity hover:opacity-85"
          >
            {t("hero_whatsapp")}
          </a>
        </div>

        <ExpertiseAreas />
      </div>
    </section>
  );
};

export default Hero;
