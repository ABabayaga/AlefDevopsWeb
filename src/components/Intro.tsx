import { useTranslation } from "next-i18next";
import BrandLogo from "@/components/BrandLogo";
import { MORPH_MS, type IntroPhase } from "@/hooks/useIntroSequence";

/** Chaves de locale, na ordem das faixas de porcentagem do hook. */
const STAGE_KEYS = [
  "intro.connecting",
  "intro.handshake",
  "intro.receiving",
  "intro.ready",
] as const;

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

interface IntroProps {
  phase: IntroPhase;
  /** Válido durante "pending"/"loading"; nas fases seguintes não é mais lido. */
  percent: number;
  stage: number;
}

/**
 * Cortina de carregamento: um servidor entregando a resposta a um desktop, com
 * a barra e a porcentagem no cabo entre os dois — que dá lugar ao logo
 * centralizado e depois ao Header, sem nunca desaparecer via slide.
 *
 * `phase` vem de useIntroSequence, levantado até index.tsx (Header e Hero
 * também dependem dele). Renderiza também no servidor, de propósito: se ela
 * só existisse depois da montagem, o visitante veria o hero por um instante
 * antes de ser coberto — que é pior do que não ter intro. Quem não deve vê-la
 * (já viu nesta sessão, ou pediu movimento reduzido) não vê nem um quadro,
 * porque o script inline do _document marca data-intro="seen" no <html> antes
 * da primeira pintura e o CSS esconde a cortina por esse atributo. O React só
 * chega depois, com phase já em "done".
 */
const Intro: React.FC<IntroProps> = ({ phase, percent, stage }) => {
  const { t } = useTranslation("common");

  if (phase === "done") return null;

  // Ícones/barra somem em fade assim que o logo entra — a cortina continua
  // opaca (bg-ink) o tempo todo, só troca o que mostra por cima.
  const showLoading = phase === "pending" || phase === "loading";
  // A cópia grande do logo só existe aqui durante "reveal". Ao entrar em
  // "morphing" ela deixa de ser renderizada e o Header passa a montar a sua
  // com o mesmo layoutId — é essa troca de árvore que o Framer Motion lê como
  // um único elemento migrando de posição, não duas animações independentes.
  const showLogo = phase === "reveal";

  return (
    // z-60 e não z-50: o Header também é z-50 e vem depois no DOM, então no
    // empate ele ganharia e apareceria por cima da cortina.
    <div
      aria-hidden
      data-intro-curtain
      className={`fixed inset-0 z-60 bg-ink transition-opacity ease-[var(--ease-out-quint)] ${
        phase === "morphing" ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${MORPH_MS}ms` }}
    >
      {/* Cada camada centraliza a si mesma via absolute inset-0, em vez de
          serem irmãs numa mesma linha flex — senão, enquanto o bloco de
          loading ainda ocupa espaço (só com opacity-0), ele empurra o logo
          para fora do centro real da tela junto com justify-center. */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          showLoading ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
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

      {showLogo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <BrandLogo size="lg" layoutId="brand-logo" reveal />
        </div>
      )}
    </div>
  );
};

export default Intro;
