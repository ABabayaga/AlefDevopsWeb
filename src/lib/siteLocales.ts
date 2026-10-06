// Fonte única dos metadados por idioma (URL canônica, hreflang, og:locale):
// antes eram ternários `isEn ? … : …` espalhados pelo index e pelo JSON-LD,
// que deixaram de funcionar quando entrou o terceiro idioma.
export const SITE_LOCALES = {
  pt: { url: "https://www.alefdevops.com/", hrefLang: "pt-BR", og: "pt_BR" },
  en: { url: "https://www.alefdevops.com/en", hrefLang: "en", og: "en_US" },
  es: { url: "https://www.alefdevops.com/es", hrefLang: "es", og: "es_ES" },
} as const;

export type SiteLocale = keyof typeof SITE_LOCALES;

export function toSiteLocale(locale: string | undefined): SiteLocale {
  return locale && locale in SITE_LOCALES ? (locale as SiteLocale) : "pt";
}
