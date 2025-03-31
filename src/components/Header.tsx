import Link from "next/link";
import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

const Header: React.FC = () => {
  return (
    <Navbar expand="md" bg="white" variant="light" className="border-bottom py-0">
      <Container className="d-flex flex-column align-items-center">

        {/* Linha do nome Alef Devops centralizado */}
        <Navbar.Brand href="/" className="mb-1 d-flex align-items-center gap-2">
          <img src="/code-square.svg" width="30" height="30" alt="Logo" />
          <span className="fs-4 fw-bold">Alef Devops</span>
        </Navbar.Brand>

        {/* Linha das redes sociais e toggle */}
        <div className="w-100 d-flex justify-content-between align-items-center mb-2 px-3">
          <div className="d-flex gap-3">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <img src="/linkedin.png" alt="LinkedIn" width="24" height="24" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <img src="/github.png" alt="GitHub" width="24" height="24" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img src="/instagram.png" alt="Instagram" width="24" height="24" />
            </a>
          </div>
          <Navbar.Toggle aria-controls="main-navbar" />
        </div>

        {/* Menu principal */}
        <Navbar.Collapse id="main-navbar">
          <Nav className="flex-column flex-md-row text-center gap-2 gap-md-4">
            <Nav.Link as={Link} href="/">Home</Nav.Link>
            <NavDropdown title="Projects" id="projects-dropdown">
              <NavDropdown.Item href="https://www.hashfilegen.com/" target="_blank">HashFile</NavDropdown.Item>
              <NavDropdown.Item href="https://dapp-openc.vercel.app/" target="_blank">NFTs Marketplace</NavDropdown.Item>
              <NavDropdown.Item href="https://token100-alef-devops-front.vercel.app/" target="_blank">Token100</NavDropdown.Item>
              <NavDropdown.Item href="https://token100-alef-devops-front.vercel.app/" target="_blank">Token100</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} href="/blog">Blog</Nav.Link>
            <Nav.Link as={Link} href="/about">About Me</Nav.Link>
            <Nav.Link as={Link} href="/contacts">Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

  );
};

export default Header;
