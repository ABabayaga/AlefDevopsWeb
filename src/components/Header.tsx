import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { IntroPhase } from "@/hooks/useIntroSequence";
import { reveal } from "@/lib/reveal";
import { whatsappHref } from "@/lib/whatsapp";

const socialLinks = [
  { href: "https://www.linkedin.com/in/alefdevops/", icon: "/linkedin.png", alt: "LinkedIn" },
  { href: "https://github.com/ABabayaga", icon: "/github.png", alt: "GitHub" },
  { href: "https://www.instagram.com/alef.lim4/", icon: "/instagram.png", alt: "Instagram" },
];

interface NavItem {
  href: string;
  label: string;
  /** Link externo: abre em aba nova e leva rel de segurança. */
  external?: boolean;
}

const NavEntry: React.FC<{
  item: NavItem;
  className: string;
  onNavigate?: () => void;
}> = ({ item, className, onNavigate }) => {
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={className}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} onClick={onNavigate} className={className}>
      {item.label}
    </Link>
  );
};

interface HeaderProps {
  /** "done" por padrão: páginas fora do fluxo da intro (ex. blog desativado)
   *  não passam essa prop e devem só mostrar o logo final, sem animação. */
  introPhase?: IntroPhase;
  /** Idem: sem intro, o resto do header já nasce visível. */
  contentRevealed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ introPhase = "done", contentRevealed = true }) => {
  const { t } = useTranslation("common");
  // O logo só carrega o layoutId compartilhado a partir de "morphing": é o
  // instante em que a cópia grande da cortina deixa de ser renderizada, e a
  // troca de árvore é o que o Framer Motion lê como o elemento migrando até
  // aqui. Nas fases anteriores (e sem JS/skip, que nunca saem de "pending")
  // este logo já é o conteúdo final, visível normalmente — a cortina opaca
  // cobre a tela por cima dele enquanto a intro roda.
  const morphed = introPhase === "morphing" || introPhase === "done";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Transparente sobre o hero, sólido depois — um header só, para o site todo.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // O CTA do hero só aparece no fim da narrativa de scroll; o header é sticky,
  // então é aqui que o contato fica sempre alcançável.
  const navItems: NavItem[] = [
    { href: whatsappHref(t("hero_whatsapp_message")), label: t("hero_whatsapp"), external: true },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line bg-ink/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link href="/" className="no-underline" onClick={() => setOpen(false)}>
          {/* A `key` é o que faz o morph existir: o Framer só registra um
              layoutId no grupo compartilhado quando o nó de projeção monta.
              Sem remontar, este logo apenas ganharia a prop, nada seria
              promovido e a cópia grande sumiria sem viajar. */}
          <BrandLogo
            key={morphed ? "shared" : "plain"}
            layoutId={morphed ? "brand-logo" : undefined}
          />
        </Link>

        {navItems.length > 0 && (
          <nav
            className={`hidden items-center gap-8 md:flex ${reveal(contentRevealed)}`}
            aria-label={t("nav_label")}
          >
            {navItems.map((item) => (
              <NavEntry
                key={item.href}
                item={item}
                className="type-label text-fg-muted no-underline transition-colors hover:text-fg"
              />
            ))}
          </nav>
        )}

        <div className={`hidden items-center gap-4 md:flex ${reveal(contentRevealed)}`}>
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
          className={`flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden ${reveal(
            contentRevealed
          )}`}
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
              <NavEntry
                key={item.href}
                item={item}
                onNavigate={() => setOpen(false)}
                className="type-label border-b border-line-soft py-4 text-fg-muted no-underline transition-colors hover:text-fg"
              />
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
