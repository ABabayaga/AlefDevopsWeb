# Hero: raízes por camada

Data: 2026-07-30
Estado: desenhado, não implementado

## Contexto

O hero coreografado de hoje ([`Hero.tsx`](../../../src/components/sections/Hero.tsx)) é uma grid de duas
colunas: texto à esquerda, uma `<ul>` de três cards à direita. O planeta de três cascas
([`PlanetScene.tsx`](../../../src/components/PlanetScene.tsx)) fica atrás, e cada card entra por fade
quando o scroll cruza o limiar da sua camada.

O problema é que o planeta e os cards não se falam. As cascas abrem, os cards aparecem, e nada
na tela diz que o card "Infraestrutura" descreve o núcleo amarelo e não a superfície aqua. A
associação existe só na cabeça de quem escreveu.

Este design troca a pilha de cards por uma ligação explícita: de cada casca sai uma linha que
cresce com o scroll até o bloco de texto daquela camada.

## O que muda

Só o ramo coreografado do hero (desktop, sem `prefers-reduced-motion`). O ramo estático —
mobile, movimento reduzido e o HTML que o servidor entrega — continua sendo eyebrow, `<h1>`,
sub, CTA e `<ExpertiseAreas />`, sem uma linha de diferença. `AreaCard` continua servindo aos
dois layouts, que é para o que ele foi feito.

## Decisões

| Questão | Escolha | Por quê |
|---|---|---|
| Onde ficam os tópicos | Radial: ao redor do planeta | O bloco fica perto da casca que descreve; a ligação vira curta e óbvia |
| Como a raiz cresce | Presa ao scroll (scrub) | Cresce e recolhe com o dedo, na mesma janela em que a casca abre |
| Onde a raiz nasce | Ângulo fixo na tela, raio acompanhando a casca | Sem tremor de rotação, e a origem fica colada na borda da camada |
| Traçado | Ortogonal, cotovelos de 90° | Lê como patch panel / trilha de PCB, dentro da linguagem de NOC do site |
| Título do hero | Aparece no início e sai ao rolar | Ocupa o mesmo canto que o bloco de Infraestrutura |
| Técnica | SVG sobreposto em DOM | Herda os tokens de cor, casa com o texto (que também é DOM) e sobrevive sem WebGL |

Descartados: linhas dentro do `three` (obrigaria a sincronizar coordenadas de WebGL com
coordenadas de DOM a cada frame, e as raízes sumiriam junto com o planeta quando não há WebGL);
canvas 2D dedicado (reimplementa em imperativo o que o SVG faz declarativamente, e as cores
viram hex solto em vez de `--color-os2`).

## Arquitetura

### `src/lib/shellStages.ts` (novo)

As janelas de progresso das camadas estão hoje duplicadas em dois lugares que se vigiam por
comentário: `SHELLS` em `PlanetScene.tsx` e `STAGE_THRESHOLDS` em `useScrollProgress.ts`
("Espelham as janelas de progresso das cascas em PlanetScene — mudou lá, muda aqui"). As raízes
seriam a terceira cópia do mesmo número.

Este módulo passa a ser a fonte única:

```ts
export const LAYERS = [
  { key: "infra", color: 0xf4c542, count: 260, radius: 0.72, from: 0.10, to: 0.35, angle: 150 },
  { key: "web2",  color: 0xdde5ee, count: 380, radius: 1.20, from: 0.32, to: 0.58, angle:   5 },
  { key: "web3",  color: 0x22d3c5, count: 520, radius: 1.60, from: 0.55, to: 0.82, angle: 215 },
] as const;
```

`angle` é em graus, medido do centro da tela, sentido anti-horário a partir da direita.
`PlanetScene` importa daqui em vez de declarar `SHELLS`; `useScrollProgress` importa os limiares
derivados (abaixo); `CircuitRoots` importa tudo.

Também migram para cá as constantes de câmera (`CAMERA_FOV`, `CAMERA_Z`, `COLLAPSED_RADIUS`),
porque as raízes precisam delas para converter raio de cena em raio de tela, e ter duas cópias
disso é justamente o problema que este módulo resolve.

### `src/components/CircuitRoots.tsx` (novo)

