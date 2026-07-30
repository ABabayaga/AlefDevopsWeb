import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const socialLinks = [
  { href: "https://www.linkedin.com/in/alefdevops/", icon: "/linkedin.png", alt: "LinkedIn" },
  { href: "https://github.com/ABabayaga", icon: "/github.png", alt: "GitHub" },
  { href: "https://www.instagram.com/alef.lim4/", icon: "/instagram.png", alt: "Instagram" },
];

const Header: React.FC = () => {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Transparente sobre o hero, sólido depois — um header só, para o site todo.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A home é só o hero: não há âncora nem rota para onde apontar. O array fica
  // aqui porque é o ponto de religamento — voltar um item devolve o menu inteiro,
  // no desktop e no mobile.
  const navItems: { href: string; label: string }[] = [];

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line bg-ink/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-fg no-underline"
          onClick={() => setOpen(false)}
        >
          {/* o SVG é fill="currentColor", mas como <img> ele vira um documento
              isolado e currentColor cai para preto — sem chip claro atrás, o
              glifo some no fundo escuro */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-fg">
            <Image src="/code-square.svg" width={17} height={17} alt="" />
          </span>
          <span className="type-display text-[1.05rem] tracking-tight">Alef Devops</span>
        </Link>

        {navItems.length > 0 && (
          <nav className="hidden items-center gap-8 md:flex" aria-label={t("nav_label")}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="type-label text-fg-muted no-underline transition-colors hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher />

          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.alt}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line opacity-60 transition hover:border-os2 hover:opacity-100"
              >
                {/* os PNGs são line-art preto puro: sem invert desaparecem no escuro */}
                <Image src={social.icon} alt={social.alt} width={14} height={14} className="invert" />
              </a>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? t("nav_close") : t("nav_open")}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-5 bg-fg transition-transform duration-300 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-5 bg-fg transition-transform duration-300 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div
          id="main-nav"
          className="border-t border-line bg-ink/95 backdrop-blur-md md:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col px-5 py-2 sm:px-8" aria-label={t("nav_label")}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="type-label border-b border-line-soft py-4 text-fg-muted no-underline transition-colors hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
            {/* sem itens de menu, o filete de topo encostaria na borda do drawer */}
            <div
              className={`flex items-center justify-between gap-3 py-4 ${
                navItems.length > 0 ? "border-t border-line-soft" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.alt}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line opacity-70"
                  >
                    <Image src={social.icon} alt={social.alt} width={15} height={15} className="invert" />
                  </a>
                ))}
              </div>

              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
