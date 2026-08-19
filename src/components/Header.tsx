import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import AssistantChat from "@/components/AssistantChat";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MusicToggle from "@/components/MusicToggle";
import type { IntroPhase } from "@/hooks/useIntroSequence";
import { reveal } from "@/lib/reveal";
import { whatsappHref } from "@/lib/whatsapp";

interface NavItem {
  label: string;
  href: string;
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
  const [chatOpen, setChatOpen] = useState(false);

  // Transparente sobre o hero, sólido depois — um header só, para o site todo.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems: NavItem[] = [
    { label: t("nav_trabalhos"), href: "/trabalhos" },
    { label: t("nav_sobre"), href: "/sobre" },
  ];

  const contactHref = whatsappHref(t("hero_whatsapp_message"));

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line bg-ink/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      {/* Sem max-w aqui: o logo encosta na borda esquerda e as ações na direita,
          e a nav absoluta passa a centralizar na viewport, não na coluna.
          O py-4 vale também no desktop: existia um md:py-2 aqui para compensar
          a altura da faixa de utilitários que ficava acima — sem ela, a barra
          única precisa da altura cheia. */}
      <div className="relative flex items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-24">
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
            className={`absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex ${reveal(contentRevealed)}`}
            aria-label={t("nav_label")}
          >
            {navItems.map((item) => (
              <NavEntry
                key={item.label}
                item={item}
                className="type-label text-fg-muted no-underline transition-colors hover:text-fg"
              />
            ))}
          </nav>
        )}

        <div
          className={`hidden flex-wrap items-center justify-end gap-x-4 gap-y-2 md:flex ${reveal(
            contentRevealed
          )}`}
        >
          {/* Utilitários primeiro, ações depois: o pill amarelo fecha a barra e
              continua sendo a última coisa que o olho encontra. */}
          <MusicToggle />
          <LanguageSwitcher />

          <span aria-hidden className="h-5 w-px shrink-0 bg-line-soft" />

          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="type-label shrink-0 whitespace-nowrap rounded-full border border-line px-4 py-2 text-fg transition hover:border-os2"
          >
            {t("assistant_chat.trigger")}
          </button>

          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="type-label shrink-0 whitespace-nowrap rounded-full bg-os2 px-4 py-2 text-ink no-underline transition-opacity hover:opacity-85"
          >
            {t("hero_whatsapp")}
          </a>
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
                key={item.label}
                item={item}
                onNavigate={() => setOpen(false)}
                className="type-label border-b border-line-soft py-4 text-fg-muted no-underline transition-colors hover:text-fg"
              />
            ))}
            {/* sem itens de menu, o filete de topo encostaria na borda do drawer */}
            <div
              className={`flex flex-col gap-3 py-4 ${
                navItems.length > 0 ? "border-t border-line-soft" : ""
              }`}
            >
              {/* Sem CTA de WhatsApp aqui: no mobile o hero já traz esse botão
                  sempre visível, e repeti-lo dentro do drawer só duplicava o
                  mesmo destino. O botão do assistente é uma ação distinta,
                  então tem espaço aqui. */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setChatOpen(true);
                }}
                className="type-label w-full rounded-full border border-line px-4 py-2 text-center text-fg transition hover:border-os2"
              >
                {t("assistant_chat.trigger")}
              </button>

              {/* Redes sociais não moram mais aqui: elas vivem em /sobre, e
                  mantê-las na gaveta daria ao mobile links que o desktop não
                  tem. Sobram os mesmos utilitários da barra desktop. */}
              <div className="flex items-center justify-between gap-3">
                <MusicToggle className="flex h-9 w-9 items-center justify-center rounded-full border border-line opacity-70 transition hover:border-os2 hover:opacity-100" />

                <LanguageSwitcher />
              </div>
            </div>
          </nav>
        </div>
      )}

      <AssistantChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </header>
  );
};

export default Header;
