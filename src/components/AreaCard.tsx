import { useTranslation } from "next-i18next";

interface AreaCardProps {
  /** "01" | "02" | "03" — decorativo, leva aria-hidden. */
  index: string;
  /** Chave do locale: "infra" | "web2" | "web3". */
  areaKey: string;
}

/**
 * O conteúdo de uma área, sem contêiner. Devolve um fragmento de propósito:
 * o hero mostra as mesmas quatro informações em dois layouts diferentes, então
 * quem usa é dono do <li>, do grid e do padding — aqui mora só o que se lê.
 *
 * A numeração é a régua de eventos do traço de OTDR que ocupava esta coluna
 * antes: o gráfico saiu, a gramática do instrumento ficou.
 */
const AreaCard: React.FC<AreaCardProps> = ({ index, areaKey }) => {
  const { t } = useTranslation("common");

  return (
    <>
      <span aria-hidden className="type-label text-om3">
        {index}
      </span>

      <h2 className="type-display m-0 text-[1.375rem] text-fg">
        {t(`areas.${areaKey}.title`)}
      </h2>

      <p className="m-0 text-[0.9375rem] leading-relaxed text-fg-muted">
        {t(`areas.${areaKey}.desc`)}
      </p>

      {/* mt-auto alinha a stack pela base quando as colunas têm alturas
          diferentes; num contêiner de altura própria é inofensivo. */}
      <p className="m-0 mt-auto pt-3 font-mono text-[0.6875rem] leading-relaxed tracking-[0.14em] text-fg-muted/75">
        {t(`areas.${areaKey}.stack`)}
      </p>
    </>
  );
};

export default AreaCard;
