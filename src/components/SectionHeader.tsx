type SectionHeaderProps = {
  /** Rótulo curto em mono, na régua. Identifica a seção como uma etiqueta de painel. */
  label: string;
  title: string;
  description?: string;
};

/**
 * Régua rotulada + título. Substitui os <hr> soltos que separavam as seções:
 * a linha agora carrega informação em vez de só ocupar espaço.
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({ label, title, description }) => (
  <header className="mb-12 lg:mb-16">
    <div className="flex items-center gap-4">
      <span className="type-label text-os2">{label}</span>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>

    <h2 className="type-display type-section measure mt-7 mb-0 text-fg">{title}</h2>

    {description && <p className="measure mt-5 mb-0 text-fg-muted">{description}</p>}
  </header>
);

export default SectionHeader;
