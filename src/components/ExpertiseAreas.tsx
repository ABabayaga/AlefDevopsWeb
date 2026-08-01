import AreaCard from "@/components/AreaCard";

/**
 * As três frentes de trabalho, lado a lado no fim do hero.
 *
 * A numeração 01/02/03 é a régua de eventos do traço de OTDR que ocupava esta
 * coluna antes — o gráfico saiu, a gramática do instrumento ficou.
 */

const areas = [
  { id: "01", key: "infra" },
  { id: "02", key: "web2" },
  { id: "03", key: "web3" },
] as const;

const ExpertiseAreas: React.FC = () => {

  // gap-px sobre bg-line: o filete entre as áreas é o próprio fundo aparecendo
  // pelo gap, então o mobile vira uma coluna com régua horizontal sem regra nova.
  return (
    <ul className="m-0 mt-16 grid list-none gap-px border-t border-line bg-line p-0 sm:grid-cols-3 lg:mt-20">
      {areas.map((area) => (
        <li
          key={area.id}
          className="flex flex-col gap-3 bg-ink py-7 sm:px-6 sm:first:pl-0 sm:last:pr-0"
        >
          <AreaCard index={area.id} areaKey={area.key} />
        </li>
      ))}
    </ul>
  );
};

export default ExpertiseAreas;
