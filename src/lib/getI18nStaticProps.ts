// lib/getI18nStaticProps.ts
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getI18nStaticProps = async (locale: string, namespaces: string[] = ['common']) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, namespaces)),
    },
  }
}
