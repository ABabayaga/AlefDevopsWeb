import Image from "next/image";
import { useTranslation } from "next-i18next";
import SectionHeader from "@/components/SectionHeader";

const services = [
  { key: "smart_contracts", icon: "/icons/blockchain.png" },
  { key: "responsive_web", icon: "/icons/create.png" },
  { key: "web3_integration", icon: "/icons/web3.png" },
  { key: "backend_api", icon: "/icons/backend.png" },
  { key: "crypto_consulting", icon: "/icons/buy.png" },
  { key: "custom_systems", icon: "/icons/developer.png" },
] as const;

const details = ["desc1", "desc2", "desc3"] as const;

const ServicesSection: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <section id="services" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
      <SectionHeader
        label={t("services")}
        title={t("services_header")}
        description={t("services_description")}
      />

      <ul className="m-0 grid list-none gap-px bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li
            key={service.key}
            className="group flex flex-col gap-5 bg-ink p-6 transition-colors hover:bg-surface lg:p-7"
          >
            {/* os ícones são line-art preto: invert deixa o traço branco no escuro */}
            <Image
              src={service.icon}
              alt=""
              width={30}
              height={30}
              className="opacity-45 invert transition-opacity duration-300 group-hover:opacity-90"
            />

            <h3 className="m-0 text-[1.0625rem] font-semibold leading-snug text-fg">
              {t(`${service.key}.title`)}
            </h3>

            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {details.map((detail) => (
                <li key={detail} className="flex gap-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                  <span aria-hidden className="mt-[0.72em] h-px w-2.5 shrink-0 bg-om3/70" />
                  <span>{t(`${service.key}.${detail}`)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ServicesSection;
