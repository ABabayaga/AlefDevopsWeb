/**
 * DESATIVADO — não está renderizado em nenhuma página.
 *
 * O endpoint que ele consome já foi consertado: o handler vive em
 * src/pages/api/send-email.js (antes estava em src/api/, fora de pages/, e por
 * isso o POST dava 404). Ele depende de SMTP_USER e SMTP_PASS no ambiente.
 * Religar é importar em index.tsx e devolver o CTA "Contato" ao Header.
 */
import { useState, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "next-i18next";
import SectionHeader from "@/components/SectionHeader";

type Status = "idle" | "sending" | "sent" | "error";

const fields = [
  { name: "name", type: "text", autoComplete: "name" },
  { name: "email", type: "email", autoComplete: "email" },
] as const;

const ContactSection: React.FC = () => {
  const { t } = useTranslation("common");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStatus("sent");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full border-0 border-b border-line bg-transparent px-0 py-3 text-fg outline-none transition-colors placeholder:text-fg-muted/50 focus:border-os2";

  return (
    <section id="contact" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeader
            label={t("contact")}
            title={t("contact_header")}
            description={t("contact_description")}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <label htmlFor={field.name} className="type-label text-fg-muted">
                {t(`form.${field.name}`)}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                value={formData[field.name]}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="type-label text-fg-muted">
              {t("form.message")}
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button
              type="submit"
              disabled={status === "sending"}
              className="type-label rounded-full bg-os2 px-7 py-3.5 text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "sending" ? t("form.sending") : t("form.send")}
            </button>

            {/* role=status para o leitor de tela anunciar o resultado sem roubar o foco */}
            <p
              role="status"
              aria-live="polite"
              className={`m-0 text-[0.9375rem] ${
                status === "error" ? "text-os2" : "text-om3"
              }`}
            >
              {status === "sent" && t("form.sent")}
              {status === "error" && t("form.error")}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
