/** Entrada e saída dos blocos coreografados. */
export function reveal(visible: boolean): string {
  return `transition-[opacity,transform] duration-700 ease-[var(--ease-out-quint)] ${
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
  }`;
}
