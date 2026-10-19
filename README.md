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
- [Netlify Database](https://docs.netlify.com/build/data-and-storage/netlify-database/) para o ranking global (`@netlify/database`)
- Zod para validação compartilhada entre cliente e servidor
- Vitest + Testing Library (unitários) e Playwright (E2E)
- Áudio sintetizado via Web Audio API (sem arquivos de mídia)

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

| Script             | O que faz                                                   |
| ------------------ | ----------------------------------------------------------- |
| `npm run dev`      | Servidor de desenvolvimento com HMR                         |
| `npm run build`    | Build de produção (saída Netlify em `build/` e `.netlify/`) |
| `npm run preview`  | Pré-visualiza o build de produção                           |
| `npm run check`    | `svelte-kit sync` + `svelte-check` (tipos e a11y)           |
| `npm run lint`     | Prettier (`--check`) + ESLint                               |
| `npm run format`   | Formata o projeto com Prettier                              |
| `npm run test`     | Testes unitários (Vitest)                                   |
| `npm run test:e2e` | Testes E2E (Playwright) contra o build de produção          |
| `npm run db:apply` | Aplica as migrações do Netlify Database (requer CLI logada) |

Antes do primeiro `npm run test:e2e`, instale o navegador do Playwright:

```sh
npx playwright install chromium
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário.

| Variável          | Obrigatória | Descrição                                                                                                |
| ----------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| `PUBLIC_SITE_URL` | não         | URL pública usada em canonical, sitemap, robots e Open Graph. Padrão: `https://typing-game.netlify.app`. |

A variável é declarada em `src/env.ts` (SvelteKit 3) como pública e estática: o valor é embutido no build. Nenhum segredo é exposto ao cliente — o banco é acessado apenas via rotas de servidor (`src/routes/api/*`).

## Ranking e Netlify Database

- Endpoints: `GET /api/leaderboard?nivel=iniciante|amador|expert&limite=1..20` e `POST /api/scores`.
- Migração: `netlify/database/migrations/20261019120000_create_leaderboard_scores.sql`.
- Em produção, o Netlify Database é provisionado automaticamente pelo site; rode as migrações com a CLI logada:

```sh
npx netlify link
npx netlify database migrations apply
# ou
npm run db:apply
```

Sem banco configurado (por exemplo, ambiente local sem `netlify dev`), a API responde `503` e o jogo continua funcionando com recordes locais em `localStorage`. Partidas do modo personalizado nunca são enviadas ao ranking.

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
    server/              # acesso ao Netlify Database, ranking e rate limit
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
netlify/database/        # migrações do banco
docs/                    # documentação e reviews
```

## Integração contínua

O repositório inclui `.github/workflows/ci.yml`, que roda o gate de review a cada push para `main` e em pull requests:

`check` → `lint` → `test` → `build` → `test:e2e` (Chromium, com relatório publicado em caso de falha).

Recomendado proteger a branch `main` exigindo o job **Gate** e o deploy preview da Netlify antes do merge. Migrações de banco continuam manuais (`npm run db:apply`) para não alterar schema em deploys de preview.

## Deploy

1. Crie o site na Netlify e conecte o repositório (a configuração está em `netlify.toml`).
2. Defina `PUBLIC_SITE_URL` com a URL de produção.
3. Provisione o Netlify Database e rode `npm run db:apply` (ou `npx netlify database migrations apply`).
4. Valide o deploy preview e depois promova para produção.
5. Rollback: use o histórico de deploys da Netlify ("Publish deploy") para voltar à versão anterior; o banco mantém a compatibilidade porque as migrações são aditivas.

## Acessibilidade e desempenho

- Tema claro/escuro/sistema sem flash inicial, persistido em `localStorage`.
- Navegação completa por teclado, foco visível, diálogos com Escape/backdrop e retorno de foco.
- `prefers-reduced-motion` desliga animações do fundo e da cena.
- Teclado virtual ABNT2 com versão compacta no mobile e popover de acentos.
- Fontes self-hosted com `font-display: swap` e subset latin-ext.
