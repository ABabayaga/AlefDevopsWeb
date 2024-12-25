import Link from "next/link";
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="d-flex flex-column align-items-center pb-3 mb-5 border-bottom position-relative">
      {/* Icons Section */}
      <div className="position-absolute start-0 top-50 translate-middle-y d-flex ps-3">
        <a href="https://www.linkedin.com/in/alef-rodrigues-96768671/" target="_blank" className="text-dark me-3" rel="noopener noreferrer">
          <img src="/linkedin.png" alt="Icon 1" width="35" height="35" />
        </a>
        <a href="https://github.com/ABabayaga" target="_blank" className="text-dark me-3" rel="noopener noreferrer">
          <img src="/github.png" alt="Icon 2" width="35" height="35" />
        </a>
        <a href="https://www.instagram.com/alef.lim4/" target="_blank" className="text-dark me-3" rel="noopener noreferrer">
          <img src="/instagram.png" alt="Icon 3" width="35" height="35" />
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
      <nav>
        <ul className="nav d-flex justify-content-center">
          <li className="nav-item">
            <Link href="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/about" className="nav-link">
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/projects" className="nav-link">
              Projects
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
