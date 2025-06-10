import { useState } from "react";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { FaTimes } from "react-icons/fa"; // Ícone de fechar (React Icons)

type ModalType = "infrastructure" | "personal" | "developer" | null;

const About = () => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const toggleModal = (modal: ModalType) => {
        setActiveModal((prev) => (prev === modal ? null : modal));
    };

    return (
        <>
            <Head>
                <title>Alef Devops</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/code-square.svg" />
            </Head>

            <Container as="main" className="py-4 px-3 mx-auto large-text">
                <Header />
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "justify",
                        lineHeight: "1.8",
                    }}
                >
                    <h1>About Me</h1>
                    <p>
                        Sou um profissional com mais de 15 anos de experiência no setor de telecomunicações, atuando na criação e crescimento de uma empresa familiar, que se destacou como referência regional. Contribuí para o sucesso da empresa com a implantação de infraestrutura técnica, otimização de processos e excelência no atendimento ao cliente, consolidando sua posição no mercado até sua negociação bem-sucedida. Atualmente, sou desenvolvedor júnior, buscando conhecimento e experiência na área de Web3, com foco em tecnologias inovadoras como blockchain, contratos inteligentes, tokens e DAOs.
                    </p>
                </div>

                <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <h1>Skills:</h1>
                </div>

                {/* Botões lado a lado */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                        marginBottom: "50px",
                    }}
                >
                    <button
                        onClick={() => toggleModal("infrastructure")}
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            cursor: "pointer",
                            border: "none",
                            backgroundColor: "#007bff",
                            color: "white",
                            borderRadius: "5px",
                        }}
                    >
                        Infrastructure
                    </button>
                    <button
                        onClick={() => toggleModal("personal")}
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            cursor: "pointer",
                            border: "none",
                            backgroundColor: "#28a745",
                            color: "white",
                            borderRadius: "5px",
                        }}
                    >
                        Personal
                    </button>
                    <button
                        onClick={() => toggleModal("developer")}
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            cursor: "pointer",
                            border: "none",
                            backgroundColor: "#dc3545",
                            color: "white",
                            borderRadius: "5px",
                        }}
                    >
                        Developer
                    </button>
                </div>

                {/* Modal: Infrastructure */}
                {activeModal === "infrastructure" && (
                    <div
                        style={styles.modalOverlay}
                        onClick={(e) => {
                            // Verifica se o clique foi fora do modal (modalContent)
                            if (e.target === e.currentTarget) {
                                toggleModal(null); // Fecha o modal
                            }
                        }}
                    >


                        <div style={styles.modalContent}>
                            <div style={styles.closeIcon} onClick={() => toggleModal(null)}>
                                <FaTimes />
                            </div>
                            <h4>Redes e Conectividade</h4>
                            <ul>
                                <li><b>Configuração de Redes:</b> Implementação e gerenciamento de redes locais (LAN), redes de longa distância (WAN) e redes sem fio.</li>
                                <li><b>Segurança de Redes:</b> Firewalls, VPNs, IDS/IPS e políticas de segurança.</li>
                                <li><b>Protocolos de Roteamento:</b> BGP e OSPF.</li>
                                <li><b>Protocolo de Comunicação:</b> Conhecimento de TCP/IP, VLANs, DNS, DHCP, HTTP/HTTPS.</li>
                                <li><b>Balanceamento de Carga:</b> Configuração para otimizar a distribuição de tráfego.</li>
                            </ul>

                            <h4>Gerenciamento de Servidores</h4>
                            <ul>
                                <li><b>Sistemas Operacionais:</b> Experiência em Windows Server e Linux.</li>
                                <li><b>Virtualização:</b> Uso de ferramentas como VMware.</li>
                            </ul>

                            <h4>Armazenamento</h4>
                            <ul>
                                <li><b>Backup e Recuperação:</b> Implementação de políticas de backup e planos de recuperação.</li>
                            </ul>

                            <h4>Segurança da Informação</h4>
                            <ul>
                                <li><b>Gestão de Acessos:</b> Controle de acesso VPN.</li>
                                <li><b>Hardening de Sistemas:</b> Aumentar a segurança de servidores, dispositivos e infraestrutura.</li>
                                <li><b>Trabalho conjunto com autoridades:</b> Fornecimento de dados sensíveis e cooperação com solicitações judiciais.</li>
                            </ul>

                            <h4>Monitoramento e Diagnóstico</h4>
                            <ul>
                                <li><b>Ferramentas de Monitoramento:</b> Zabbix, Grafana, Smokeping.</li>
                                <li><b>Análise de Logs:</b> Servidor de logs.</li>
                                <li><b>Resolução de Problemas:</b> Diagnóstico de falhas de sistemas e redes.</li>
                            </ul>

                            <h4>Fibra Óptica</h4>
                            <ul>
                                <li><b>Equipamentos:</b> OLTs, Access Points, Routers, Switchs, OTDR, Powermeter, Máquina de fusão.</li>
                                <li><b>Vendors:</b> FiberHome e Nokia.</li>
                                <li><b>Protocolos:</b> GPON, FTTH, FTTB, Lant2Lan.</li>
                            </ul>

                            <h4>Redes Wireless</h4>
                            <ul>
                                <li><b>Equipamentos:</b> Access Points, Routers, Switchs.</li>
                                <li><b>Vendors:</b> Mikrotik, FiberHome, Nokia, Ubiquiti, Cisco, TP-Link.</li>
                                <li><b>Protocolos:</b> 802.11n, 802.11ac.</li>
                                <li><b>Topologias:</b> Backbone, Backhaul e POPs.</li>
                            </ul>

                            <h4>Design e Arquitetura de Infraestrutura</h4>
                            <ul>
                                <li><b>Planejamento de Capacidade:</b> Garantir que a infraestrutura possa lidar com o crescimento.</li>
                                <li><b>Desenho de Topologias:</b> Projetar a estrutura lógica e física de redes e sistemas.</li>
                                <li><b>Alta Disponibilidade (HA):</b> Soluções que evitam downtime (links alternativos, nobreaks, banco de baterias).</li>
                            </ul>

                            <h4>Conhecimento de Hardware</h4>
                            <ul>
                                <li><b>Equipamentos de Rede:</b> Switches, roteadores, access points.</li>
                                <li><b>Servidores Físicos:</b> Instalação e manutenção de hardware.</li>
                                <li><b>Data Centers:</b> Gerenciamento de racks indoor e outdoor, CPD, POPs.</li>
                            </ul>
                        </div>
                    </div>
                )}


                {/* Modal: Personal */}
                {activeModal === "personal" && (
                    <div
                        style={styles.modalOverlay}
                        onClick={(e) => {
                            // Verifica se o clique foi fora do modal (modalContent)
                            if (e.target === e.currentTarget) {
                                toggleModal(null); // Fecha o modal
                            }
                        }}
                    >


                        <div style={styles.modalContent}>
                            <div style={styles.closeIcon} onClick={() => toggleModal(null)}>
                                <FaTimes />
                            </div>
                            <h4>Coordenação de Equipes: </h4>
                            <ul>
                                <li>Experiência em liderar setores como suporte, vendas, atendimento, financeiro e equipes de campo, com foco em integração e alinhamento de objetivos corporativos.</li>
                            </ul>
                            <h4>Otimização de Processos:</h4>
                            <ul>
                                <li>Desenvolvimento e implementação de estratégias para aumentar a eficiência operacional e reduzir custos, sempre priorizando a qualidade e a satisfação do cliente.</li>
                            </ul>
                            <h4>Desenvolvimento de Talentos:</h4>
                            <ul>
                                <li>Formação e treinamento de equipes multidisciplinares, promovendo o crescimento individual e coletivo para garantir alta performance e atingir metas organizacionais.</li>
                            </ul>
                            <h4>Gestão Financeira:</h4>
                            <ul>
                                <li>Supervisionei e otimizei processos financeiros, incluindo análise de orçamentos, controle de custos e planejamento financeiro, garantindo a sustentabilidade da empresa.</li>
                            </ul>
                            <h4>Cultura Organizacional:</h4>
                            <ul>
                                <li>Criei e promovi uma cultura de excelência, foco no cliente e inovação, estabelecendo valores corporativos que impulsionaram o engajamento e a produtividade das equipes.</li>
                            </ul>
                            <h4>Gestão de Projetos:</h4>
                            <ul>
                                <li>Experiência em liderar projetos complexos, desde a fase de concepção até a execução, garantindo que fossem entregues dentro dos prazos e orçamentos estabelecidos.</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Modal: Developer */}
                {activeModal === "developer" && (
                    <div
                        style={styles.modalOverlay}
                        onClick={(e) => {
                            // Verifica se o clique foi fora do modal (modalContent)
                            if (e.target === e.currentTarget) {
                                toggleModal(null); // Fecha o modal
                            }
                        }}
                    >

                        <div style={styles.modalContent}>
                            <div style={styles.closeIcon} onClick={() => toggleModal(null)}>
                                <FaTimes />
                            </div>
                            <h4>Frontend:</h4>
                            <ul >
                                <img className="m-3" src="/react.svg" width="70"></img>
                                <img src="/bootstrap.svg" width="70"></img>
                                <img className="m-3" src="/nextjs.svg" width="70"></img>
                                <img src="/vue.svg" width="70"></img>
                            </ul>
                            <h4>Backend:</h4>
                            <ul>
                                <img className="m-3" src="/nodejs.svg" width="70"></img>
                                <img src="/javascript.svg" width="70"></img>
                            </ul>
                            <h4>Database:</h4>
                            <ul>
                                <img src="/mongo.svg" width="70"></img>
                            </ul>
                            <h4>Blockchain:</h4>
                            <ul>
                                <img className="m-3" src="/sol.svg" width="70"></img>
                                <img src="/metamask.svg" width="70"></img>
                                <img className="m-3" src="/bsc.svg" width="70"></img>
                            </ul>

                        </div>
                    </div>
                )}

                <Footer />
            </Container>
        </>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        width: "90%",
        maxWidth: "800px",
        textAlign: "left",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        maxHeight: "80%",
        overflowY: "auto",
        position: "relative",
    },
    closeIcon: {
        position: "absolute",
        top: "10px",
        right: "10px",
        cursor: "pointer",
        fontSize: "20px",
        color: "black",
    },
    // Novo estilo para o container principal
    mainContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
    },
    // Estilo para botões responsivos
    button: {
        padding: "10px 20px",
        fontSize: "16px",
        cursor: "pointer",
        border: "none",
        borderRadius: "5px",
        margin: "5px",
        width: "100%",
        maxWidth: "200px",
    },
};

export default About;
