import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const locales = [
  { code: "pt", label: "Português", short: "PT", flag: "/icons/brazil.svg" },
  { code: "en", label: "English", short: "EN", flag: "/icons/usa.svg" },
] as const;

type LocaleCode = (typeof locales)[number]["code"];

const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const { locale, asPath } = router;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  // Fecha ao clicar fora ou no Esc — sem isso o menu fica preso aberto no toque.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const changeLanguage = (code: LocaleCode) => {
    setOpen(false);
    router.push(asPath, asPath, { locale: code });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={current.label}
        className="type-label flex items-center gap-2 rounded-full border border-line px-3 py-2 text-fg-muted transition-colors hover:border-fg-muted hover:text-fg"
      >
        <Image src={current.flag} alt="" width={16} height={16} />
        {current.short}
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 m-0 min-w-40 list-none overflow-hidden rounded-sm border border-line bg-surface p-0 shadow-lg shadow-black/40"
        >
          {locales.map((lng) => (
            <li key={lng.code} role="option" aria-selected={lng.code === current.code}>
              <button
                type="button"
                onClick={() => changeLanguage(lng.code)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-[0.9375rem] transition-colors hover:bg-raised ${
                  lng.code === current.code ? "text-os2" : "text-fg-muted"
                }`}
              >
                <Image src={lng.flag} alt="" width={18} height={18} />
                {lng.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
