# Hero: malha de rede animada (three.js)

Data: 2026-07-30

## Problema

O hero de hoje é estático. O OTDR — única assinatura visual autoral do site — foi removido
no design anterior (`2026-07-30-hero-areas-de-experiencia-design.md`), e o que sobrou como
atmosfera é um halo radial em `radial-gradient`. A identidade passou a viver só no
vocabulário: amarelo OS2, aqua OM3, rótulos em mono caixa-alta.

O objetivo é devolver assinatura visual ao hero com uma animação em WebGL, sem que ela
volte a competir com o texto — que foi exatamente o motivo da remoção do OTDR.

## Decisões

| Decisão | Escolha |
|---|---|
| Papel da animação | Fundo atmosférico — o texto continua protagonista absoluto |
| Motivo visual | Malha de rede: nós à deriva ligados por linhas conforme a distância |
| Extensão | Toda a `<section>` do hero, incluindo a faixa de `ExpertiseAreas` |
| Biblioteca | `three` puro, sem `@react-three/fiber` nem `drei` |
| Reação a mouse/scroll | Não |
| Halo radial atual | Permanece, por cima da malha, como vinheta de contraste |

O motivo "malha de rede" foi escolhido por falar às três áreas ao mesmo tempo — topologia
serve a infraestrutura, a web2 e a web3 — em vez de privilegiar uma delas.

`react-three-fiber` foi descartado: soma ~40KB sobre o `three` e um modelo mental novo num
repo sem nenhuma dependência 3D, e só se paga quando há uma cena inteira para gerenciar.
Aqui é um efeito só.

Canvas 2D puro foi considerado e descartado por decisão do autor: custaria 0KB de
dependência contra ~110–150KB gzipped do `three`, mas não entrega profundidade real. O
`sizeAttenuation` do `THREE.Points` — nós mais distantes desenhados menores — é a
contrapartida que justifica o peso.

## Arquitetura

### `src/components/NetworkMesh.tsx` (novo)

Isolado do `Hero` para que o `Hero` continue legível de uma olhada, no mesmo espírito de
`ExpertiseAreas`.

Um `useEffect` monta a cena dentro de um `<div ref>` posicionado em `absolute inset-0`:

- `WebGLRenderer` com `alpha: true` (o fundo é o `ink` da página, não uma cor da cena) e
  `setPixelRatio(Math.min(devicePixelRatio, 2))`
- `PerspectiveCamera` — a perspectiva é o que produz o parallax de tamanho
- `THREE.Points` — os nós
- `THREE.LineSegments` — as ligações

**Nós.** Distribuídos num volume, cada um com uma velocidade lenta em três eixos e wrap nas
bordas do volume, de modo que o movimento seja contínuo e sem "reinício" perceptível.
`PointsMaterial` com `vertexColors: true`, misturando aqua OM3 (maioria) e amarelo OS2
(cerca de 1 em 6), `sizeAttenuation: true`, `transparent: true` e `depthWrite: false`.

**Ligações.** `BufferGeometry` pré-alocada no número máximo de conexões e ajustada por
frame com `setDrawRange()` — a geometria nunca é recriada, só reescrita. O par é ligado
quando a distância cai abaixo de `LINK_DISTANCE`.

O fade por distância é feito **multiplicando a cor do vértice pelo fator de proximidade**,
não por alpha por vértice. `LineBasicMaterial` com `vertexColors` só aceita RGB; sobre o
`ink` (`#070b10`) escurecer a cor é visualmente indistinguível de reduzir o alpha, e evita
um `ShaderMaterial` custom.

O loop de distâncias é O(n²): 90 nós dão 4.005 pares por frame, custo irrelevante. Nenhuma
estrutura espacial é necessária nessa escala.

**Constantes no topo do arquivo**, no padrão do `WHATSAPP_NUMBER` em `Hero.tsx`:

```ts
const NODE_COUNT_DESKTOP = 90;
const NODE_COUNT_MOBILE = 40;   // abaixo de 640px
const LINK_DISTANCE = 130;
// Espelham --color-os2 e --color-om3 do @theme em globals.css; mudou lá, muda aqui.
const COLOR_OS2 = 0xf4c542;
const COLOR_OM3 = 0x22d3c5;
```

Os valores numéricos (contagem, distância, velocidade, tamanho de ponto, opacidade global)
são pontos de partida — a calibração final é feita no navegador, não no papel.

### `src/components/sections/Hero.tsx` (alterado)

Uma importação e uma linha de JSX:

```tsx
const NetworkMesh = dynamic(() => import("@/components/NetworkMesh"), { ssr: false });
```

`<NetworkMesh />` entra como primeiro filho da `<section className="relative
overflow-hidden">`, **antes** do `<div>` do halo radial — a malha fica atrás, o halo por
cima. O `<div>` de conteúdo já é `relative`, então continua na frente sem mudança.

O halo radial existente permanece e passa a ter uma segunda função: é a vinheta que
garante o contraste da headline sobre a malha, e é o fallback visual quando a malha não
monta.

`ssr: false` mantém o `three` fora do JS da primeira pintura e fora do HTML estático.

### Sem mudanças em

`globals.css` (nenhum token ou keyframe novo), os locales (nenhuma string nova — os dois
arquivos continuam key-for-key em sincronia), `ExpertiseAreas`, `Header`, `Footer`.

## Performance e degradação

| Condição | Comportamento |
|---|---|
| `prefers-reduced-motion: reduce` | Monta a cena e renderiza **um frame estático**, sem RAF |
| WebGL indisponível | Não monta nada; o halo radial é o fallback |
| Aba oculta (`visibilitychange`) | Pausa o RAF |
| Section fora do viewport (`IntersectionObserver`) | Pausa o RAF |
| Viewport < 640px | `NODE_COUNT_MOBILE` em vez de `NODE_COUNT_DESKTOP` |
| Resize | Debounce; reajusta câmera, renderer e volume dos nós |

A contagem de nós é decidida **uma vez, na montagem**, e não muda no resize: cruzar os
640px girando o celular não recria os buffers. Só o volume e a câmera se readaptam.

A escolha de renderizar um frame estático sob `prefers-reduced-motion` — em vez de não
renderizar nada — é deliberada: a regra do usuário é sobre movimento, e a malha parada
ainda cumpre o papel de textura de fundo.

O `useEffect` retorna cleanup completo: cancela o RAF, remove os listeners, chama
`dispose()` nas geometrias, materiais, texturas e no renderer, e remove o canvas do DOM.

## Acessibilidade

- A camada leva `aria-hidden` e `pointer-events-none`
- Nenhuma string nova, portanto nada a traduzir
- A headline e o `hero_sub` precisam manter contraste AA sobre a malha. Se não mantiverem,
  quem cede é a opacidade da malha — nunca o texto

## Verificação

Não há test runner no projeto. Verificar é:

1. `npm run build` passa
2. Comparar o tamanho reportado da rota `/` no output do build, antes e depois, e registrar
   o delta real do `three` em vez de confiar na estimativa de 110–150KB
3. `npm run dev` e conferir o hero em desktop e em ~375px de largura
4. Forçar `prefers-reduced-motion: reduce` no DevTools e confirmar o frame estático, sem
   animação
5. Trocar de idioma pelo `LanguageSwitcher` e confirmar que o hero não regrediu

## Fora de escopo

- Reação a mouse ou scroll
- Estender o canvas para além da `<section>` do hero
- Qualquer mudança nas sections desativadas (`src/components/sections/`) ou em
  `src/pages-disabled/`
