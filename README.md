# Typing Game

Jogo de digitação no navegador, em português (em `/`) e em inglês (em `/en`), com acentuação de verdade, teclado ABNT2 interativo, modos de tradução **inglês → português** (em `/`) e **português → inglês** (em `/en`) e ranking por modo e nível. Identidade visual ZionCodes, temas claro e escuro.

| Nível         | Palavras |   Tempo | Português                       | Inglês                     | Inglês → português                          |
| ------------- | -------: | ------: | ------------------------------- | -------------------------- | ------------------------------------------- |
| Iniciante     |       10 |    35 s | curtas, sem acento              | 3–5 letras                 | resposta curta sem acento (house → casa)    |
| Amador        |       15 |    30 s | dia a dia com á, ç, ã           | 6–9 letras                 | resposta com acento (apple → maçã)          |
| Avançado      |       30 |    40 s | longas, acentuação densa        | 10+ letras, grafia difícil | ideias abstratas (knowledge → conhecimento) |
| Personalizado |    1–100 | 5–120 s | mistura dos três níveis do modo | idem                       | idem                                        |

O id interno do nível avançado continua `expert` (URLs, banco e recordes antigos); a interface mostra "Avançado"/"Advanced".

A documentação de produto, decisões e reviews está em [`docs/`](./docs); a entrega mais recente está em [`docs/reviews/senior-entrega.md`](./docs/reviews/senior-entrega.md). Identidade visual em [`DESIGN.md`](./DESIGN.md).

## Stack

