import Image from "next/image";
import { useTranslation } from "next-i18next";

const paragraphs = ["p1", "p2", "p3"] as const;

/**
 * Corpo do modal de "Sobre" (ver NavRootModal) — mesma foto + bio da antiga
 * página /sobre, só que a coluna da foto encolhe (era lg:w-72, painel de
 * página inteira; agora sm:w-56, painel de modal mais estreito).
 */
const SobreContent: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">
      <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden rounded-sm border border-line sm:w-56">
        <Image src="/me.jpeg" alt={t("sobre_photo_alt")} fill className="object-cover" />
      </div>

      <div className="measure flex flex-col gap-6">
        {paragraphs.map((p) => (
          <p key={p} className="m-0 text-fg-muted">
            {t(`sobre_bio.${p}`)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default SobreContent;
