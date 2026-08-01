import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { WIPE_MS, FLASH_MS, useIntroProgress } from "@/hooks/useIntroProgress";

/** Chaves de locale, na ordem das faixas de porcentagem do hook. */
const STAGE_KEYS = [
  "intro.connecting",
  "intro.handshake",
  "intro.receiving",
  "intro.ready",
] as const;

/** Marca no sessionStorage. O mesmo nome é lido pelo script do _document. */
const SEEN_KEY = "intro-seen";

/**
 * Storage pode estar bloqueado (modo privado, cookies desligados) e o acesso
 * lança. Nesses casos a intro simplesmente reaparece — não é motivo para
 * derrubar a página.
 */
function readSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** Três pacotes correndo, defasados no tempo. */
const PACKETS = [0, 1, 2];

const ServerIcon: React.FC = () => (
  <svg width="46" height="60" viewBox="0 0 46 60" fill="none" className="shrink-0">
    {[0, 1, 2].map((slot) => (
      <g key={slot}>
        <rect
          x="1"
          y={1 + slot * 19.5}
          width="44"
          height="18"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="8" cy={10 + slot * 19.5} r="1.75" fill="currentColor" />
        <path
          d={`M15 ${10 + slot * 19.5}h24`}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.45"
        />
      </g>
    ))}
  </svg>
);

interface DesktopIconProps {
  /** No 100% a tela acende: a resposta chegou. */
  lit: boolean;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ lit }) => (
  <svg width="66" height="60" viewBox="0 0 66 60" fill="none" className="shrink-0">
    <rect
      x="1"
      y="1"
      width="64"
      height="44"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill={lit ? "var(--color-os2)" : "none"}
      fillOpacity={lit ? 0.9 : 0}
      className="transition-[fill-opacity] duration-200"
    />
    <path
      d="M33 45v7M22 59h22"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Cortina de carregamento: um servidor entregando a resposta a um desktop, com
 * a barra e a porcentagem no cabo entre os dois.
 *
 * Renderiza também no servidor, de propósito. Se ela só existisse depois da
 * montagem, o visitante veria o hero por um instante antes de ser coberto — que
 * é pior do que não ter intro. Quem não deve vê-la (já viu nesta sessão, ou pediu
 * movimento reduzido) não vê nem um quadro, porque o script inline do _document
 * marca data-intro="seen" no <html> antes da primeira pintura e o CSS esconde a
 * cortina por esse atributo. O React só chega depois, para desmontar.
 */
const Intro: React.FC = () => {
  const { t } = useTranslation("common");

  // null enquanto não se sabe: a decisão depende de matchMedia e sessionStorage,
  // que só existem no cliente. Decidir no primeiro render daria mismatch de
  // hidratação, porque o servidor não tem como saber a resposta.
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const { percent, stage, done } = useIntroProgress(enabled === true);

  // "leaving" é o wipe (desliza pra cima); "gone" desmonta. Separados porque o
  // elemento precisa continuar no DOM durante a transição.
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const skip =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      readSeen();

    if (skip) {
      setEnabled(false);
      setGone(true);
      return;
    }

    setEnabled(true);
  }, []);

  // A trava de rolagem depende de `gone`, não do ciclo de vida do componente:
  // quando a cortina sai ele passa a devolver null, mas continua montado, então
  // um cleanup de unmount nunca rodaria e a página ficaria travada para sempre.
  useEffect(() => {
    if (enabled !== true) return;

    // Sem isso a coreografia de 300vh do hero avança por trás da cortina e o
    // visitante sai dela já no meio da narrativa.
    document.body.style.overflow = gone ? "" : "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [enabled, gone]);

  useEffect(() => {
    if (!done) return;

    const flash = window.setTimeout(() => setLeaving(true), FLASH_MS);
    const unmount = window.setTimeout(() => {
      setGone(true);
      window.scrollTo(0, 0);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Storage bloqueado (modo privado, cookies off): a intro simplesmente
        // volta na próxima navegação. Não é motivo para quebrar a página.
      }
    }, FLASH_MS + WIPE_MS);

    return () => {
      window.clearTimeout(flash);
      window.clearTimeout(unmount);
    };
  }, [done]);

  if (gone) return null;

  return (
    // z-60 e não z-50: o Header também é z-50 e vem depois no DOM, então no
    // empate ele ganharia e apareceria por cima da cortina.
    <div
      aria-hidden
      data-intro-curtain
      className={`fixed inset-0 z-60 flex items-center justify-center bg-ink transition-transform ease-[var(--ease-out-quint)] ${
        leaving ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ transitionDuration: `${WIPE_MS}ms` }}
    >
      <div className="flex w-full max-w-3xl flex-col items-center gap-7 px-6">
        <div className="flex w-full items-center gap-4 text-fg-muted sm:gap-8">
          <ServerIcon />

          {/* O cabo. A porcentagem fica sobre ele, centrada. */}
          <div className="relative min-w-0 flex-1">
            <p className="mb-4 text-center font-mono text-[clamp(1.5rem,5vw,2rem)] leading-none text-fg">
              {percent}%
            </p>

            <div className="relative h-px w-full bg-line">
              <div
                className="absolute inset-y-0 left-0 bg-os2"
                style={{ width: `${percent}%` }}
              />

              {PACKETS.map((packet) => (
                <span
                  key={packet}
                  className="intro-packet absolute top-1/2 left-0 block h-1 w-1 -translate-y-1/2 rounded-full bg-om3"
                  style={{ animationDelay: `${packet * 0.45}s` }}
                />
              ))}
            </div>
          </div>

          <DesktopIcon lit={percent >= 100} />
        </div>

        <p className="type-label text-center text-fg-muted">{t(STAGE_KEYS[stage])}</p>
      </div>
    </div>
  );
};

export default Intro;
