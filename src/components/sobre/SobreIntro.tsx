import Image from "next/image";
import { useTranslation } from "next-i18next";

import LabelRule from "@/components/sobre/LabelRule";

/**
 * Abertura de /sobre. Faz o papel de SectionHeader, mas com a foto ao lado do
 * título, então monta o próprio cabeçalho. É o único <h1> da página.
 *
 * No desktop a foto estica até a altura do bloco de texto (self-stretch), em
 * vez de ter altura própria: assim ela acompanha o texto em qualquer idioma.
 * No mobile vem antes do texto, em proporção fixa e largura contida.
 */
const SobreIntro: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <header>
      <LabelRule label={t("nav_sobre")} />

      <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-stretch md:gap-12">
        <div className="relative aspect-4/5 w-44 shrink-0 overflow-hidden rounded-sm border border-line sm:w-52 md:order-last md:aspect-auto md:min-h-80 md:w-64 lg:w-72">
          <Image
            src="/alef.jpeg"
            alt={t("sobre_photo_alt")}
            fill
            priority
            sizes="(min-width: 1024px) 18rem, (min-width: 768px) 16rem, 13rem"
            className="object-cover object-[50%_70%]"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h1 className="type-display type-section measure m-0 text-fg">{t("sobre_header")}</h1>
          <p className="measure mt-5 mb-0 text-[1.1875rem] leading-snug text-pretty text-fg">
            {t("sobre.subtitle")}
          </p>
          <p className="measure mt-5 mb-0 text-fg/80">{t("sobre.intro")}</p>
        </div>
      </div>
    </header>
  );
};

export default SobreIntro;
