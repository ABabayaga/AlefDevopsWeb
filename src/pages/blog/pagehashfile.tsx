import Head from "next/head";

import Container from "react-bootstrap/Container";
import AppGuides from "@/components/AppGuides";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ExampleComponents from "@/components/ExampleComponents";

const Pagehashfile = () => {
    return (
        <>
            <Head>
                <title>Alef Devops</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Container as="main" className="py-4 px-3 mx-auto large-text">
                <Header />
</Container>
                    <div className="d-flex mb-5 justify-content-center align-items-center">
                    <h1>Por que gerar o hash de um arquivo e salvá-lo na blockchain?</h1>
                    </div>

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "justify",
                        lineHeight: "1.8",
                    }}>
                        <p>A principal finalidade de gerar o hash de um arquivo e armazená-lo na blockchain é garantir que o arquivo não sofreu alterações. A explicação é simples: um hash é como a "identidade digital" do arquivo. Ele é gerado a partir do conteúdo do arquivo e qualquer mínima modificação, como a adição de um espaço em branco, altera completamente essa sequência única de números e letras, resultando em um novo hash.

Por exemplo, imagine que você assinou um contrato de venda e deseja garantir que o arquivo não seja alterado de má-fé. A solução seria gerar o hash do arquivo e armazená-lo na blockchain. Mas por que usar a blockchain? Porque uma vez que o hash é salvo na blockchain, ele se torna imutável — ninguém pode alterá-lo ou excluí-lo. Isso oferece uma garantia contra fraudes, pois a integridade do arquivo pode ser verificada por qualquer pessoa a partir do hash armazenado.

Além disso, a blockchain é pública e transparente, o que permite que qualquer pessoa possa acessar e verificar o hash, garantindo ainda mais segurança e confiança no processo.</p>
                    </div>
                
                    
                



                <Footer />
            
        </>
    );
};

export default Pagehashfile;