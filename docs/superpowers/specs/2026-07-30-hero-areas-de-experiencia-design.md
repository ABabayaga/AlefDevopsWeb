# Hero: áreas de experiência (Infra · Web2 · Web3)

Data: 2026-07-30

## Problema

O hero atual abre com um manifesto — *"O futuro exige transparência, descentralização,
autonomia, confiança e segurança"* — ao lado de um painel de OTDR. A frase fala sobre a
web, não sobre quem assina o site, e o visitante termina o primeiro scroll sem saber o que
o Alef faz. O objetivo é que o hero comunique as três áreas de experiência —
infraestrutura, web2 e web3 — logo na primeira tela.

## Decisões

| Decisão | Escolha |
|---|---|
| Painel de OTDR | Sai do hero; o componente é deletado |
| Frase-manifesto (`title`) | Sai; entra uma headline pessoal |
| Centro do hero | Apresentação pessoal + as três áreas |
| Posicionamento | Pessoa com marca própria — serve a recrutador e a cliente |
| Profundidade por área | Rótulo + uma linha + stack |
| Layout | Apresentação empilhada em cima, áreas em faixa de 3 colunas embaixo |
| CTA secundário | WhatsApp (não haverá mais contato por e-mail) |

O OTDR era a única assinatura visual autoral do site. A identidade é preservada pelo
vocabulário e não pelo gráfico: amarelo OS2 e aqua OM3, rótulos em mono caixa-alta e a
numeração `01 / 02 / 03` das áreas, que é a régua de eventos do traço sobrevivendo à
remoção dele.

## Arquitetura

### `src/components/sections/Hero.tsx` (reescrito)

Coluna única, sem grid de duas colunas. Ordem vertical:

1. Eyebrow — `Alef Lima · Alef Devops`, mono caixa-alta, com o filete `h-px w-8` que já existe
2. `<h1>` — a headline
3. Parágrafo de apoio (`.measure`)
4. Dois CTAs lado a lado
5. `<ExpertiseAreas />`
6. Indicador de scroll (`.scroll-cue`, já implementado, permanece no fim da section)

O `<h1>` é o único da página; nada mais no hero compete pelo nível 1.

### `src/components/ExpertiseAreas.tsx` (novo)

A faixa de três colunas, isolada do Hero para que o Hero continue legível de uma olhada.

Data-driven, no mesmo padrão de `ServicesSection`:

```ts
const areas = [
  { id: "01", key: "infra" },
  { id: "02", key: "web2" },
  { id: "03", key: "web3" },
] as const;
```

Todo o texto vem de `t(\`areas.${key}.title\`)`, `.desc` e `.stack`. Acrescentar ou renomear
uma área é mexer no array e nos dois arquivos de locale — nunca no layout.

Marcação: `<ul>` com `<li>` por área; dentro de cada `<li>`, o número em mono aqua, um
`<h2>`, a descrição em `text-fg-muted` e a stack em mono `0.6875rem`.

Grid: `grid gap-px bg-line` com filhos `bg-ink` e `sm:grid-cols-3` — o mesmo truque de
filete de `ServicesSection`, em que o separador é o fundo aparecendo pelo `gap`. No mobile
degrada sozinho para uma coluna com filete horizontal.

### Remoções

- `src/components/OtdrTrace.tsx` — deletado
- Chaves `otdr.*` nos dois locales
- `@keyframes otdr-draw`, `@keyframes otdr-event-in`, `.otdr-line`, `.otdr-event` em `globals.css`
- Chave `hero_cta` nos dois locales — já não é referenciada por nenhum componente hoje

O componente permanece no histórico do git; se voltar a ser útil em outra section, é um
`git checkout` do arquivo.

### Tipografia

`.type-hero` hoje é `clamp(1.875rem, 4.4vw, 3.75rem)`, um teto deliberadamente baixo porque
a frase atual é longa. Com uma headline curta o teto sobe para
`clamp(2.75rem, 7vw, 5.5rem)`. Nenhum outro uso de `.type-hero` existe no projeto, então a
mudança é local ao hero.

