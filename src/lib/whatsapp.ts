// wa.me só aceita dígitos, com DDI e DDD e sem sinais de pontuação.
export const WHATSAPP_NUMBER = "5567981846847";

/** `message` é o texto já traduzido — o encode é responsabilidade daqui. */
export function whatsappHref(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
