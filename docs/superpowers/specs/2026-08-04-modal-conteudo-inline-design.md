# Modal de nav: conteúdo inline em vez de "ver mais"

Data: 2026-08-04

## Problema

`NavRootModal` hoje é um teaser: título + um link "ver mais" que navega pra `/trabalhos`
ou `/sobre`, onde mora o conteúdo de verdade. O pedido é que o modal já mostre o conteúdo
completo — sem sair da home. Isso torna as duas páginas cheias redundantes, então elas
saem, e o site volta a ser uma página só (a home), agora com dois modais ricos em vez de
dois modais-teaser.

## Decisões

| Decisão | Escolha |
|---|---|
| Onde mora o conteúdo | Dentro do modal, sempre — nada de navegação |
| Escopo | Os dois: Trabalhos e Sobre |
| `/trabalhos` e `/sobre` (páginas cheias) | Deletadas, sem fallback |
| Itens de nav sem página por trás | Viram `<button>`, não `<Link>` |
| Tamanho do modal | Cresce de `max-w-lg` pra `max-w-3xl`, com scroll interno |

## Trade-off aceito

Hoje `/trabalhos` e `/sobre` funcionam sem JS, por link direto, e a partir de qualquer
página (documentado no `CLAUDE.md` como decisão deliberada). Ao deletar as páginas e trocar
os itens de nav por `<button>`, esse suporte sai: sem JavaScript, ou tentando abrir em nova
aba, o clique não leva a lugar nenhum. Aceito conscientemente como parte deste pedido — o
site volta a depender de JS para mostrar esse conteúdo, assim como o resto da navegação
(a raiz animada, o próprio modal) já dependia.

## Arquitetura

### `src/components/TrabalhosContent.tsx` (novo)

O corpo de `src/pages/trabalhos.tsx` de hoje, sem o `Head`/`Header`/`Footer`/`SectionHeader`
— só as três seções de categoria com os `ProjectCard`. Os arrays `projects` e `categories`
migram pra cá tal como estão.

```tsx
const projects = [
  { key: "mm", category: "sites", image: "/trabalhos/mm.png", orientation: "landscape" },
  { key: "gsn", category: "sites", image: "/trabalhos/gsn.png", orientation: "landscape" },
  { key: "rt2", category: "apps", image: "/trabalhos/rt2.png", orientation: "portrait" },
  { key: "rpa", category: "sistemas", image: "/trabalhos/rpa.png", orientation: "landscape" },
] as const;

const categories = [
  { id: "sites", labelKey: "trabalhos_sites_label" },
  { id: "apps", labelKey: "trabalhos_apps_label" },
  { id: "sistemas", labelKey: "trabalhos_sistemas_label" },
] as const;
```

Marcação idêntica à atual (`flex flex-col gap-16`, uma `<section>` por categoria com
rótulo mono + filete, grid `sm:grid-cols-2` de `ProjectCard`), sem o wrapper `<div
className="mx-auto max-w-6xl ...">` — o container agora é o painel do modal.

### `src/components/SobreContent.tsx` (novo)

O corpo de `src/pages/sobre.tsx` de hoje: a foto (`relative aspect-4/5 ... w-full
shrink-0`) e os três parágrafos da bio. Layout `flex flex-col lg:flex-row` — dentro do
modal (mais estreito que a página cheia) a coluna de foto some o `lg:w-72` fixo e vira
`sm:w-56` pra não competir tanto por espaço num painel de `max-w-3xl`.

### `src/components/NavRootModal.tsx` (editado)

Remove `SEE_MORE_HREF`, o import de `Link`, e o bloco do link "ver mais". No lugar,
depois do cabeçalho (título + botão fechar, inalterados), renderiza o conteúdo:

```tsx
{modalKey === "trabalhos" && <TrabalhosContent />}
{modalKey === "sobre" && <SobreContent />}
```

