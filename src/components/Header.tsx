import Link from "next/link";
import React from "react";
import Dropdown from "react-bootstrap/Dropdown";

const Header: React.FC = () => {
  return (
    <header className="d-flex flex-column align-items-center mb-3 border-bottom position-relative" style={{ marginTop: "-35px" }}>
      {/* Icons Section */}
      <div className="position-absolute start-0 top-50 translate-middle-y d-flex ps-3">
        <a href="https://www.linkedin.com/in/alef-rodrigues-96768671/" target="_blank" className="text-dark me-3" rel="noopener noreferrer">
          <img src="/linkedin.png" alt="LinkedIn Icon" width="35" height="35" />
        </a>
        <a href="https://github.com/ABabayaga" target="_blank" className="text-dark me-3" rel="noopener noreferrer">
          <img src="/github.png" alt="GitHub Icon" width="35" height="35" />
        </a>
        <a href="https://www.instagram.com/alef.lim4/" target="_blank" className="text-dark me-3" rel="noopener noreferrer">
          <img src="/instagram.png" alt="Instagram Icon" width="35" height="35" />
        </a>
      </div>

      <div className="d-flex align-items-center mb-3">
        <h1 className="h4">
          <Link href="/" className="d-flex align-items-center text-dark text-decoration-none">
            <img src="/code-square.svg" width="35" height="35" className="me-2" />
            <span>Alef Devops</span>
          </Link>
        </h1>
      </div>

      {/* Navbar */}
      <nav className="custom-navbar">
        <ul className="nav d-flex justify-content-center align-items-center">
          <li className="nav-item">
            <Link href="/" className="nav-link">
              Home
            </Link>
          </li>
          
          {/* Dropdown for Services 
          <li className=" custom-navbar">
            <Dropdown>
              <Dropdown.Toggle variant="link" className="nav-link custom-navbar p-0 text-decoration-none">
                Services
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as="span">
                  <Link href="/smartcontracts" className="dropdown-item">
                    Smart Contracts
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item as="span">
                  <Link href="/services/project2" className="dropdown-item">
                    DAOs
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item as="span">
                  <Link href="/services/project3" className="dropdown-item">
                    Tokens 
                  </Link>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </li>
          */}

          {/* Dropdown for Projects */}
          <li className=" custom-navbar">
            <Dropdown>
              <Dropdown.Toggle variant="link" className="nav-link custom-navbar p-0 text-decoration-none">
                Projects
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as="span">
                  <Link href="/projects/project1" className="dropdown-item">
                    HashFile
                  </Link>
                </Dropdown.Item>
                
              </Dropdown.Menu>
            </Dropdown>
          </li>

          <li className="nav-item ">
            <Link href="/about" className="nav-link">
              About Me
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/contacts" className="nav-link">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
