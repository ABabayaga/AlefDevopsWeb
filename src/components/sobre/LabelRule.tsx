/**
 * Rótulo + régua, a mesma etiqueta de painel de SectionHeader e das categorias
 * de /trabalhos, sem o título: cada bloco de /sobre se apresenta por ela.
 */
const LabelRule: React.FC<{ label: string; id?: string }> = ({ label, id }) => (
  <div className="flex items-center gap-4">
    <span id={id} className="type-label text-os2">
      {label}
    </span>
    <span aria-hidden className="h-px flex-1 bg-line" />
  </div>
);

export default LabelRule;
