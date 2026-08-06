import Image from "next/image";
import { useTranslation } from "next-i18next";

const paragraphs = ["p1", "p2"] as const;
const careerSteps = ["telecom", "infra", "fullstack", "ai"] as const;

/**
 * Corpo da página /sobre (ver src/pages/sobre.tsx) — o cabeçalho da seção
 * fica por conta de SectionHeader; aqui mora só foto, bio e a progressão de
 * carreira.
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

      <ol className="flex shrink-0 flex-col gap-6 border-l border-line pl-4 sm:w-48">
        {careerSteps.map((step, i) => {
          const isLast = i === careerSteps.length - 1;
          return (
            <li key={step} className="relative">
              <span
                className={`absolute -left-4.75 top-1 h-1.5 w-1.5 rounded-full ${
                  isLast ? "bg-os2" : "bg-line"
                }`}
                aria-hidden
              />
              <p className={`type-label m-0 ${isLast ? "text-os2" : "text-fg-muted"}`}>
                {t(`sobre_career.${step}`)}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default SobreContent;
