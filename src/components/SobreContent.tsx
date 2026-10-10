import SobreIntro from "@/components/sobre/SobreIntro";
import SobreHighlights from "@/components/sobre/SobreHighlights";
import SobreTimeline from "@/components/sobre/SobreTimeline";
import SobreSkills from "@/components/sobre/SobreSkills";
import SobreCta from "@/components/sobre/SobreCta";

/**
 * Corpo da página /sobre (ver src/pages/sobre.tsx), só composição. Diferente
 * de /trabalhos, a abertura traz o próprio cabeçalho (SobreIntro) porque a
 * foto fica ao lado do título; cada bloco mora em src/components/sobre/.
 */
const SobreContent: React.FC = () => (
  <div className="flex flex-col gap-14 lg:gap-20">
    <SobreIntro />
    <SobreHighlights />
    <SobreTimeline />
    <SobreSkills />
    <SobreCta />
  </div>
);

export default SobreContent;
