import { useTranslation } from "next-i18next";

import CtaBand from "@/components/CtaBand";

/** Fecho de /sobre: o bloco é o CtaBand compartilhado com /trabalhos. */
const SobreCta: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <CtaBand
      id="sobre-cta"
      label={t("sobre.cta.label")}
      title={t("sobre.cta.title")}
      whatsappLabel={t("sobre.cta.whatsapp")}
      secondary={{ href: "/trabalhos", label: t("sobre.cta.work") }}
    />
  );
};

export default SobreCta;
