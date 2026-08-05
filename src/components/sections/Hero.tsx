import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import CircuitRoots from "@/components/CircuitRoots";
import ExpertiseAreas from "@/components/ExpertiseAreas";
import NavRootReveal from "@/components/NavRootReveal";
import ScrollCue from "@/components/ScrollCue";
import { prefersStaticHero, useScrollProgress } from "@/hooks/useScrollProgress";
import type { NavModalKey } from "@/lib/navModal";
import { reveal } from "@/lib/reveal";
import { STAGE_CTA, STAGE_TITLE_OUT } from "@/lib/shellStages";
import { whatsappHref } from "@/lib/whatsapp";

// ssr:false mantém o three fora do JS da primeira pintura e do HTML estático.
const PlanetScene = dynamic(() => import("@/components/PlanetScene"), { ssr: false });

interface HeroProps {
  /** Vem de useIntroSequence: falso enquanto a cortina cobre o hero, e volta a
   *  verdadeiro um pouco depois de o logo começar a viajar pro header, pro
   *  conteúdo entrar atrás dele em vez de junto. Já nasce verdadeiro sem intro
   *  (sem JS, reduced-motion, sessão repetida) — que é o HTML do servidor. */
  contentRevealed: boolean;
  /** Clique pendente vindo do nav (Trabalhos/Sobre mim), com a origem na tela.
   *  Nulo enquanto nada foi clicado. */
  pendingTarget: { key: NavModalKey; origin: DOMRect } | null;
  /** Chamado quando a raiz chega ao planeta (ou de imediato, no branch
   *  estático, que não tem planeta pra raiz nenhuma atracar). */
  onRootArrived: (key: NavModalKey) => void;
}

const Hero: React.FC<HeroProps> = ({ contentRevealed, pendingTarget, onRootArrived }) => {
  const { t } = useTranslation("common");
  const containerRef = useRef<HTMLElement>(null);

  // Começa estático de propósito: é o que o servidor renderiza, então o HTML
  // entregue já traz headline, sub, as três áreas e o CTA. O desktop promove
  // para a versão coreografada depois de montar.
  const [isStatic, setIsStatic] = useState(true);
  useEffect(() => {
    setIsStatic(prefersStaticHero());
  }, []);

  const { progressRef, stage } = useScrollProgress(containerRef, !isStatic);

  // Sem planeta no branch estático, a raiz não tem onde atracar: o modal
  // abre na hora. No coreografado, só garante que o Hero esteja visível —
  // quem confirma que o scroll assentou é o próprio NavRootReveal.
  useEffect(() => {
    if (!pendingTarget) return;
    if (isStatic) {
      onRootArrived(pendingTarget.key);
      return;
    }
    if (window.scrollY > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pendingTarget, isStatic, onRootArrived]);

  const href = whatsappHref(t("hero_whatsapp_message"));

  // O filete à esquerda do eyebrow só faz sentido alinhado; centralizado, ele
  // vira um traço solto, então a coreografia centraliza a linha inteira.
  const eyebrow = (centered: boolean) => (
    <p
      className={`type-label mb-6 flex items-center gap-3 text-fg-muted ${
        centered ? "justify-center" : ""
      }`}
    >
      <span aria-hidden className="h-px w-8 shrink-0 bg-os2" />
      <span className="min-w-0 leading-relaxed">{t("hero_eyebrow")}</span>
    </p>
  );

  // Cria o CTA com tabIndex condicional para respeitar aria-hidden.
  // Quando oculto (aria-hidden=true), tabIndex={-1} tira o link do fluxo de
  // tabulação, evitando foco em elemento invisível e violação de WAI-ARIA APG
  // (axe-core). No ramo estático o link está sempre visível; na coreografia o
  // link é focável apenas no último estágio.
  const createCta = (isFocusable: boolean) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={isFocusable ? 0 : -1}
      className="type-label inline-block rounded-full bg-os2 px-6 py-3.5 text-ink no-underline transition-opacity hover:opacity-85"
    >
      {t("hero_whatsapp")}
    </a>
  );

  // Versão estática: mobile, prefers-reduced-motion e o HTML do servidor.
  // Mesmos textos, mesmas chaves — o que muda é só a apresentação. O bloco de
  // texto ganha a entrada de reveal() só quando há intro rodando de fato: em
  // reduced-motion/sem-JS contentRevealed já nasce true e reveal() resolve
  // pro estado visível sem nenhuma transição visível.
  if (isStatic) {
    return (
      <section className="relative overflow-hidden">
        <PlanetScene progressRef={progressRef} staticMode />

        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 lg:pt-24 lg:pb-28">
          <div
            aria-hidden={!contentRevealed}
            className={reveal(contentRevealed)}
          >
            {eyebrow(false)}
            <h1 className="type-display type-hero m-0 max-w-[18ch] text-fg">{t("title")}</h1>
            <p className="measure mt-7 text-fg-muted">{t("hero_sub")}</p>
            <div className="mt-10">{createCta(contentRevealed)}</div>
          </div>
          <ExpertiseAreas />
        </div>
      </section>
    );
  }

  // contentRevealed trava o título escondido enquanto a intro roda — depois
  // que vira true ele nunca volta a false, então a partir daí quem manda é só
  // o stage do scroll, como já era.
  const titleVisible = stage < STAGE_TITLE_OUT && contentRevealed;
  const ctaVisible = stage >= STAGE_CTA;

  return (
    // 300vh é a distância de scroll que a narrativa consome; o filho sticky é
    // a tela que fica parada enquanto isso.
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <PlanetScene progressRef={progressRef} staticMode={false} />
        <CircuitRoots progressRef={progressRef} stage={stage} />

        {pendingTarget && (
          <NavRootReveal
            key={pendingTarget.key}
            origin={pendingTarget.origin}
            onArrived={() => onRootArrived(pendingTarget.key)}
          />
        )}

        {/* Nasce ancorado à esquerda — o globo nasce deslocado à direita no
            PlanetScene e desliza ao centro junto com o scroll. O título sai
            quando a primeira raiz começa a crescer — o bloco de Infraestrutura
            ocupa o canto onde o globo já está centralizado. Centralização
            vertical por flex, não por -translate-y-1/2: essa transform
            colidiria com o translate-y que reveal() usa pro fade. */}
        <div
          aria-hidden={!titleVisible}
          className={`absolute inset-y-0 left-8 flex items-center lg:left-16 ${reveal(titleVisible)}`}
        >
          <div className="max-w-lg px-4 text-left">
            {eyebrow(false)}
            <h1 className="type-display type-hero m-0 text-fg">{t("title")}</h1>
            <p className="measure mt-7 text-fg-muted">{t("hero_sub")}</p>
          </div>
        </div>

        <div
          aria-hidden={!ctaVisible}
          className={`absolute bottom-16 left-1/2 -translate-x-1/2 ${reveal(ctaVisible)}`}
        >
          {createCta(ctaVisible)}
        </div>

        {/* bottom-28 e não bottom-8: no topo da página o filho sticky ainda não
            está pinado, então seus 100vh começam abaixo do header e transbordam
            a dobra na altura dele (~67px). O indicador só aparece nesse trecho,
            justamente onde a folga é necessária. */}
        <div
          aria-hidden
          className={`absolute bottom-28 left-1/2 -translate-x-1/2 ${reveal(stage === 0)}`}
        >
          <ScrollCue />
        </div>
      </div>
    </section>
  );
};

export default Hero;