Renderiza os três ramos e é dono do scrub. Estrutura:

- um `<svg aria-hidden>` em `absolute inset-0`, com `viewBox` em pixels (`0 0 W H`), atualizado
  no resize. Coordenadas em pixel evitam a ginástica de aspect ratio que um viewBox normalizado
  exigiria para manter o círculo das cascas circular;
- três `<path>` dentro dele, um por camada, com a cor da casca correspondente;
- três blocos de texto em HTML, posicionados em absoluto, cada um com um `<AreaCard>`.

Um `rAF` próprio lê `progressRef` e, para cada camada, calcula
`open = smoothstep(from, to, progress)` — a mesma função que o `PlanetScene` usa, importada de
`planetGeometry.ts`. Com esse valor escreve, por ramo:

- o atributo `d` do path, porque a ponta que fica no planeta se move (ver Geometria);
- `strokeDasharray` = comprimento total do traçado;
- `strokeDashoffset` = comprimento total × `(1 − open)`.

São três concatenações de string curtas e seis escritas de atributo por frame, para três paths.
Nenhum re-render do React: o texto entra por estágio, como já entra hoje.

O `rAF` liga e desliga pelo mesmo par de sinais que o `PlanetScene` usa (`IntersectionObserver`
+ `visibilitychange`), para não girar com a aba escondida.

### `src/components/sections/Hero.tsx`

O ramo coreografado perde a grid de duas colunas e a `<ul>` de cards. Vira:

```
<section h-[300vh]>
  <div sticky top-0 h-screen>
    <PlanetScene />          fundo
    <CircuitRoots />         raízes + os três blocos de texto
    <div centralizado>       eyebrow + <h1> + sub, só no estágio 0
    <div embaixo>            CTA do WhatsApp, no último estágio
    <span scroll-cue>        só no estágio 0
```

`AREA_KEYS` sai do `Hero.tsx` — quem enumera as camadas agora é `LAYERS`.

## Geometria

### Raio da âncora

O raio aparente de uma casca, como fração da altura da viewport, sai das constantes da câmera:

```
fração = tan(asin(r / CAMERA_Z)) / tan(CAMERA_FOV / 2) / 2
```

Com `CAMERA_FOV = 45°` e `CAMERA_Z = 5.2`:

| casca | raio de cena | fração da altura da tela |
|---|---|---|
| fechada (todas) | 0.67 | 15,7 % |
| Infra aberta | 0.72 | 16,9 % |
| Web2 aberta | 1.20 | 28,6 % |
| Web3 aberta | 1.60 | 39,0 % |

O raio corrente de cada camada interpola entre o fechado e o aberto por `open`, do mesmo jeito
que o `scale` do grupo no `PlanetScene`. É por isso que a raiz da Infra praticamente não desliza
e a da Web3 viaja bastante: é a própria lógica da cena, onde o núcleo quase não se move.

A âncora fica em `centro + raio_corrente × (cos angle, −sin angle)`, em pixels.

### Ponta no texto

O bloco de texto **não se move**. Tracking exato da casca levaria o bloco da Web3 a 23 % da
altura da tela para fora, o que o jogaria para fora da viewport. Então quem se move é só a ponta
do path que fica no planeta; a ponta que encosta no texto é fixa e vem de um
`getBoundingClientRect()` do bloco, medido na montagem e a cada resize. Assim a linha encosta no
lugar certo qualquer que seja a quebra de linha do título traduzido.

### Traçado

Da âncora até o bloco, em três segmentos e dois cotovelos de 90°:

```
  01
  INFRAESTRUTURA
  Fibra, POPs e monitoramento de rede física
  OTDR · NOC · Redes
  ─────────────────┐        ← este filete É o fim da raiz
                   │
                   └────┐
                        │
                        ●   ← âncora, na borda da casca
           ╭────────────────╮
          ╱     planeta      ╲
```

O último segmento horizontal termina como o filete acima do bloco de texto, e a numeração
`01`/`02`/`03` fica na junta. A raiz não aponta para o card: ela vira a régua do card. Isso
também dispensa uma borda CSS no bloco — o filete já é o traço.

