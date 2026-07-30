// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    // localeDetection omitido de propósito: o Next só aceita `false` aqui, e o
    // padrão já é a detecção ligada. Passar `true` derruba a validação da config.
  }
}
