import { useTranslation } from "next-i18next";

interface AreaCardProps {
  /** "01" | "02" | "03" — decorativo, leva aria-hidden. */
  index: string;
  /** Chave do locale: "infra" | "web2" | "web3". */
  areaKey: string;
  /**
   * "compact" (default) usa título/índice no tamanho e cor originais.
   * "featured" aumenta o título e troca o índice para `os2` — é só ênfase
   * visual, usada hoje pelo bloco do Web2. A lista de sub-itens em
   * `areas.<key>.items` é independente disso: toda área tem uma e ela sempre
   * renderiza, em `auto-fit` em vez de um breakpoint fixo porque a largura
   * real vem do contêiner que cada consumidor passa (banda larga em
   * ExpertiseAreas, caixa estreita em CircuitRoots), não da viewport.
   */
  variant?: "compact" | "featured";
  /**
   * Corta a lista de sub-itens nos N primeiros. Usado só por CircuitRoots: a
   * caixa do planeta tem largura e altura fixas (overflow-hidden no
   * container), então a lista completa (até 6 itens) não cabe — a versão
   * estática (ExpertiseAreas), com a banda em largura livre, não passa isso.
   */
  maxItems?: number;
}

/**
 * O conteúdo de uma área, sem contêiner. Devolve um fragmento de propósito:
 * o hero mostra as mesmas informações em layouts diferentes, então quem usa
 * é dono do <li>, do grid e do padding — aqui mora só o que se lê.
 *
 * A numeração é a régua de eventos do traço de OTDR que ocupava esta coluna
 * antes: o gráfico saiu, a gramática do instrumento ficou.
 */
const AreaCard: React.FC<AreaCardProps> = ({ index, areaKey, variant = "compact", maxItems }) => {
  const { t } = useTranslation("common");
  const featured = variant === "featured";
  const allItems = t(`areas.${areaKey}.items`, { returnObjects: true }) as string[];
  const items = maxItems ? allItems.slice(0, maxItems) : allItems;

  return (
    <>
      <span aria-hidden className={`type-label ${featured ? "text-os2" : "text-om3"}`}>
        {index}
      </span>

      <h2
        className={`type-display m-0 text-fg ${
          featured ? "text-[1.5rem] lg:text-[1.75rem]" : "text-[1.375rem]"
        }`}
      >
        {t(`areas.${areaKey}.title`)}
      </h2>

      <p className="m-0 text-[0.9375rem] leading-relaxed text-fg-muted">
        {t(`areas.${areaKey}.desc`)}
      </p>

      {items && (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-x-4 gap-y-1.5 p-0">
          {items.map((item) => (
            <li key={item} className="flex gap-1.5 text-[0.8125rem] leading-snug text-fg-muted">
              <span aria-hidden className="text-os2">
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* mt-auto alinha a stack pela base quando as colunas têm alturas
          diferentes; num contêiner de altura própria é inofensivo. */}
      <p className="m-0 mt-auto pt-3 font-mono text-[0.6875rem] leading-relaxed tracking-[0.14em] text-fg-muted/75">
        {t(`areas.${areaKey}.stack`)}
      </p>
    </>
  );
};

export default AreaCard;