- [SvelteKit 3](https://svelte.dev/docs/kit) + Svelte 5 (runes) + TypeScript estrito
- Tailwind CSS 4 com tokens em `src/app.css`
- Fontes self-hosted: Saira (`@fontsource-variable/saira`) e JetBrains Mono
- `@sveltejs/adapter-netlify` (Netlify Functions + CDN)
- Ranking: **Neon** (Postgres) em produção via `@neondatabase/serverless`; **SQLite** local via `node:sqlite` (sem dependência extra)
- Zod para validação compartilhada entre cliente e servidor
- Vitest (unitários) e Playwright + axe (E2E)
- Áudio sintetizado via Web Audio API, incluindo a trilha de fundo (composição própria gerada em tempo real)

## Requisitos

- Node.js **24+** (o ranking local usa o módulo nativo `node:sqlite`)
- npm 10+

## Como rodar localmente

```sh
npm install
npm run dev
```

Abra `http://localhost:5173` (português) ou `http://localhost:5173/en` (inglês).

Sem `DATABASE_URL`, o `npm run dev` usa automaticamente um SQLite em `.data/leaderboard.sqlite` (pasta ignorada pelo git), criado e migrado na primeira requisição. O ranking funciona de ponta a ponta sem Postgres.

Para testar o build de produção com SQLite:

```sh
npm run build
DATABASE_URL=sqlite:.data/preview.sqlite npm run preview
```

## Scripts

| Script             | O que faz                                                                 |
| ------------------ | ------------------------------------------------------------------------- |
| `npm run dev`      | Servidor de desenvolvimento (ranking em SQLite local)                     |
| `npm run build`    | Build de produção (saída Netlify em `build/` e `.netlify/`)               |
| `npm run preview`  | Pré-visualiza o build de produção                                         |
| `npm run check`    | `svelte-kit sync` + `svelte-check` (tipos e a11y)                         |
| `npm run lint`     | Prettier (`--check`) + ESLint                                             |
| `npm run format`   | Formata o projeto com Prettier                                            |
| `npm run test`     | Testes unitários (Vitest)                                                 |
| `npm run test:e2e` | E2E (Playwright) contra o build de produção, com SQLite em `.data/e2e/`   |
| `npm run db:apply` | Aplica as migrações pendentes no banco de `DATABASE_URL` (Neon ou SQLite) |

Antes do primeiro `npm run test:e2e`, instale o navegador do Playwright:

```sh
npx playwright install chromium
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste.

| Variável          | Obrigatória | Descrição                                                                                                                                                                  |
| ----------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_SITE_URL` | produção    | Origem pública (ex.: `https://typing-game.netlify.app`) usada em canonical, hreflang, sitemap, robots, Open Graph e JSON-LD. Sem valor, essas URLs absolutas são omitidas. |
| `DATABASE_URL`    | produção    | `postgresql://…` usa Neon; `sqlite:caminho` usa SQLite. Vazia em `npm run dev` usa `.data/leaderboard.sqlite`; vazia em produção faz a API responder `503`.                |

As variáveis são declaradas em `src/env.ts`. `DATABASE_URL` é privada e só é lida pelo servidor (`src/lib/modules/leaderboard/server/*.server.ts`).

## Ranking

- Um ranking por **modo** (`pt`, `en`, `en-pt`, `pt-en`) e **nível** (`iniciante`, `amador`, `expert`). O modo personalizado nunca entra.
- Cada ranking guarda no máximo **1000** resultados; a cada envio, os piores além do 1000º são podados (ordem: `wpm desc`, `accuracy desc`, `created_at asc`, `id asc`).
- `GET /api/leaderboard?modo=pt|en|en-pt|pt-en&nivel=iniciante|amador|expert&limite=1..20` → `{ scores }` (`cache-control: no-store`).
- `POST /api/scores` → `201 { score, rank }`; `rank` é a posição após o envio, ou `null` se o resultado ficou fora dos 1000.
- Erros com códigos estáveis: `invalid_json`, `invalid_payload`, `invalid_nickname`, `rate_limited` (5 envios por minuto por instância), `unavailable` (`503`).
- Antifraude plausível: o servidor recalcula WPM e precisão, exige total de palavras do nível, duração compatível, caracteres corretos dentro dos limites das palavras do banco, no mínimo 150 ms por palavra e teto de WPM por modo (250 em `pt`/`en`, 180 em `en-pt`/`pt-en`). Nenhum IP é armazenado.
- Apelido opcional, até 20 caracteres (letras, números, espaço, apóstrofo, hífen). Vazio é gravado como texto vazio e a interface mostra o rótulo do idioma ("Anônimo" / "Anonymous"); registros antigos com "Anônimo" também são traduzidos, e a migração `20261023120000_anonymous_nickname.sql` os converte para vazio.

### Repositório e migrations

O repositório tem uma interface única (`LeaderboardRepository` em `src/lib/modules/leaderboard/server/types.ts`) com dois drivers de mesmo comportamento: `postgres.server.ts` (Neon) e `sqlite.server.ts` (`node:sqlite`). A escolha é feita por `DATABASE_URL` em `target.ts`.

```
db/migrations/
  postgres/   # aplicadas por npm run db:apply no Neon
  sqlite/     # aplicadas automaticamente ao abrir o SQLite e por npm run db:apply
```

As duas pastas registram o que já rodou em `schema_migrations`.

### Configurar o Neon (CLI) e a Netlify

O projeto já está ligado a um projeto Neon pela CLI: `neon.ts` guarda a configuração (sem autenticação do Neon, branches novas expiram em 7 dias) e `.neon` guarda os ids da organização e do projeto. `.neon` e `.env.local` são ignorados pelo git.

1. Entre na conta e traga as variáveis do branch:

```sh
neon login
neon env pull
```

O `env pull` grava `.env.local` com `DATABASE_URL` (`postgresql://…?sslmode=require`).

2. Aplique as migrações pendentes. `npm run db:apply` lê `.env.local` e depois `.env`; uma `DATABASE_URL` passada na linha de comando sempre vence:

```sh
npm run db:apply
```

3. Na Netlify, em **Site configuration → Environment variables**, crie `DATABASE_URL` com a mesma string e `PUBLIC_SITE_URL` com a origem do site.
4. Faça o deploy. Bancos que já tinham a tabela antiga recebem as colunas `mode` (padrão `pt`) e `hinted_words` e o apelido anônimo vazio, sem perder dados.

O banco de produção já está migrado (3 migrações Postgres aplicadas).

> **Atenção:** com `.env.local` presente, `npm run dev` também passa a usar o Neon. Para desenvolver sem tocar no banco de produção, force o SQLite: `DATABASE_URL=sqlite:.data/leaderboard.sqlite npm run dev`. O `npm run test:e2e` sempre usa SQLite (`.data/e2e/`), porque a config do Playwright define `DATABASE_URL` explicitamente e o valor do processo vence o do `.env.local`.

## Modos de tradução

- **Inglês → português** (`en-pt`, site em português): mostra uma palavra em inglês; o jogador digita a tradução em português.
- **Português → inglês** (`pt-en`, site em inglês): o mesmo banco invertido; mostra a palavra em português e o jogador digita em inglês.
- Qualquer tradução alternativa listada no banco vale.
- Comparação igual à do jogo: sensível a acentos, insensível a maiúsculas.
- Feedback por letra sem revelar a resposta: as letras ficam verdes enquanto o prefixo existe em alguma alternativa.
- **Dica:** mostra a primeira letra e o número de letras da tradução principal. A palavra concluída com dica vale **metade dos caracteres corretos** (arredondado para baixo) no WPM. A regra aparece na tela antes do uso, e o resultado mostra quantas palavras usaram dica.
- Rotas: `/jogar?nivel=amador&modo=en-pt` e `/en/play?nivel=amador&modo=pt-en` (o alias `mode=` também é aceito).

## Música de fundo

Trilha própria, sem arquivo de áudio nem licença de terceiros, gerada pela Web Audio API em `src/lib/modules/audio/music/`:

- **Lá menor, 88 BPM**, compasso 4/4 em semicolcheias. Progressão principal `Am7 – Fmaj7 – Cmaj7 – Em7` (i–VI–III–v).
- **Seções:** `intro` (4 compassos: pad, baixo longo e sino), `groove` (8: bateria, baixo sincopado e arpejo), `lift` (4: `Dm7 – Fmaj7 – Cmaj7 – G6`, arpejo uma oitava acima e hats mais densos) e `breakdown` (4: `Fmaj7 – Em7 – Dm7 – Em7`, sem bateria). Ordem: intro, groove, lift, groove, breakdown; o laço volta ao groove (24 compassos, ~65 s) sem repetir a intro.
- **Instrumentos sintetizados:** pad com duas serras desafinadas e filtro, baixo triangular, arpejo pluck, sino, bumbo senoidal com queda de afinação, caixa e hat por ruído filtrado.
- **Agendador com lookahead:** um timer de 25 ms agenda os passos com 120 ms de antecedência no relógio do `AudioContext`; as notas nunca dependem de `setInterval`.
- **Mixagem:** barramento com ganho 0.28 e passa-baixa, fade-in de 1,6 s e fade-out de 0,5 s; medido offline, fica cerca de 9 dB abaixo dos efeitos de digitação.
- **Reage ao jogo:** combo de 3+ acrescenta arpejo e hats extras; nos últimos 10 s o filtro abre de 2,4 kHz para 9 kHz.
- **Comportamento:** só soa depois de um gesto (política de autoplay); começa na contagem, pausa com o jogo, com a aba oculta e ao abrir as configurações, retoma no compasso seguinte quando o jogo continua, e **para na tela de resultado** (silêncio para ler o placar). O botão Música liga e desliga de verdade e persiste; nada toca antes das preferências carregarem.

## Estrutura

```
src/
  env.ts                    # variáveis de ambiente (SvelteKit 3)
  hooks.server.ts           # <html lang> por rota
  app.css                   # tokens ZionCodes claro/escuro e animações
  lib/
    modules/
      game/                 # regras puras (níveis, baralho, pontuação, teclado ABNT2), estado da partida, recordes locais e componentes do jogo
      leaderboard/          # cliente HTTP, validação, schemas, limites, componentes e servidor (Neon/SQLite, rate limit)
      translation/          # banco en→pt, comparação, feedback e dica
      words/                # bancos de palavras pt e en
      i18n/                 # mensagens pt/en tipadas, rotas por idioma, formatação e seletor BR/US
      settings/             # preferências (tema, som), diálogo e alternador de tema
      seo/                  # Seo, JSON-LD, sitemap e robots
      audio/                # efeitos e trilha de fundo (music/: partitura tipada, agendador, instrumentos)
      layout/               # cabeçalho, rodapé e wordmark
      ui/                   # componentes genéricos (Button, Dialog, Chip...) e estado de UI (toasts)
      shared/               # storage seguro e guardas de teclado
      home/                 # página inicial
      play/                 # página de jogo
  routes/
    +page.svelte            # home pt-BR
    jogar/                  # jogo pt-BR
    en/ e en/play/          # home e jogo em inglês
    api/                    # endpoints do ranking
    robots.txt/ sitemap.xml/
e2e/                        # Playwright + axe
db/migrations/              # postgres/ e sqlite/
scripts/db-apply.ts         # aplica migrações nos dois drivers (Node 24 executa TypeScript direto)
```

## Deploy

1. Conecte o repositório na Netlify (`netlify.toml` já fixa Node 24).
2. Defina `PUBLIC_SITE_URL` e `DATABASE_URL` (Neon) e rode `npm run db:apply` contra o Neon.
3. Valide o deploy preview e promova para produção.
4. Rollback pelo histórico de deploys da Netlify; o schema é aditivo.

## Acessibilidade e desempenho

- Tema claro, escuro ou do sistema, sem flash no carregamento, com fallback se o storage estiver bloqueado.
- Navegação completa por teclado, foco visível, diálogos nativos com retorno de foco, `aria-live` para palavra, tempo e status.
- `prefers-reduced-motion` mantém a contagem visível e desliga tremidas e transições.
- Teclado virtual ABNT2 em três faixas (≤639 px compacto com faixa de acentos, 640–767 px sem teclas de função, ≥768 px completo), alvos de 44 px no celular. Em telas de toque o jogo abre o teclado nativo do aparelho por padrão; o botão do cabeçalho alterna para o teclado virtual.
- Testado com axe (WCAG 2.2 AA) nos dois temas e nas versões pt e en.
