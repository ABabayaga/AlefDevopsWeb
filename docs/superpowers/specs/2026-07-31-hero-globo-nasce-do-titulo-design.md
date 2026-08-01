# Hero: globo nasce do título

Data: 2026-07-31
Estado: desenhado, não implementado

## Contexto

No estágio 0 do hero coreografado ([`Hero.tsx`](../../../src/components/sections/Hero.tsx)), o
título (eyebrow + `<h1>` + sub) fica centralizado sobre o planeta fechado — os dois dividem o
mesmo centro de tela, porque o container sticky centraliza ambos (`items-center justify-center`).
Em telas largas isso faz o texto "atropelar" o globo: ver captura de tela anexada à conversa, onde
"sob medida." cruza por cima da malha da esfera e some visualmente contra ela.

Este design resolve isso transformando a colisão estática de hoje numa transição intencional: o
globo nasce do zero, no mesmo ponto onde o título está, enquanto o título se dissolve — como se o
texto virasse a esfera. Ao final, só o globo fica, dando ênfase às três áreas de atuação que as
raízes revelam ao rolar (ver
[`2026-07-30-hero-raizes-por-camada-design.md`](2026-07-30-hero-raizes-por-camada-design.md), que
descreve `CircuitRoots`/`shellStages.ts`, hoje implementado).

