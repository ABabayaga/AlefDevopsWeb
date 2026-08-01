# Hero: planeta de cascas concêntricas dirigido por scroll

Data: 2026-07-30

Supersede parcialmente `2026-07-30-hero-network-mesh-design.md`: a malha de fundo do hero
sai e o `NetworkMesh` é deletado. A dependência `three` e a decisão de carregá-la por
`next/dynamic` com `ssr: false` permanecem.

## Problema

O hero comunica as três áreas — infraestrutura, web2 e web3 — numa faixa estática de três
colunas. A informação está lá, mas o arranjo é plano: as três áreas aparecem como uma
lista, não como uma trajetória, e o site perde a chance de mostrar que uma levou à outra.

O objetivo é que a relação entre as três áreas vire a própria forma da primeira tela: um
planeta cujas cascas concêntricas se abrem conforme o visitante desce, de dentro para fora.

## Decisões

| Decisão | Escolha |
|---|---|
| Papel da cena | Substitui o hero — ocupa a primeira tela |
| Coreografia | Cascas concêntricas abrindo do núcleo para a superfície |
| Mapeamento | Infra = núcleo, Web2 = casca do meio, Web3 = superfície |
| Headline | Cede lugar aos rótulos das áreas conforme as cascas abrem |
| CTA | Reaparece ao fim da sequência (ver "Custo aceito") |
| Driver de scroll | `sticky` do CSS + escalar de progresso à mão — 0KB novos |
| Mobile (<768px) e `reduced-motion` | Versão estática, sem scroll narrativo |
| `NetworkMesh` | Deletado |

A metáfora vira estrutura: num planeta de cascas, o raio é a trajetória — a infra sustenta a
web2, que sustenta a web3. Amarelo OS2 no núcleo e aqua OM3 na superfície fazem o gradiente
de cor ser o próprio arco da carreira.

Nota de copy: o `title` atual é *"Sites e sistemas sob medida."*. A frase *"Da fibra ao
smart contract."* — que dizia esse arco literalmente e apareceu no spec de 2026-07-30 das
áreas de experiência — foi trocada depois. A estrutura radial funciona sem ela, mas se a
headline voltar a nomear o arco, a cena e o texto passam a dizer a mesma coisa. Fica como
observação, não como requisito: **este design não altera copy.**

GSAP + ScrollTrigger (~40KB gz) e Lenis (+~10KB) foram considerados e descartados: a
coreografia inteira é dirigida por um escalar de 0 a 1, o que é uma função de `progress`,
não uma timeline. Pagar metade do peso do `three` para abstrair ~15 linhas de matemática de
scroll não se justifica. Como o progresso fica isolado num hook, migrar para ScrollTrigger
depois é local.

## Arquitetura

### `src/hooks/useScrollProgress.ts` (novo)

Recebe o ref do container e devolve dois valores com propósitos deliberadamente diferentes:

```ts
const { progressRef, stage } = useScrollProgress(containerRef);
```

- **`progressRef`** — `MutableRefObject<number>` de 0 a 1. Atualizado num listener de
  `scroll` (passivo) com dedupe por `requestAnimationFrame`. **Não causa re-render.** É o
  que o WebGL lê a cada frame.
- **`stage`** — `useState<number>` de 0 a 4, muda só ao cruzar um limiar. Cinco re-renders
  na sequência inteira, não sessenta por segundo. É o que o HTML consome.

Essa separação é a razão de o hook existir: movimento contínuo no WebGL, transições
discretas no DOM. Os rótulos não precisam de valor contínuo — precisam entrar e sair, e
isso é `transition` do CSS reagindo a uma classe.

Cálculo do progresso, a partir do `getBoundingClientRect()` do container:

```
progress = clamp(-rect.top / (rect.height - window.innerHeight), 0, 1)
```

O hook não monta nada quando a versão estática está ativa (ver "Mobile e reduced-motion").

### `src/components/PlanetScene.tsx` (novo)

`WebGLRenderer` com `alpha: true`, `PerspectiveCamera`, e um `THREE.Group` raiz levemente
inclinado no eixo X para que o planeta não seja lido de frente exata.

Dentro do grupo raiz, **três `THREE.Group`**, um por casca. Cada um contém:

- `THREE.Points` — os pontos da casca, distribuídos por **espiral de Fibonacci**.
  Distribuição aleatória em esfera empilha nos polos e o erro é visível.
- `THREE.LineSegments` — ligações curtas entre pontos vizinhos, para a casca ler como rede
  e não como poeira.

**A geometria é construída uma vez, em raio unitário, e nunca é reescrita.** As cascas são
rígidas: os pontos não derivam entre si. A animação inteira de uma casca é

