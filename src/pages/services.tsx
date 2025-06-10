import Head from "next/head";
import Container from "react-bootstrap/Container";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const services = [
    {
        title: "Desenvolvimento de Smart Contracts",
        description: "• Tokens (ERC-20, ERC-721, ERC-1155)",
        description2: "• Marketplaces NFT",
        description3: "• Upgradeable contracts com proxy (OpenZeppelin)",
        icon: "/icons/blockchain.png",
    },
    {
        title: "Criação de sistemas Web responsivos",
        description: "• Painéis de controle para pequenas empresas",
        description2: "• Gerenciamento de vendas, empréstimos ou clientes",
        description3: "• Layouts em React + Bootstrap, Mobile Friendly",
        icon: "/icons/create.png",
    },
    {
        title: "Integração Web3 com Frontend",
        description: "• dApps usando React + RainbowKit",
        description2: "• Integração com carteiras (MetaMask, WalletConnect)",
        description3: "• Controle de acesso",
        icon: "/icons/web3.png"
    },
    {
        title: "Backend com API e banco de dados",
        description: "• Node.js + Express + MongoDB",
        description2: "• Criação de endpoints protegidos com autenticação",
        description3: "• Painel administrativo com controle CRUD completo",
        icon: "/icons/backend.png"
    },
    {
        title: "Consultória para compra de criptomoedas",
        description: "• Orientação sobre KYC e segurança",
        description2: "• Custódia hot e cold wallet",
        description3: "• Criação de carteiras",
        icon: "/icons/buy.png"
    },
    {
        title: "Desenvolvimentos de sistemas",
        description: "• Soluções para projetos pessoais e empresariais",
        description2: "• Customização conforme modelo de negócio",
        description3: "• MVPs rápidos com escopo bem definido",
        icon: "/icons/developer.png"
    },
];

const Services = () => {
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
                    <h2 className="text-center mb-4">Serviços de Blockchain, Desenvolvimento de Sistemas e Consultorias.</h2>
                    <div className="mx-auto text-center" style={{ maxWidth: "800px" }}>
                        <p className="mb-5">
                            Oferecemos infraestrutura, automação e desenvolvimento sob medida para projetos tradicionais e descentralizados.
                        </p>
                    </div>
                    <div className="row">
                        {services.map((service, index) => (
                            <div className="col-md-6 mb-4" key={index}>
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body text-center">
                                        <img src={service.icon} alt={service.title} style={{ width: '60px', height: '60px' }} />
                                        <h4 className="card-title mt-3">{service.title}</h4>
                                        <div className="text-start" style={{ paddingLeft: '70px' }}>
                                            <p className="card-text">{service.description}</p>
                                            <p className="card-text">{service.description2}</p>
                                            <p className="card-text">{service.description3}</p>
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