Descartada uma versão mais literal — um ponto nascendo na cauda do texto e viajando até o centro —
por dois motivos: exigiria localizar a última linha do `<h1>` traduzido (frágil: PT e EN têm
tamanhos diferentes e quebram em números de linha diferentes conforme a largura), e exigiria que
`PlanetScene.tsx` passasse a reposicionar o grupo 3D, que hoje só escala. Como o título já ocupa o
centro da tela — é o próprio problema —, nascer ali mesmo produz a mesma leitura ("o globo vem das
palavras") sem nenhuma das duas fragilidades.

## O que muda

Só o ramo coreografado do hero (desktop, sem `prefers-reduced-motion`). O ramo estático — mobile,
movimento reduzido, HTML do servidor — continua idêntico: eyebrow, `<h1>`, sub, CTA e
`<ExpertiseAreas />`, sem animação de entrada nenhuma.

## Decisões

| Questão | Escolha | Por quê |
|---|---|---|
| Gatilho da animação | Automático, disparado quando a cortina do `Intro` termina — não pelo scroll | Garante que todo visitante veja o efeito, inclusive (principalmente) na primeira visita; atrelar ao scroll deixaria o globo um pontinho até alguém rolar |
| Onde o globo nasce | No mesmo centro de tela onde o título já fica, sem deslocamento de posição | Evita medir a última linha do título e reposicionar o grupo 3D (ver Contexto) |
| Estado final do título | Dissolve e não volta — nem se o usuário rolar de volta ao topo depois | O objetivo é dar ênfase permanente ao globo/serviços, não só um efeito de entrada |
| Scroll cue | Só aparece quando o nascimento termina | Reforça a sequência: frase → globo → convite a rolar |
| Sincronia com o Intro | Callback subindo de `Intro.tsx` para `index.tsx`, descendo como prop para `Hero` | Sem isso a animação rodaria escondida atrás da cortina (mínimo 1.8s, até 6s) na primeira visita |
| Scroll durante o nascimento | Se o usuário rolar antes do nascimento terminar, ele é encerrado na hora | Rolar não pode parecer "preso" esperando uma animação de entrada |

## Arquitetura

### `src/pages/index.tsx`

Passa a guardar um estado `introGone` (`boolean`, inicia `false`) e repassa:

```
<Intro onGone={() => setIntroGone(true)} />
...
<Hero introGone={introGone} />
```

### `src/components/Intro.tsx`

Ganha uma prop opcional `onGone?: () => void`, chamada nos dois pontos onde hoje `setGone(true)`
já é chamado: no caminho de skip (`reduced-motion` ou sessão que já viu) e no `setTimeout` depois
do fade. Não muda nada do comportamento visual da cortina — só notifica quem está por fora.

### `src/hooks/useHeroBirth.ts` (novo)

Hook análogo em espírito ao `useIntroProgress.ts`, mas mais simples: não corre sozinho nem espera
promessas, só segura e depois dissolve, uma vez, quando `triggered` vira `true`.

```ts
const BIRTH_HOLD_MS = 400;  // título pleno, dá tempo de ler
const BIRTH_FADE_MS = 1200; // globo cresce / título dissolve, mesmo relógio
```

Retorna:

- `birthProgressRef: MutableRefObject<number>` — 0 a 1, atualizado por `rAF` próprio (como
  `progressRef` do scroll), lido pelo `PlanetScene` a cada frame sem re-render do React;
- `titleVisible: boolean` — `true` até `BIRTH_HOLD_MS` depois do trigger, daí falso; estado
  React normal, porque dirige uma transição CSS via `reveal()`, não um valor contínuo;
- `skipToEnd(): void` — força `birthProgressRef.current = 1` e `titleVisible = false`
  imediatamente. `Hero` chama isso assim que o scroll real começa (`stage >= 1`), para o
  nascimento nunca "seguntar" quem já quer rolar.

Antes de `triggered` virar `true`, `birthProgressRef.current` fica em `0`.

### `src/components/sections/Hero.tsx`

Ramo coreografado passa a:

- receber `introGone` via prop e alimentar `useHeroBirth(introGone)`;
- chamar `skipToEnd()` assim que `stage >= STAGE_TITLE_OUT`, além de já esconder o título pelo
  caminho que já existe hoje;
- calcular a visibilidade do bloco de título como `titleVisible && stage < STAGE_TITLE_OUT` (some
  por qualquer um dos dois motivos, sem voltar depois — `useHeroBirth` não reseta `titleVisible`
  para `true`);
- passar `birthProgressRef` para `<PlanetScene>` (só na instância não-estática; a instância do
  ramo estático em `Hero.tsx:66` continua sem essa prop);
- condicionar o `ScrollCue` a `stage === 0 && birthProgressRef.current >= 1` — só aparece com o
  scroll ainda no topo e o nascimento já concluído.

### `src/components/PlanetScene.tsx`

Ganha uma prop opcional `birthProgressRef?: MutableRefObject<number>`. Dentro de `applyProgress`:

```ts
const birth = birthProgressRef ? easeOutQuint(birthProgressRef.current) : 1;
const scale = (shell.collapsedScale + (1 - shell.collapsedScale) * open) * birth;
```

`easeOutQuint` já existe localmente no arquivo (mesma função usada pelo `useIntroProgress`, hoje
duplicada por design — nenhuma das duas depende da outra). Quando a prop não é passada (ramo
estático), `birth` é sempre `1` e nada muda em relação a hoje.

## Coreografia / timing

```
t = introGone dispara
0ms        → 400ms         → 1600ms
[título pleno] [crossfade: título 1→0, globo 0→1] [globo pleno, roots prontas]
```

- Se o usuário começar a rolar em qualquer ponto dessa janela, `skipToEnd()` zera a espera: título
  some na hora (pelo caminho de scroll que já existe), globo salta para escala plena, e a partir
  daí o scroll comanda a abertura das cascas normalmente.
- Sem WebGL, `PlanetScene` não renderiza nada (degradação já existente, ver spec de raízes) — o
  título ainda dissolve no relógio do `useHeroBirth`, porque esse timer não depende de WebGL. O
  resultado é texto que some e nenhum globo pra substituir, igual à degradação de hoje, só que
  mais cedo (1.6s em vez de esperar o primeiro scroll).
- `ScrollCue` entra só depois do nascimento — antes disso, ficar quieto é intencional: nada deve
  competir com a transição.

## Acessibilidade e degradação

- Nenhuma mudança de semântica: o bloco de título já é `aria-hidden` quando invisível, e isso
  continua valendo com o motivo adicional de esconder.
- `prefers-reduced-motion` cai no ramo estático, que nunca monta `useHeroBirth` nem recebe
  `birthProgressRef` — zero mudança de comportamento.
- Se o Intro nunca disparar `onGone` (JS quebrado a meio caminho, por exemplo) o título
  simplesmente fica no estado de hoje (visível até o scroll), porque `titleVisible` começa
  `true` e só muda quando o hook dispara.

## Fora de escopo

- Reposicionar o grupo 3D do `PlanetScene` (a versão "ponto viaja até o centro", descartada no
  Contexto).
- Qualquer mudança no ramo estático, no `ExpertiseAreas`, no `AreaCard` ou nas chaves de locale —
  não há texto novo, só coreografia.
- Persistir "já vi o nascimento" entre sessões ou recargas — ele roda de novo a cada vez que o
  `Hero` monta e o Intro termina, do mesmo jeito que a cortina do Intro roda de novo a cada sessão
  nova.
- Alterar a lógica de `CircuitRoots`/`shellStages.ts` — a abertura das cascas por scroll continua
  exatamente como está.

## Como testar

Não há test runner; a verificação é manual.

1. `npm run build` compila e passa no type check (lembrar: `npm run lint` está quebrado e sai com
   código 0 mesmo falhando).
2. `npm run dev`, abrir em aba anônima (sessionStorage limpo) para garantir a cortina do Intro
   aparecer, e conferir: cortina sai → título segura ~400ms → crossfade título/globo em ~1.2s →
   globo parado no centro, `ScrollCue` aparece.
3. Recarregar na mesma aba (Intro pulado, `onGone` dispara quase na hora) e confirmar que o
   nascimento ainda roda, só que mais cedo.
4. Rolar a página nos primeiros ~1.6s depois do Intro sair e confirmar que o título some na hora
   (sem esperar o resto da animação) e o globo salta pra escala plena sem salto visual feio.
5. Ligar `prefers-reduced-motion` e confirmar que nada do que está aqui roda — é o ramo estático
   de sempre.
6. Trocar o idioma no `LanguageSwitcher` antes de rolar, e observar o crossfade com o texto em
   inglês (linhas diferentes, mesmo comportamento).
7. Repetir a 1440px, 1024px e no breakpoint estático (abaixo de 1024px) para confirmar que só o
   ramo coreografado muda.
