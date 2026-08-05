# Música de fundo — toggle flutuante

Data: 2026-08-04

## Contexto

Pedido do usuário: adicionar música de fundo ao site, inspirado no padrão comum em
sites Awwwards/FWA (ex.: robin-thomas.me) — um ícone fixo na tela que liga/desliga
uma trilha e sinaliza visualmente quando está tocando.

## Decisões

- **Componente**: `src/components/MusicToggle.tsx`, montado em `_app.tsx` ao lado
  de `<Component>` (não dentro de `index.tsx`). Isso garante que o player sobrevive
  à troca de idioma (`router.push` remonta a página, não o `_app`) e a qualquer
  navegação client-side, mantendo reprodução e posição contínuas.
- **Elemento de áudio**: `<audio loop preload="none">` controlado via `useRef` +
  estado `isPlaying` (default `false`). Sem autoplay — navegadores bloqueiam áudio
  com som sem interação do usuário; o único fluxo viável é começar pausado e o
  clique do usuário iniciar o play. `.play()` retorna Promise; rejeição (arquivo
  ausente, bloqueio do navegador) é capturada silenciosamente e o estado volta a
  `false`.
- **Arquivo de áudio**: `public/audio/background.mp3`. A pasta é criada por esta
  implementação; o arquivo real é adicionado pelo usuário depois. Ausência do
  arquivo não quebra o build (asset estático referenciado só em runtime); só faz o
  `.play()` falhar silenciosamente até o arquivo existir.
- **Posição**: `fixed bottom-6 right-6`, `z-40` — abaixo do Header (`z-50`) e da
  cortina do Intro (`z-60`), então fica coberto automaticamente durante o
  carregamento sem precisar ler `introPhase`/`contentRevealed`. Nenhum outro
  elemento fixo ocupa hoje esse canto.
- **Visual**: botão circular, `bg-surface/80 backdrop-blur border border-line-soft`,
  ícone de 3 barras verticais em `om3` (aqua secundário — `os2` amarelo fica
  reservado para o CTA primário do WhatsApp). Pausado: barras estáticas em alturas
  diferentes. Tocando: cada barra anima altura via `@keyframes` com
  `animation-delay` escalonado, efeito de equalizador. Sob
  `prefers-reduced-motion`, a animação é neutralizada pelo bloco global já
  existente em `globals.css` — nenhuma lógica extra necessária.
- **Acessibilidade/i18n**: `aria-label` muda com o estado — duas chaves novas em
  `common.json` (pt/en): `music.play` e `music.pause`.

## Fora de escopo

- Controle de volume ou barra de progresso — só play/pause.
- Autoplay ou qualquer tentativa de contornar a política de autoplay dos
  navegadores.
- Pausar automaticamente ao abrir o `NavRootModal` — a música continua tocando por
  baixo do modal.

## Arquivos afetados

- `src/components/MusicToggle.tsx` (novo)
- `src/pages/_app.tsx` (monta o componente)
- `public/locales/pt/common.json`, `public/locales/en/common.json` (chaves `music.play`/`music.pause`)
- `public/audio/` (pasta nova, arquivo real adicionado pelo usuário)
