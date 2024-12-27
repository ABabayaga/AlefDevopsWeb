import React from "react";
import { Container } from "react-bootstrap";

const ExampleComponents: React.FC = () => {
  return (
    <>
      <Container fluid className="px-0">
        <div className="text-center my-4">
          <img 
            src="/wallpaper.jpg" 
            alt="Imagem da pasta public" 
            className="img-fluid" 
            style={{ width: "100vw", height: "50vh", objectFit: "cover" }} 
          />
        </div>
      </Container>
    </>
  );
};

export default ExampleComponents;
