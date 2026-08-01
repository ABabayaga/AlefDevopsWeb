# Intro de carregamento

Data: 2026-07-30
Estado: desenhado, não implementado

## Contexto

A home carrega uma cena WebGL — o chunk do `three` vem por `next/dynamic`, e as duas fontes do
Google entram com `display: swap`. Hoje o visitante vê o hero montar por partes: texto com fonte
de sistema, depois a troca de fonte, depois o planeta aparecendo.

Esta intro cobre esse intervalo com uma cena própria, no vocabulário do site: um servidor
entregando a resposta a um desktop, com barra de progresso e porcentagem no cabo entre os dois.

## Decisões

| Questão | Escolha | Por quê |
|---|---|---|
| O que a porcentagem mede | Híbrido | Corre sozinha até 90%, fecha só quando o carregamento real termina. Nunca fecha cedo, nunca pisca em 80ms |
| Frequência | Uma vez por sessão | Recarregar ou trocar de idioma no meio do uso não repete a cortina |
| Cabo | Barra preenchendo + pacotes correndo | Lê como transmissão, não como barra de progresso genérica |
| Status | Uma linha que troca por etapa | Legível de relance, não disputa com a porcentagem, cabe no mobile |
| Onde monta | `index.tsx` | É a home que carrega o `three`; no `_app` a cortina cairia também na `/404` |

## Prontidão

Duas promessas em paralelo:

1. `document.fonts.ready`
2. `import("@/components/PlanetScene")`

A segunda é o ponto: o registro de módulos deduplica, então dar `await` no mesmo import que o
`next/dynamic` do `Hero` vai dar significa exatamente "o chunk do `three` desceu e parseou" — sem
callback atravessando o `Hero`, sem `onReady` no `PlanetScene`, sem acoplamento entre a cortina e
a cena. A intro não sabe o que é o planeta; ela sabe esperar um módulo.

Mais um teto de **6 segundos**. Rede ruim não pode prender ninguém atrás da cortina: estourou, a
intro sai com o que tiver.

## A curva

- A barra corre sozinha de 0 a 90% em **1,6s**, com desaceleração (mesma `--ease-out-quint` do
  resto do site).
- Os 10% finais só acontecem quando as duas promessas resolvem (ou o teto estoura).
- Piso de **1,8s** no total, para dar tempo de ler.
- Ao chegar em 100%: a tela do desktop acende em `os2` por ~200ms, depois a cortina some num fade
  de ~500ms.

Numa conexão boa a barra corre e fecha. Numa ruim ela para em 90% e espera — que é o
comportamento honesto, e o motivo de a curva não ser cravada em tempo fixo.

## O flash, que é o problema de verdade

A decisão de mostrar depende do `sessionStorage`, que só existe no cliente. Se o servidor não
renderiza a cortina, quem chega vê o hero por um instante antes de ser coberto — pior do que não
ter intro.

Então: **o servidor sempre renderiza a cortina**, e um script inline curto no `_document.tsx`,
executado antes da primeira pintura, lê o `sessionStorage` e marca `data-intro="seen"` no
`<html>`. O CSS esconde a cortina com esse atributo. Quem já viu não vê nem um quadro. É o mesmo
padrão usado para evitar flash de tema.

Junto vai um `<noscript>` que esconde a cortina: sem JS ela nunca seria removida e o site ficaria
inacessível atrás de um overlay.

## Composição

```
        ┌──────┐                                    ┌──────────────┐
        ├──────┤                47%                 │              │
        ├──────┤   ━━━━━━━━━●━━━━●━━━━·············  │              │
        ├──────┤                                    └──────┬───────┘
        └──────┘                                       ────┴────

                        RECEBENDO CENA
```

- Cabo vazio em `line`, preenchido em `os2`, pacotes em `om3`, ícones em `fg-muted`.
- Porcentagem em `font-mono` direto, ~2rem. **Não** usa `.type-label`: ela força caixa alta e o
  `CLAUDE.md` avisa para não aplicá-la a string com unidade.
- Linha de status usa `.type-label` — é exatamente para isso que ela existe.
- Ícones em SVG inline com `currentColor`, mesmo motivo do `ScrollCue`: os PNGs de traço em
  `public/` precisariam de `invert`.
- Mobile mantém a composição horizontal, com ícones e cabo menores. Empilhar em vertical mataria
  a leitura de transmissão, que é o ponto do desenho.

## Etapas

| faixa | chave | pt | en |
|---|---|---|---|
| 0–25 | `intro.connecting` | Conectando | Connecting |
| 25–60 | `intro.handshake` | Handshake | Handshake |
| 60–95 | `intro.receiving` | Recebendo cena | Receiving scene |
| 95–100 | `intro.ready` | Pronto | Ready |

Quatro chaves novas em cada locale. Os dois arquivos estão key-for-key hoje e continuam.

## Comportamento

- **Trava de rolagem:** `overflow: hidden` no `body` enquanto a cortina está de pé, senão a
  coreografia de 300vh do hero avança por trás dela. O scroll volta ao topo na saída.
- **`prefers-reduced-motion` pula a intro inteira**, como o hero já faz.
- O conteúdo da página está no HTML servido normalmente, embaixo do overlay. Nenhum crawler perde
  nada.

## Acessibilidade: a troca que estamos fazendo

A cortina leva `aria-hidden`, para que leitores de tela ignorem o teatro e leiam a página, que já
está no DOM. **O efeito colateral é real:** um usuário de teclado que tabule nesses ~2s pode focar
um link atrás da cortina. Prender o foco resolveria isso ao custo de fazer a cortina existir para
quem não a vê.

A troca foi feita a favor de quem usa leitor de tela. Se um dia isso incomodar, o conserto é
`inert` no conteúdo enquanto a cortina existe — não um focus trap.

## Arquivos

- `src/hooks/useIntroProgress.ts` — a curva híbrida. Devolve `percent`, `stage` e `done`.
- `src/components/Intro.tsx` — a cortina.
- `src/pages/_document.tsx` — script anti-flash e `<noscript>`.
- `src/pages/index.tsx` — monta a cortina.
- `src/styles/globals.css` — animação dos pacotes e a regra de `[data-intro="seen"]`.
- `public/locales/{pt,en}/common.json` — as quatro chaves.

## Fora de escopo

- Intro em qualquer rota que não seja a home.
- Barra de progresso de rolagem no topo da página (ideia adjacente, projeto separado).
- Qualquer mudança no hero, no `PlanetScene` ou nas raízes.

## Como testar

Não há test runner; a verificação é `npm run build` mais o navegador:

1. Primeira visita numa sessão limpa: a cortina aparece do primeiro quadro, a barra corre, os
   pacotes andam, o status troca nas quatro faixas, a tela do desktop acende e a cortina sai.
2. Recarregar na mesma sessão: **nenhum quadro** de cortina.
3. Sessão nova (storage limpo): a cortina volta.
4. Com `prefers-reduced-motion`: nenhuma cortina.
5. Com JS desligado: nenhuma cortina, site utilizável.
6. Com a rede estrangulada: a barra para em 90% e espera; o teto de 6s fecha de qualquer jeito.
7. Durante a cortina, a página não rola.
8. Trocar de idioma e conferir as quatro chaves nos dois locales.
