import Image from "next/image";
import { useTranslation } from "next-i18next";

const paragraphs = ["p1", "p2"] as const;
const careerSteps = ["telecom", "infra", "fullstack", "ai"] as const;

// Saíram do header quando a faixa superior de utilitários foi removida: esta
// é a página de identidade, que é onde alguém procura por eles de propósito.
const socialLinks = [
  { href: "https://www.linkedin.com/in/alefdevops/", icon: "/linkedin.png", alt: "LinkedIn" },
  { href: "https://github.com/ABabayaga", icon: "/github.png", alt: "GitHub" },
  { href: "https://www.instagram.com/alef.lim4/", icon: "/instagram.png", alt: "Instagram" },
];

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

        <div className="flex flex-col gap-3 border-t border-line-soft pt-6">
          <p className="type-label m-0 text-fg-muted">{t("sobre_social")}</p>

          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.alt}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.alt}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line opacity-70 transition hover:border-os2 hover:opacity-100"
              >
                {/* os PNGs são line-art preto puro: sem invert desaparecem no escuro */}
                <Image src={social.icon} alt="" width={16} height={16} className="invert" />
              </a>
            ))}
          </div>
        </div>
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