```ts
shell.scale.setScalar(radius);   // radius derivado de progress
material.opacity = fade;         // idem
```

Não há loop O(n²) por frame, ao contrário do `NetworkMesh` que isto substitui. As ligações
são calculadas na montagem por varredura de pares na casca, guardadas como geometria fixa,
e acompanham a escala do grupo de graça.

Um detalhe de comportamento a favor: `PointsMaterial.size` é em unidades de mundo e **não**
é afetado pela escala do objeto. Conforme a casca expande, os pontos se espalham mas
continuam do mesmo tamanho — a casca rarefaz em vez de inchar, que é a leitura correta.

| Casca | Área | Cor | Pontos | Raio final |
|---|---|---|---|---|
| Núcleo | Infra | `--color-os2` `#f4c542` | ~260 | 0.45 |
| Meio | Web2 | `--color-fg` `#dde5ee` | ~380 | 0.75 |
| Externa | Web3 | `--color-om3` `#22d3c5` | ~520 | 1.00 |

Raios em múltiplos de uma `BASE_RADIUS` única. A casca externa leva mais pontos porque a
área cresce com o quadrado do raio; contagens iguais dariam densidades visivelmente
diferentes. Todos os números são ponto de partida, calibrados no navegador.

Em `progress = 0` as três cascas estão em escala ~0.12 — colapsadas quase no centro, lendo
como um planeta sólido.

O grupo raiz gira devagar de forma constante, **independente do scroll**: se o visitante
parar de rolar, a cena continua viva em vez de congelar.

### `src/components/sections/Hero.tsx` (reescrito)

```
<section ref={containerRef}>            h-[300vh]
  <div>                                 sticky top-0 h-screen
    <PlanetScene progressRef={...} />   camada de fundo, aria-hidden
    <div>                               conteúdo, por cima
      h1, sub, rótulos das áreas, CTA, indicador de scroll
    </div>
  </div>
</section>
```

Os três rótulos e suas descrições estão **sempre no DOM**; `stage` controla apenas as
classes de visibilidade. O scroll decide *quando* aparecem, nunca *se* existem — é isso que
mantém SEO, leitor de tela e o visitante que não rola funcionando.

### `src/components/ExpertiseAreas.tsx` (mantido)

Reaproveitado inteiro na versão estática. Nenhuma mudança.

### `src/components/Header.tsx` (alterado)

Uma entrada de WhatsApp no `navItems`, que hoje é `[]` e existe justamente como ponto de
reengate. Ver "Custo aceito".

O tipo atual é `{ href: string; label: string }[]`, pensado para âncoras internas. Um link
externo precisa de `target="_blank"` e `rel="noopener noreferrer"`, então o tipo ganha um
`external?: boolean` e o `map` — que é o mesmo nos dois lugares, barra desktop e gaveta
mobile — passa a aplicar esses atributos condicionalmente. Uma entrada, uma flag; a
estrutura de reengate não muda.

### `src/components/NetworkMesh.tsx` (deletado)

Com o planeta ocupando o hero, não há onde ele morar, e sua técnica de ligações sobrevive
nas cascas. Permanece no histórico do git.

Mantê-lo como camada ao fundo foi considerado e descartado: seriam duas cenas WebGL a
pagar, e a de trás competiria com a que importa.

## Coreografia

Janelas de progresso, com sobreposição para o movimento nunca parar. Interpolação por
`smoothstep`, não linear.

```
progress  0 ──── 0.2 ──── 0.4 ──── 0.6 ──── 0.8 ──── 1
headline  ███▓░
núcleo         ▓████▓░
meio                ░▓████▓░
externa                  ░▓████▓
CTA                                      ░▓███
```

| Elemento | Janela |
|---|---|
| Headline + sub: opacidade 1 → 0 | 0.00 – 0.15 |
| Casca núcleo (Infra) | 0.10 – 0.35 |
| Casca meio (Web2) | 0.32 – 0.58 |
| Casca externa (Web3) | 0.55 – 0.82 |
| CTA entra | 0.85 – 1.00 |

`stage`: 0 (< 0.10), 1 (< 0.32), 2 (< 0.55), 3 (< 0.85), 4 (≥ 0.85).

As transições de entrada e saída no HTML usam `--ease-out-quint`, que o design anterior
deixou órfão em `@theme` ao deletar as animações do OTDR. Isto fecha aquela ponta.

**Os rótulos acumulam.** Cada um entra na sua janela e permanece. Ao fim da sequência os
três estão visíveis junto com o CTA — o estado final é equivalente ao da versão estática,
o que também facilita conferir que as duas versões dizem a mesma coisa.

