import SobreIntro from "@/components/sobre/SobreIntro";
import SobreHighlights from "@/components/sobre/SobreHighlights";
import SobreTimeline from "@/components/sobre/SobreTimeline";
import SobreSkills from "@/components/sobre/SobreSkills";
import SobreCta from "@/components/sobre/SobreCta";
import { useGsapReveal } from "@/hooks/useGsapReveal";

/**
 * Corpo da página /sobre (ver src/pages/sobre.tsx), só composição. Diferente
 * de /trabalhos, a abertura traz o próprio cabeçalho (SobreIntro) porque a
 * foto fica ao lado do título; cada bloco mora em src/components/sobre/.
 *
 * A entrada dos blocos é uma só, aqui: cada um marca com `data-reveal` o que
 * deve aparecer, e useGsapReveal faz a cascata para a página inteira.
 */
const SobreContent: React.FC = () => {
  const scope = useGsapReveal<HTMLDivElement>();

  return (
    <div ref={scope} className="flex flex-col gap-14 lg:gap-20">
      <SobreIntro />
      <SobreHighlights />
      <SobreTimeline />
      <SobreSkills />
      <SobreCta />
    </div>
  );
};

export default SobreContent;
