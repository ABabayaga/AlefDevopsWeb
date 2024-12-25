import React from "react";
import { Col } from "react-bootstrap";

const ExampleComponents: React.FC = () => {
  return (
    <>
      <Col lg={8} className="px-0 mx-auto d-flex flex-column">
        <p className="fs-4 text-justify">
          Sou um desenvolvedor dedicado a criar soluções inovadoras em tecnologia blockchain. Meu propósito é projetar e implementar <strong>smart contracts</strong> eficientes, seguros e personalizados para diversas aplicações. Além disso, foco em desenvolver soluções que integram <strong>criptomoedas como meio de pagamento</strong>, oferecendo aos meus clientes uma abordagem moderna e descentralizada para transações financeiras. Com uma visão orientada para o futuro, trabalho para transformar ideias em sistemas tecnológicos robustos e adaptáveis às necessidades do mercado digital.
        </p>
      </Col>
    </>
  );
};

export default ExampleComponents;

