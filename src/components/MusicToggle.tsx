import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";

// Alturas de repouso das três barras — só usadas enquanto pausado, já que
// tocando a animação .music-bar assume o controle via scaleY.
const BAR_HEIGHTS = ["40%", "100%", "65%"];
const BAR_DELAYS = ["0s", "0.15s", "0.3s"];

// Navegador nenhum deixa áudio com som começar sem interação do usuário —
// isso escuta a primeira interação em qualquer lugar da página (não só o
// botão) pra começar a tocar sozinho assim que possível.
const FIRST_INTERACTION_EVENTS = [
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
  "scroll",
] as const;

export default function MusicToggle() {
  const { t } = useTranslation("common");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const startOnFirstInteraction = () => {
      FIRST_INTERACTION_EVENTS.forEach((event) =>
        window.removeEventListener(event, startOnFirstInteraction),
      );

      const audio = audioRef.current;
      if (!audio) return;

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Bloqueado mesmo assim — o botão continua disponível pro clique manual.
        });
    };

    FIRST_INTERACTION_EVENTS.forEach((event) =>
      window.addEventListener(event, startOnFirstInteraction, { passive: true }),
    );

    return () => {
      FIRST_INTERACTION_EVENTS.forEach((event) =>
        window.removeEventListener(event, startOnFirstInteraction),
      );
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // .play() pode rejeitar (arquivo ausente, política de autoplay do
    // navegador) — falha silenciosa, o botão só volta a mostrar "pausado".
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/background.mp3" loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={t(
          isPlaying ? "music.pause" : "music.play",
          isPlaying ? "Pause background music" : "Play background music",
        )}
        aria-pressed={isPlaying}
        className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line-soft bg-surface/80 backdrop-blur-md transition-opacity hover:opacity-85"
      >
        <span aria-hidden className="flex h-4 items-end gap-0.75">
          {BAR_HEIGHTS.map((height, index) => (
            <span
              key={index}
              className={`w-0.75 rounded-full bg-om3 ${isPlaying ? "music-bar" : ""}`}
              style={{ height, animationDelay: BAR_DELAYS[index] }}
            />
          ))}
        </span>
      </button>
    </>
  );
}