O comprimento total é a soma dos três segmentos, calculada em fechado (nada de
`getTotalLength()`, que forçaria um reflow por frame).

Cor por camada, igual à da casca: `os2` na Infra, `fg` na Web2, `om3` na Web3. Espessura 1px.

## Coreografia

Os limiares de estágio de hoje (`0.1, 0.32, 0.55, 0.85`) marcam o **início** de cada casca. Com
raiz, o texto tem que chegar quando a linha chega, não quando ela parte. Os limiares passam a
ser derivados dos **fins** das janelas, mais um para a saída do título e um para o CTA:

```ts
export const STAGE_THRESHOLDS = [0.10, 0.35, 0.58, 0.82, 0.90];
```

| progresso | estágio | o que acontece |
|---|---|---|
| 0 → 0.10 | 0 | eyebrow + título + sub sobre o planeta fechado; scroll-cue visível |
| 0.10 | 1 | título sai; raiz da Infra começa a crescer |
| 0.35 | 2 | raiz da Infra chega; texto de Infraestrutura entra |
| 0.58 | 3 | raiz da Web2 chega; texto entra |
| 0.82 | 4 | raiz da Web3 chega; texto entra |
| 0.90 | 5 | CTA do WhatsApp entra, centralizado embaixo |

As janelas se sobrepõem no tempo (0.32–0.58 e 0.55–0.82), então não há momento morto: a próxima
raiz já está brotando quando a anterior termina. Rolando para cima tudo recolhe na ordem
inversa, porque `dashoffset` é função do progresso, não um evento disparado.

Os textos usam o helper `reveal()` que já existe no `Hero.tsx`, com `ease-out-quint`.

## Responsividade

O radial precisa de espaço lateral. Abaixo de 768px o ramo estático já assume, sem mudança.
Entre 768 e 1023px o coreografado roda com os blocos mais estreitos e mais colados nas bordas.
Se em teste esse intervalo ficar apertado, a saída é subir `STATIC_BREAKPOINT` para 1024 — é uma
constante só, e o ramo estático já é uma apresentação completa do mesmo conteúdo.

## Acessibilidade e degradação

- O `<svg>` inteiro leva `aria-hidden`: é decoração, e todo o conteúdo está nos blocos.
- Os blocos mantêm o `aria-hidden={!visible}` de hoje, e o CTA mantém o `tabIndex` condicional
  que existe para não deixar link invisível no fluxo de tabulação.
- Os blocos são posicionados em absoluto, então a ordem no DOM continua Infra → Web2 → Web3
  independente de onde aparecem na tela.
- `prefers-reduced-motion` cai no ramo estático, que não tem nem cena nem raiz.
- Sem WebGL o `PlanetScene` não renderiza e as raízes apontam para um centro vazio. Texto, CTA e
  navegação seguem inteiros — é a mesma degradação que a cena já tem hoje.

## Fora de escopo

- Ramificar a raiz em fios menores perto do bloco (considerado e descartado: com três raízes na
  tela compete com a própria malha do planeta).
- Âncora girando junto com o planeta (descartada: a origem passaria por trás do planeta metade
  do tempo).
- Qualquer mudança no ramo estático, no `ExpertiseAreas` ou no `AreaCard`.
- Reativar seções desligadas ou mexer em `navItems`.

## Como testar

Não há test runner. A verificação é:

1. `npm run build` compila e passa no type check. Lembrar que `npm run lint` está quebrado e sai
   com código 0 mesmo falhando, e que o build imprime `⨯ ESLint: Invalid Options` e segue — só
   erro de compilação ou de tipo quebra o build de verdade.
2. `npm run dev` e rolar o hero devagar, para cima e para baixo, conferindo que as raízes
   crescem e recolhem sem salto e que cada uma encosta no seu bloco.
3. Repetir a 1440px, 1024px e 768px de largura.
4. Estreitar abaixo de 768px e confirmar que o ramo estático assume inalterado.
5. Ligar `prefers-reduced-motion` e confirmar o mesmo.
6. Trocar o idioma no `LanguageSwitcher` e conferir que as linhas continuam encostando nos
   blocos com os textos em inglês, que quebram em alturas diferentes.