### CTAs

| | Destino | Comportamento |
|---|---|---|
| Primário | `/#services` | `<Link>` interno, estilo atual (pílula `bg-os2`) |
| Secundário | `https://wa.me/<numero>?text=<mensagem>` | `<a target="_blank" rel="noopener noreferrer">`, estilo contorno (`border-line`, hover `border-os2`) |

O número fica em uma constante única no topo do componente. A mensagem pré-preenchida é
uma chave de locale, então difere por idioma.

## Copy

### Apresentação

| | PT | EN |
|---|---|---|
| `hero_eyebrow` | Alef Lima · Alef Devops | Alef Lima · Alef Devops |
| `title` | Da fibra ao smart contract. | From fiber to smart contract. |
| `hero_sub` | Quinze anos levantando rede física — fibra, POPs, monitoramento — agora aplicados a sistemas web e contratos on-chain. | Fifteen years building physical networks — fiber, POPs, monitoring — now applied to web systems and on-chain contracts. |
| `services` | Serviços | Services |
| `hero_whatsapp` | Falar no WhatsApp | Chat on WhatsApp |
| `hero_whatsapp_message` | Olá, Alef! Vim pelo site. | Hi Alef! I came from your site. |

`hero_sub` e `services` já existem e não mudam.

### Áreas

| Chave | PT | EN |
|---|---|---|
| `areas.infra.title` | Infraestrutura | Infrastructure |
| `areas.infra.desc` | Fibra, POPs e monitoramento de rede física | Fiber, POPs and physical network monitoring |
| `areas.infra.stack` | OTDR · NOC · Redes | OTDR · NOC · Networks |
| `areas.web2.title` | Web2 | Web2 |
| `areas.web2.desc` | Sistemas, APIs e painéis administrativos | Systems, APIs and admin panels |
| `areas.web2.stack` | React · Next.js · Node · MongoDB | React · Next.js · Node · MongoDB |
| `areas.web3.title` | Web3 | Web3 |
| `areas.web3.desc` | Contratos inteligentes, tokens e dApps | Smart contracts, tokens and dApps |
| `areas.web3.stack` | Solidity · OpenZeppelin · RainbowKit | Solidity · OpenZeppelin · RainbowKit |

A stack é uma string única por área, com os separadores `·` já embutidos — não um array
montado em JSX. Traduzir uma stack é editar a string.

## Entrada necessária antes de implementar

**Número do WhatsApp**, com DDI e DDD, no formato aceito pelo `wa.me` (só dígitos, por
exemplo `5511987654321`). É o único dado do design que não existe no repositório. Sem ele
o CTA secundário não pode ser construído.

## Acessibilidade

- O `<h1>` é único; as áreas são `<h2>`, mantendo a hierarquia linear
- A numeração `01/02/03` é decorativa e leva `aria-hidden` — a ordem já é dada pela lista
- Os filetes e o separador `·` da stack são `aria-hidden`
- O link externo do WhatsApp leva `rel="noopener noreferrer"`
- O estilo de foco global (`:focus-visible`, outline OS2) cobre os dois CTAs
- Nada de novo é animado; a regra global de `prefers-reduced-motion` continua valendo para
  o indicador de scroll

## Verificação

Não há test runner no projeto. Verificar é:

1. `npm run build` passa
2. `npm run dev` e conferir o hero em desktop e em ~375px de largura
3. Trocar de idioma pelo `LanguageSwitcher` e confirmar as duas versões das seis chaves novas
4. Clicar o CTA do WhatsApp e confirmar que abre a conversa com a mensagem preenchida
5. `grep -rn -i "otdr\|hero_cta" src public` só retorna a menção a equipamentos em
   `SkillsSection.tsx:132` (texto do currículo, sem relação com o componente) e a chave
   `areas.infra.stack` nos locales
