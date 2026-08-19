import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { askAssistant } from "@/lib/assistant";
import { whatsappHref } from "@/lib/whatsapp";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AssistantChatProps {
  open: boolean;
  onClose: () => void;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ open, onClose }) => {
  const { t } = useTranslation("common");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setError(false);
    setIsLoading(true);

    try {
      const { answer } = await askAssistant(question);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-chat-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-[min(640px,85vh)] w-full max-w-md flex-col rounded-2xl border border-line bg-surface"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4">
          <div>
            <h2 id="assistant-chat-title" className="type-display text-lg text-fg">
              {t("assistant_chat.title")}
            </h2>
            <p className="mt-1 text-sm text-fg-muted">{t("assistant_chat.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("assistant_chat.close")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-fg-muted transition hover:border-os2 hover:text-fg"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-os2 text-ink"
                    : "bg-raised text-fg"
                }`}
              >
                {message.content}
              </p>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <p className="max-w-[85%] rounded-xl bg-raised px-4 py-2 text-sm text-fg-muted">
                {t("assistant_chat.sending")}
              </p>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-xl bg-raised px-4 py-2 text-sm text-fg">
                <p>{t("assistant_chat.error")}</p>
                <a
                  href={whatsappHref(t("hero_whatsapp_message"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-os2 underline"
                >
                  {t("assistant_chat.error_whatsapp_cta")}
                </a>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-line-soft px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("assistant_chat.placeholder")}
            disabled={isLoading}
            className="flex-1 rounded-full border border-line bg-ink px-4 py-2 text-sm text-fg outline-none transition focus:border-os2 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="type-label shrink-0 rounded-full bg-os2 px-4 py-2 text-ink transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {t("assistant_chat.send")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssistantChat;
