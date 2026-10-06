// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en', 'es'],
    // Detecção desligada: com ela, `/` redirecionava para `/en` conforme o
    // Accept-Language — o Googlebot e o Lighthouse nunca viam a versão `pt`.
    // Idioma alternativo fica a cargo do hreflang e do LanguageSwitcher.
    // (O Next só aceita `false` aqui; `true` derruba a validação da config.)
    localeDetection: false,
  }
}
