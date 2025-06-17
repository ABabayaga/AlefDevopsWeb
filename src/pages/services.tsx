import Head from "next/head";
import Container from "react-bootstrap/Container";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { GetStaticProps } from 'next'
import { getI18nStaticProps } from '@/lib/getI18nStaticProps'
import { useTranslation } from 'next-i18next'

const Services = () => {
    const { t } = useTranslation('common')

    const services = [
        {
            key: "smart_contracts",
            icon: "/icons/blockchain.png",
        },
        {
            key: "responsive_web",
            icon: "/icons/create.png",
        },
        {
            key: "web3_integration",
            icon: "/icons/web3.png"
        },
        {
            key: "backend_api",
            icon: "/icons/backend.png"
        },
        {
            key: "crypto_consulting",
            icon: "/icons/buy.png"
        },
        {
            key: "custom_systems",
            icon: "/icons/developer.png"
        },
    ];

    return (
        <>
            <Head>
                <title>Alef Devops</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/code-square.svg" />
            </Head>

            <Container as="main" className="py-4 px-3 mx-auto large-text">
                <Header />

                <section className="container py-5">
                    <h2 className="text-center mb-4">{t('services_header')}</h2>
                    <div className="mx-auto text-center" style={{ maxWidth: "800px" }}>
                        <p className="mb-5">{t('services_description')}</p>
                    </div>
                    <div className="row">
                        {services.map((service, index) => (
                            <div className="col-md-6 mb-4" key={index}>
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body text-center">
                                        <img src={service.icon} alt={t(`${service.key}.title`)} style={{ width: '60px', height: '60px' }} />
                                        <h4 className="card-title mt-3">{t(`${service.key}.title`)}</h4>
                                        <div className="text-start" style={{ paddingLeft: '70px' }}>
                                            <p className="card-text">{t(`${service.key}.desc1`)}</p>
                                            <p className="card-text">{t(`${service.key}.desc2`)}</p>
                                            <p className="card-text">{t(`${service.key}.desc3`)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <Footer />
            </Container>
        </>
    );
};

export default Services;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return getI18nStaticProps(locale as string)
}
