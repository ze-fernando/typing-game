# Typing Game

Jogo de digitação em português (pt-BR) com três níveis fixos, modo personalizado, ranking global e cenário de mesa de computador com teclado totalmente interativo.

- **Iniciante** — 10 palavras em 35 s, sem acentos.
- **Amador** — 15 palavras em 30 s, acentuação moderada.
- **Expert** — 30 palavras em 40 s, acentuação complexa.
- **Personalizado** — de 1 a 100 palavras e de 5 a 120 s (recordes apenas locais, fora do ranking).

A documentação de produto, arquitetura e decisões está em [`docs/`](./docs), com o plano completo em [`docs/plan.md`](./docs/plan.md) e os registros de review por fase em [`docs/reviews/`](./docs/reviews).

## Stack

- [SvelteKit 3](https://svelte.dev/docs/kit) + Svelte 5 (runes) + TypeScript estrito
- Tailwind CSS 4 com tokens de tema em `src/app.css`
- `@sveltejs/adapter-netlify` (Netlify Functions + CDN)
- [Neon](https://neon.com) como Postgres do ranking global, via `@neondatabase/serverless` e `DATABASE_URL`
- Zod para validação compartilhada entre cliente e servidor
- Vitest + Testing Library (unitários) e Playwright (E2E)
- Áudio sintetizado via Web Audio API (sem arquivos de mídia)

> **Por que não o Netlify Database?** O recurso passou a exigir plano com créditos e o deploy falha ao provisionar em contas free (`database feature not available for this account`). O Neon é a mesma tecnologia por trás do Netlify Database e tem plano gratuito.

## Requisitos

- Node.js 22+ (validado com Node 24)
- npm 10+

## Como rodar

```sh
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Scripts

| Script             | O que faz                                                    |
| ------------------ | ------------------------------------------------------------ |
| `npm run dev`      | Servidor de desenvolvimento com HMR                          |
| `npm run build`    | Build de produção (saída Netlify em `build/` e `.netlify/`)  |
| `npm run preview`  | Pré-visualiza o build de produção                            |
| `npm run check`    | `svelte-kit sync` + `svelte-check` (tipos e a11y)            |
| `npm run lint`     | Prettier (`--check`) + ESLint                                |
| `npm run format`   | Formata o projeto com Prettier                               |
| `npm run test`     | Testes unitários (Vitest)                                    |
| `npm run test:e2e` | Testes E2E (Playwright) contra o build de produção           |
| `npm run db:apply` | Aplica as migrações de `db/migrations` usando `DATABASE_URL` |

Antes do primeiro `npm run test:e2e`, instale o navegador do Playwright:

```sh
npx playwright install chromium
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário.

| Variável          | Obrigatória | Descrição                                                                                                |
| ----------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| `PUBLIC_SITE_URL` | não         | URL pública usada em canonical, sitemap, robots e Open Graph. Padrão: `https://typing-game.netlify.app`. |
| `DATABASE_URL`    | não         | Conexão Postgres (Neon) do ranking. Sem ela, a API responde `503` e o jogo usa apenas recordes locais.   |

As variáveis são declaradas em `src/env.ts` (SvelteKit 3): `PUBLIC_SITE_URL` é pública e estática (embutida no build); `DATABASE_URL` é privada e lida em runtime, acessível apenas pelo servidor (`src/lib/server/*`). Nenhum segredo é exposto ao cliente — o banco é acessado somente via rotas de servidor (`src/routes/api/*`).

## Ranking e banco (Neon)

- Endpoints: `GET /api/leaderboard?nivel=iniciante|amador|expert&limite=1..20` e `POST /api/scores`.
- Migração: `db/migrations/20261019120000_create_leaderboard_scores.sql` (idempotente).
- O driver `@neondatabase/serverless` fala HTTP com o Postgres, ideal para Netlify Functions; consultas sempre parametrizadas por tagged template.

Para configurar o ranking:

1. Crie um projeto gratuito em [neon.com](https://neon.com) e copie a connection string.
2. Defina `DATABASE_URL` no `.env` (desenvolvimento) e nas variáveis de ambiente da Netlify (produção).
3. Aplique a migração apontando para o banco desejado:

```sh
npm run db:apply
```

Sem banco configurado, a API responde `503` e o jogo continua funcionando com recordes locais em `localStorage`. Partidas do modo personalizado nunca são enviadas ao ranking.

## Estrutura

```
src/
  env.ts                 # schema das variáveis de ambiente (SvelteKit 3)
  app.css                # tokens, tema claro/escuro e animações
  lib/
    audio/               # motor de áudio sintetizado (Web Audio)
    api/                 # cliente HTTP do ranking
    components/          # UI, modais, teclado, cenário, SEO
    game/                # regras puras: palavras, níveis, baralho, pontuação, teclado ABNT2
    server/              # acesso ao banco (Neon), ranking e rate limit
    stores/              # estado global (settings, ui, jogo)
    utils/               # recordes locais
    validation.ts        # schemas Zod compartilhados
  routes/
    +page.svelte         # home (landing)
    jogar/               # tela do jogo (SSR, query params)
    api/                 # endpoints de ranking
    robots.txt/          # robots gerado
    sitemap.xml/         # sitemap gerado
e2e/                     # testes Playwright
db/migrations/           # migrações SQL do Postgres (Neon)
scripts/                 # utilitário para aplicar migrações
docs/                    # documentação e reviews
```

## Deploy

1. Crie o site na Netlify e conecte o repositório (a configuração está em `netlify.toml`).
2. Defina `PUBLIC_SITE_URL` com a URL de produção.
3. Crie o projeto Neon, defina `DATABASE_URL` na Netlify e rode `npm run db:apply` para criar a tabela.
4. Valide o deploy preview e depois promova para produção.
5. Rollback: use o histórico de deploys da Netlify ("Publish deploy") para voltar à versão anterior; o schema é aditivo e não é removido no rollback.

## Acessibilidade e desempenho

- Tema claro/escuro/sistema sem flash inicial, persistido em `localStorage`.
- Navegação completa por teclado, foco visível, diálogos com Escape/backdrop e retorno de foco.
- `prefers-reduced-motion` desliga animações do fundo e da cena.
- Teclado virtual ABNT2 com versão compacta no mobile e popover de acentos.
- Fontes self-hosted com `font-display: swap` e subset latin-ext.
