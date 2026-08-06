import type { TFunction } from "i18next";

const AREA_KEYS = ["web2", "web3", "infra"] as const;

// @graph liga as entidades por @id em vez de aninhar Person dentro de
// Organization: assim o Google resolve WebSite, Person e Organization como
// a mesma entidade em vez de três instâncias soltas e desconectadas.
export function buildJsonLd({
  isEn,
  canonicalUrl,
  metaTitle,
  metaDescription,
  t,
}: {
  isEn: boolean;
  canonicalUrl: string;
  metaTitle: string;
  metaDescription: string;
  t: TFunction;
}) {
  const websiteId = `${canonicalUrl}#website`;
  const personId = `${canonicalUrl}#person`;
  const organizationId = `${canonicalUrl}#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: metaTitle,
        url: canonicalUrl,
        inLanguage: isEn ? "en" : "pt-BR",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: "Alef Lima",
        alternateName: "Alef Devops",
        url: canonicalUrl,
        worksFor: { "@id": organizationId },
        jobTitle: isEn
          ? "Custom website and web system developer"
          : "Desenvolvedor de sites e sistemas web sob medida",
        description: metaDescription,
        sameAs: [
          "https://www.linkedin.com/in/alefdevops/",
          "https://github.com/ABabayaga",
          "https://www.instagram.com/alef.lim4/",
        ],
        knowsAbout: isEn
        ? ["Website creation", "Custom web systems", "Next.js", "TypeScript", "React", "Web3", "Smart Contracts"]
        : ["Criação de sites", "Desenvolvimento de sistemas web sob medida", "Next.js", "TypeScript", "React", "Web3", "Smart Contracts"],
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Campo Grande",
          addressRegion: "MS",
          addressCountry: "BR",
        },
        name: "Alef Devops",
        url: canonicalUrl,
        founder: { "@id": personId },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: isEn ? "Services" : "Serviços",
          itemListElement: AREA_KEYS.map((key) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: t(`areas.${key}.title`),
              description: t(`areas.${key}.desc`),
              provider: { "@id": organizationId },
            },
          })),
        },
      },
    ],
  };
}
