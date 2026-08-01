import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import CircuitRoots from "@/components/CircuitRoots";
import ExpertiseAreas from "@/components/ExpertiseAreas";
import ScrollCue from "@/components/ScrollCue";
import { useHeroBirth } from "@/hooks/useHeroBirth";
import { prefersStaticHero, useScrollProgress } from "@/hooks/useScrollProgress";
import { reveal } from "@/lib/reveal";
import { STAGE_CTA, STAGE_TITLE_OUT } from "@/lib/shellStages";
import { whatsappHref } from "@/lib/whatsapp";

// ssr:false mantém o three fora do JS da primeira pintura e do HTML estático.
const PlanetScene = dynamic(() => import("@/components/PlanetScene"), { ssr: false });

interface HeroProps {
  /** Sinal do index.tsx: a cortina do Intro já saiu. Dispara o nascimento do
   * globo — ver useHeroBirth. */
  introGone: boolean;
}

const Hero: React.FC<HeroProps> = ({ introGone }) => {
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

  // Chamado incondicionalmente (regra dos hooks) mesmo no ramo estático, que
  // simplesmente nunca lê o resultado. scrollStarted é a válvula de escape:
  // rolar antes do nascimento terminar não deve parecer que o scroll está
  // preso esperando uma animação de entrada.
  const birth = useHeroBirth(introGone, stage >= STAGE_TITLE_OUT);

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
  // Mesmos textos, mesmas chaves — o que muda é só a apresentação. Sem
  // nascimento: o planeta já entra pronto, igual a hoje.
  if (isStatic) {
    return (
      <section className="relative overflow-hidden">
        <PlanetScene progressRef={progressRef} staticMode />

        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 lg:pt-24 lg:pb-28">
          {eyebrow(false)}
          <h1 className="type-display type-hero m-0 max-w-[18ch] text-fg">{t("title")}</h1>
          <p className="measure mt-7 text-fg-muted">{t("hero_sub")}</p>
          <div className="mt-10">{createCta(true)}</div>
          <ExpertiseAreas />
        </div>
      </section>
    );
  }

  // Título some por dois motivos possíveis — o nascimento terminou, ou o
  // scroll começou — e não volta por nenhum dos dois: useHeroBirth nunca
  // reseta titleVisible para true, e stage voltar a 0 não muda isso.
  const titleVisible = birth.titleVisible && stage < STAGE_TITLE_OUT;
  const ctaVisible = stage >= STAGE_CTA;
  const scrollCueVisible = stage === 0 && birth.done;

  return (
    // 300vh é a distância de scroll que a narrativa consome; o filho sticky é
    // a tela que fica parada enquanto isso.
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <PlanetScene
          progressRef={progressRef}
          staticMode={false}
          birthProgressRef={birth.birthProgressRef}
        />
        <CircuitRoots progressRef={progressRef} stage={stage} />

        {/* O título vive sobre o planeta fechado e dissolve nele assim que o
            nascimento termina — o bloco de Infraestrutura ocupa este canto
            depois que o título já se foi. */}
        <div
          aria-hidden={!titleVisible}
          className={`relative max-w-3xl px-8 text-center ${reveal(titleVisible)}`}
        >
          {eyebrow(true)}
          <h1 className="type-display type-hero m-0 text-fg">{t("title")}</h1>
          <p className="measure mx-auto mt-7 text-fg-muted">{t("hero_sub")}</p>
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
            justamente onde a folga é necessária. Some até o nascimento
            terminar, pra nada competir com a transição título→globo. */}
        <div
          aria-hidden
          className={`absolute bottom-28 left-1/2 -translate-x-1/2 ${reveal(scrollCueVisible)}`}
        >
          <ScrollCue />
        </div>
      </div>
    </section>
  );
};

export default Hero;
