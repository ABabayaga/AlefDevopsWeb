import AreaCard from "@/components/AreaCard";

/**
 * As três frentes de trabalho, no fim do hero: Web2 é a frente principal e
 * ganha uma faixa em destaque; Web3 e Infraestrutura seguem compactas, lado
 * a lado, abaixo dela.
 *
 * A numeração 01/02/03 é a régua de eventos do traço de OTDR que ocupava esta
 * coluna antes — o gráfico saiu, a gramática do instrumento ficou. Ela segue
 * a ordem de leitura da página, não um id fixo por tema.
 */

const compactAreas = [
  { id: "02", key: "web3" },
  { id: "03", key: "infra" },
] as const;

const ExpertiseAreas: React.FC = () => {
  // gap-px sobre bg-line: o filete entre as áreas é o próprio fundo aparecendo
  // pelo gap, então o mobile vira uma coluna com régua horizontal sem regra nova.
  //
  // O px-3 é só do mobile e some no sm: ali a coluna encosta na margem da
  // página e o texto ficava colado na borda da tela. Os filetes continuam de
  // ponta a ponta — quem recua é o conteúdo. Do sm pra cima o grid já resolve o
  // espaçamento pelo px-6 com as pontas zeradas, e um recuo extra desalinharia
  // as áreas do resto da página.
  //
  // A margem de topo maior no mobile é o espaço em que o globo do hero estático
  // aparece: os blocos abaixo são bg-ink e tapam a cena, então encurtá-la é
  // encurtar o globo.
  return (
    <div className="mt-28 sm:mt-16 lg:mt-20">
      <div className="flex flex-col gap-4 border-t border-line bg-ink px-3 py-8 sm:px-0 sm:py-10">
        <AreaCard index="01" areaKey="web2" variant="featured" />
      </div>

      <ul className="m-0 grid list-none gap-px border-t border-line bg-line p-0 sm:grid-cols-2">
        {compactAreas.map((area) => (
          <li
            key={area.id}
            className="flex flex-col gap-3 bg-ink px-3 py-7 sm:px-6 sm:first:pl-0 sm:last:pr-0"
          >
            <AreaCard index={area.id} areaKey={area.key} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpertiseAreas;