O painel (`div` com `border border-line bg-surface`) cresce de `max-w-lg p-8 sm:p-10` pra
`max-w-3xl p-8 sm:p-10 max-h-[85vh] overflow-y-auto` — o conteúdo de Trabalhos (3 seções,
4 cards com imagem) não cabe no tamanho pensado pra um teaser de duas linhas.

### `src/pages/trabalhos.tsx` e `src/pages/sobre.tsx`

Deletados. `ProjectCard.tsx` continua existindo — passa a ser importado por
`TrabalhosContent.tsx` em vez da página.

### `src/components/Header.tsx` (editado)

`NavItem` perde a obrigatoriedade de `href` pra itens internos — só o item externo
(WhatsApp) ainda navega de verdade:

```ts
interface NavItem {
  label: string;
  /** Só itens externos usam href pra navegar de verdade. */
  href?: string;
  external?: boolean;
  modalKey?: NavModalKey;
}
```

`NavEntry` passa a renderizar `<button type="button">` para qualquer item sem `external`
(hoje isso é só os dois com `modalKey`, já que não sobra nenhum item interno sem modal).
O `onClick` chama `onModalClick` (se existir) com o `getBoundingClientRect()` do próprio
botão — mesma geometria que `NavRootReveal` já consome hoje, `Element.getBoundingClientRect()`
funciona igual em `<button>` e `<a>`.

`navItems` perde o campo `href` nas duas entradas (`trabalhos`, `sobre`); a chave usada no
`.map()` passa a ser `item.label` em vez de `item.href` (que deixa de existir pra esses
itens).

## Copy

Nenhuma chave de locale nova. `trabalhos_header` e `sobre_header` continuam sendo o texto
usado como título do `<h2>` do modal (via `NAV_MODAL_TITLE_KEY`) — o que muda é só que não
existe mais uma página com esse mesmo título por trás.

**Remove**: `modal_see_more` dos dois locales (`public/locales/{pt,en}/common.json`) — fica
sem nenhum consumidor depois que o link "ver mais" sai. `modal_close` continua (o botão de
fechar não muda).

## Acessibilidade

- `role="dialog"` / `aria-modal="true"` do painel, o foco automático no botão de fechar, e
  o fechamento por Escape — nada disso muda.
- Trocar `<Link>` por `<button type="button">` mantém a navegação por teclado (Enter/Space
  ativam botão igual a link) — não há perda aí, só na ausência de destino de URL real.
- `max-h-[85vh] overflow-y-auto` no painel: conteúdo alto (Trabalhos) fica scrollável em
  vez de estourar a viewport; o cabeçalho com o botão fechar permanece dentro da área que
  rola junto (não fixo) — mesmo padrão simples que o modal já tinha.

## Documentação

`CLAUDE.md` tem, hoje, um parágrafo inteiro descrevendo `/trabalhos` e `/sobre` como
páginas reais (escrito na sessão anterior, quando elas foram criadas) — precisa voltar a
descrever o site como uma página só, e documentar os dois modais como o lugar onde esse
conteúdo mora agora. Também precisa perder as referências a `ProjectCard` como algo
"importado pela página `trabalhos.tsx`" (passa a ser importado por `TrabalhosContent`) e
adicionar uma nota sobre `TrabalhosContent`/`SobreContent` no mesmo padrão dos outros
componentes documentados.

## Verificação

Não há test runner. Verificar é:

1. `npm run build` passa
2. `npm run dev`, abrir a home, clicar "Trabalhos" e "Sobre mim" no nav (desktop e no
   drawer mobile) — confirmar que o modal abre com o conteúdo completo, scrolla quando
   necessário, e fecha com Escape/clique fora/botão fechar
3. Confirmar que `/trabalhos` e `/sobre` agora dão 404 (páginas removidas de propósito)
4. Trocar de idioma pelo `LanguageSwitcher` com o modal aberto e fechado, confirmar que o
   conteúdo troca
5. `grep -rn "modal_see_more\|SEE_MORE_HREF" src public` não deve retornar nada
