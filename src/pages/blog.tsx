import Head from "next/head";

import Container from "react-bootstrap/Container";
import AppGuides from "@/components/AppGuides";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ExampleComponents from "@/components/ExampleComponents";

const Blog = () => {
    return (
        <>
            <Head>
                <title>Alef Devops</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Container as="main" className="py-4 px-3 mx-auto large-text">
                <Header />


                <div className="mb-5" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', height: '30vh' }}>
                    <a
                        href="https://www.linkedin.com/in/alef-rodrigues-96768671/"
                        target="_blank" // Abre o link em uma nova aba
                        rel="noopener noreferrer" // Melhora a segurança ao abrir links externos
                    >
                    <img
                        src="/pagehashfile.jpg"
                        alt="Optimized Image"
                        loading="lazy"
                        style={{
                            width: '300px',
                            height: 'auto',
                            borderRadius: '8px', // Opcional, para bordas arredondadas
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Opcional, para sombra
                        }}
                    /></a>
                    <div >
                        <span style={{
                            marginTop: '9px', // Espaçamento entre a imagem e o texto
                            fontSize: '25px', // Tamanho da fonte do texto
                            color: '#333', // Cor do texto (opcional)
                        }}>Sobre page HashFile</span>
                        
                    </div>
                    
                </div>



                <Footer />
            </Container>
        </>
    );
};

export default Blog;