# Assistente de chat (modal) — design

Data: 2026-08-19

## Contexto

O backend em `backend-AlefDevopsWeb/backend` (NestJS) já expõe um assistente RAG funcional: `POST /assistant` recebe `{ question: string }` e devolve `{ answer: string, sources: string[] }`, compondo `RetrievalService` (Mongo Atlas Vector Search) e `GeminiService` (embeddings + geração). Endpoint sem guard, sem CORS configurado, rodando local em `localhost:3344`. Este spec cobre o lado do site: um botão no Header que abre um modal de chat consumindo esse endpoint.

Inspiração visual: o modal "Kodee" da Hostinger (título/subtítulo + lista de mensagens + input no rodapé) — mas sem persona batizada, sem cards de produto/ação, sem avatar de personagem. O assistente fala em nome do próprio Alef Devops.

## Frontend

**Botão** — `"Fale com AlefDevops"`, estilo secundário (borda, não preenchido), posicionado imediatamente à esquerda do CTA de WhatsApp existente em `Header.tsx`, tanto no grupo desktop quanto no drawer mobile (que hoje não tem nenhum CTA de contato). Abre o modal via estado local `chatOpen`.

**Modal** — novo `src/components/AssistantChat.tsx`: diálogo centralizado, tema escuro nos tokens do projeto (`surface`/`raised`/`line`/`fg`), com:
- Título + subtítulo de boas-vindas (chaves i18n).
- Lista de mensagens rolável — usuário alinhado à direita, assistente à esquerda.
- Input de texto + botão de enviar fixos no rodapé.
- Fecha com Escape ou clique no backdrop; foco preso enquanto aberto.
- Estado local (`useState`) apenas — sem persistência entre aberturas/reloads.

**Cliente da API** — `src/lib/assistant.ts`, função `askAssistant(question: string)` que faz `POST` para `` `${process.env.NEXT_PUBLIC_ASSISTANT_API_URL}/assistant` ``. Variável obrigatória, sem fallback hardcoded para produção — falha alto (erro no console) se não configurada, em vez de apontar silenciosamente para localhost.

**Erros** — falha de rede ou resposta não-2xx mostra uma mensagem de erro inline no chat mais um link "Falar no WhatsApp" reaproveitando `whatsappHref()`. `contactHref` (hoje só em `Header.tsx`) passa a ser compartilhado entre `Header` e `AssistantChat`.

**i18n** — novas chaves em `public/locales/{pt,en}/common.json`: rótulo do botão, título/subtítulo do modal, placeholder do input, texto de "enviando...", mensagem de erro.

## Backend

`src/main.ts` passa a chamar `app.enableCors({ origin: [...] })`, restrito às origens do site (dev: `localhost:3000`; produção: via env quando o backend for publicado — ainda não está).

## Fora de escopo

- Persona/nome/avatar próprio para o assistente.
- Cards de ação secundária estilo "ou explore".
- Persistência de histórico de conversa.
- Deploy do backend (ainda só roda local) — a URL de produção fica como env var a preencher depois.