## Mobile e reduced-motion

Abaixo de 768px **ou** com `prefers-reduced-motion: reduce`: sem container de 300vh, sem
`sticky`, sem hook de scroll, sem RAF. O hero volta ao arranjo de hoje — headline, sub, CTA
e `ExpertiseAreas` empilhados — com a cena renderizando **um frame único no estado final**,
cascas já abertas, como textura de fundo.

As duas versões saem do **mesmo** `Hero.tsx`, por um ramo no topo do componente: a versão
estática dispensa o wrapper de 300vh e o `sticky`, e renderiza `ExpertiseAreas` no lugar
dos rótulos coreografados. Nada é duplicado — os mesmos textos, vindos das mesmas chaves.

Um fallback só serve os dois casos. A decisão entre versões é tomada uma vez, na montagem;
alternar por resize é ruído (girar o celular não pode remontar a cena). A troca de
`prefers-reduced-motion` durante a sessão é ouvida e degrada para a versão estática.

Sem WebGL, a cena não monta e o layout estático é o que resta — nenhum conteúdo se perde.

## Custo aceito

Com a headline cedendo lugar às áreas e o CTA entrando só em 0.85, **quem abre o site e não
rola nunca vê o botão do WhatsApp**. Isso foi levantado e a escolha foi consciente.

Duas mitigações fazem parte deste design:

1. **WhatsApp no `Header`.** O header é `sticky`, então o contato fica alcançável em
   qualquer ponto dos 300vh. O `navItems` já está lá, tipado e vazio, esperando um motivo.
2. **Volta o indicador de scroll.** Com a primeira tela virando uma cena, nada mais sinaliza
   que existe página abaixo. O `.scroll-cue` foi deletado no design anterior porque não
   havia conteúdo abaixo; agora há. É `aria-hidden` e obedece a regra global de
   `prefers-reduced-motion`.

## i18n

**Zero chaves novas.** `title`, `hero_sub`, `hero_whatsapp`, `hero_whatsapp_message`,
`hero_eyebrow` e `areas.*.title/desc/stack` já existem nos dois locales. O indicador de
scroll é decorativo e `aria-hidden`. A entrada de WhatsApp no `Header` reusa
`hero_whatsapp`. Os dois arquivos continuam key-for-key em sincronia sem trabalho.

## Acessibilidade

- A camada da cena é `aria-hidden` e `pointer-events-none`
- O `<h1>` continua único; os rótulos das áreas são `<h2>`, mantendo a hierarquia linear
- Nenhuma informação existe apenas na animação: os três rótulos e descrições estão sempre
  no DOM, e a versão estática entrega tudo sem scroll
- Os elementos ocultos por `stage` usam opacidade e `transform`, não `display: none`, mas
  recebem `aria-hidden` enquanto invisíveis para não serem lidos fora de contexto
- O scroll nativo não é sequestrado — foi o motivo de descartar Lenis
- Contraste AA da headline e dos rótulos sobre a cena. Se não fechar, quem cede é a
  opacidade da cena

## Performance

- `next/dynamic` com `ssr: false` mantém o `three` fora do JS da primeira pintura
- Geometria construída uma vez; por frame só há escala, opacidade e rotação
- ~1160 pontos somando as três cascas
- `setPixelRatio(Math.min(devicePixelRatio, 2))`
- RAF pausado com a aba oculta (`visibilitychange`) e com a section fora do viewport
  (`IntersectionObserver`)
- Listener de scroll passivo, com dedupe por RAF
- Cleanup completo no unmount: cancela RAF, remove listeners, `dispose()` em geometrias,
  materiais e renderer, remove o canvas

## Verificação

Não há test runner no projeto. Verificar é:

1. `npm run build` passa; registrar o delta de bundle
2. `npm run dev` e conferir em desktop e em ~375px
3. Forçar `prefers-reduced-motion: reduce` no DevTools e confirmar a versão estática
4. Trocar de idioma pelo `LanguageSwitcher`
5. **Rolar rápido de cima a baixo e de volta várias vezes**, confirmando que nenhuma casca
   fica presa em estado intermediário e que `stage` não perde sincronia com `progress`
6. Confirmar que com JS desligado — ou antes da hidratação — headline, sub, os três rótulos
   e o CTA estão no HTML

## Fora de escopo

- Reação a mouse, arrastar ou orbitar o planeta
- Textura realista de planeta
- Qualquer mudança em `src/components/sections/` (desativadas) ou `src/pages-disabled/`
- Reativar `ServicesSection` ou qualquer outra section
