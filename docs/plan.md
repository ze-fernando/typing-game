# Plano de implementação — Typing Game

- **Status:** planejamento
- **Data:** 19/10/2026
- **Fontes:** `docs/intro.md`, `docs/stack.md`, `docs/visual.md` e referências em `docs/assets/`
- **Stack:** SvelteKit 3 + Svelte 5 + TypeScript + Tailwind CSS 4
- **Deploy:** Netlify + Postgres (Neon) via `DATABASE_URL`
- **Objetivo:** entregar um jogo de digitação em português, responsivo, acessível e com boa indexação, com três níveis fixos, modo personalizado, teclado interativo, áudio, ranking e deploy na Netlify.

> Este documento é a fonte de verdade para execução e revisão. Nenhuma fase é considerada concluída sem passar pelo gate de code review descrito na seção 10.

> **Nota (2026-10-19, pós-fase 7):** o Netlify Database passou a exigir plano com créditos e o provisionamento automático falha em contas free (`database feature not available for this account`), derrubando o build. O ranking foi migrado para um Postgres **Neon** via `@neondatabase/serverless` + `DATABASE_URL`, com migrações em `db/migrations` aplicadas por `npm run db:apply`. Schema, endpoints e fallback `503` continuam iguais.

> **Nota (2026-10-22, entrega senior):** identidade visual trocada para ZionCodes (preto, azul #3b82f6/#2563eb, Saira), versão completa em inglês em `/en` e `/en/play` com i18n tipado, modo demo inglês → português (traduções alternativas e dica que vale metade), bancos com 150+ entradas por nível e modo, ranking por modo (`pt`, `en`, `en-pt`) e nível com teto de 1000 resultados, SQLite local via `node:sqlite` em dev/testes e Neon em produção, migrations em `db/migrations/postgres` e `db/migrations/sqlite`. A paleta da seção 5.2 e a tipografia Inter da seção 5.3 ficam substituídas por `DESIGN.md`. Detalhes e evidências em `docs/reviews/senior-entrega.md`.

---

## 1. Resumo do produto

O jogo apresenta uma tela de início com fundo animado de teclas em parallax e um menu de níveis com início imediato e atalhos de teclado (1–4). A partida acontece em uma tela com uma cena minimalista de superfície, teclado virtual interativo e foco total na palavra atual. O jogador digita palavras em português dentro do tempo do nível; ao final, vê velocidade (WPM), precisão, palavras concluídas e pode salvar o resultado no ranking.

A aplicação é **frontend-first**: toda a lógica do jogo roda no navegador. Não existe backend separado. As únicas rotas de servidor são endpoints do próprio SvelteKit, executados como Netlify Functions, para ler e gravar o ranking no Postgres do ranking (Neon, acessado via `DATABASE_URL`).

---

## 2. Requisitos consolidados

### 2.1 Requisitos funcionais

| ID    | Requisito                                                                                                      | Fase  |
| ----- | -------------------------------------------------------------------------------------------------------------- | ----- |
| RF-01 | Três níveis: iniciante (10 palavras, 35 s), amador (15 palavras, 30 s) e expert (30 palavras, 40 s).           | 3     |
| RF-02 | Banco de palavras em português com acentuação progressiva: leve, moderada e complexa.                          | 3     |
| RF-03 | Modo personalizado com 1 a 100 palavras e 5 a 120 segundos.                                                    | 2 e 3 |
| RF-04 | Menu de níveis na home inicia a partida direto; **Personalizado** abre o modal.                                | 2     |
| RF-05 | Home com fundo animado, parallax e teclas se movendo (não apenas bolhas).                                      | 2     |
| RF-06 | Modal de **Configurações** para ativar/desativar música e efeitos de teclas.                                   | 2 e 4 |
| RF-07 | Link do desenvolvedor para `https://zioncodes.squareweb.app` no rodapé.                                        | 2     |
| RF-08 | Rodapé com `© {ano atual} ZionCodes Todos os direitos reservados`.                                             | 1     |
| RF-09 | Tela de jogo com cena minimalista de teclado, sem adereços decorativos.                                        | 4     |
| RF-10 | Teclado visual interativo: teclas físicas animam, mouse/toque pressionam, Enter e Espaço têm animação própria. | 4     |
| RF-11 | Tema claro (azul-marinho + preto) e escuro (azul-marinho + branco), com persistência.                          | 1     |
| RF-12 | Ranking global por nível (Postgres/Neon) + recordes locais.                                                    | 5     |
| RF-13 | Layout moderno, bonito, responsivo de 360 px a telas grandes.                                                  | 1 a 6 |
| RF-14 | Boa indexação e SEO: SSR/prerender, metadados, sitemap, robots, dados estruturados.                            | 6     |
| RF-15 | Deploy na Netlify com banco (Neon) provisionado e migrações.                                                   | 7     |
| RF-16 | Code review obrigatório ao final de cada fase, com ciclo corrigir → rodar novamente.                           | Todas |

### 2.2 Requisitos não funcionais

- **Performance:** landing interativa sem travar; animações em `transform`/`opacity`, pausadas fora da tela; orçamento de JS inicial enxuto.
- **Acessibilidade:** WCAG 2.2 AA; navegação por teclado; foco visível; contraste; diálogos com foco gerenciado; `prefers-reduced-motion`; conteúdo não dependente só de cor.
- **SEO:** HTML semântico, `lang="pt-BR"`, títulos e descrições únicos, canonical, Open Graph, JSON-LD, sitemap e robots.
- **Responsividade:** sem rolagem horizontal; teclado compacto em telas pequenas; alvos de toque de no mínimo 24 × 24 px (ideal 44 × 44 px).
- **Privacidade:** apelido opcional, sem cadastro, sem armazenar IP; configurações e recordes locais no navegador.
- **Segurança:** entradas validadas, queries parametrizadas, segredos apenas no servidor, headers de segurança.
- **Manutenibilidade:** TypeScript estrito, funções puras testáveis, componentes pequenos, sem `try/catch`, sem classes de OOP e sem IDs de DOM como seletor.

### 2.3 Restrições de código

| Regra                               | Como aplicar                                                                                                                                                     | Verificação                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Sem `try/catch`                     | Erros esperados como valores (`safeParse`, `response.ok`, uniões discriminadas), `.catch()` em Promises, `handleError` e `+error.svelte` para erros inesperados. | `rg "try\s*\{" src` e `rg "catch\s*\(" src` devem retornar vazio. |
| Sem classes de OOP                  | Módulos, funções puras e factories. Classes CSS/Tailwind são permitidas.                                                                                         | `rg "^\s*(export\s+)?class\s" src` deve retornar vazio.           |
| Evitar IDs de DOM                   | Usar `data-*`, `bind:this`, semântica nativa e `aria-label`. IDs de banco são permitidos. Se um recurso de acessibilidade exigir ID, usar o mínimo e documentar. | `rg "\bid=" src` e `rg "getElementById" src` revisados.           |
| TypeScript estrito                  | `strict: true`, sem `any` gratuito e sem `@ts-ignore`.                                                                                                           | `npm run check`.                                                  |
| Código de servidor isolado          | Tudo que acessa banco fica em `src/lib/server/` e rotas `+server.ts`.                                                                                            | Revisão de imports e build.                                       |
| Conteúdo em pt-BR, código em inglês | Textos de UI em português; nomes de funções, tipos e arquivos em inglês.                                                                                         | Revisão.                                                          |
| Funções pequenas e testáveis        | Lógica de jogo em módulos puros, separada de componentes.                                                                                                        | Testes unitários.                                                 |

### 2.4 Premissas e decisões

| Tema                          | Decisão adotada                                                                                                                                                                                     | Se mudar                                                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Uso do mini banco             | Ranking global por nível (top 10) e recordes locais.                                                                                                                                                | A Fase 5 muda; o restante do jogo não depende do banco.                                                                             |
| Modo personalizado no ranking | Não entra no ranking global; salva apenas recorde local.                                                                                                                                            | Se entrar, exige regras de fairness e validação extra.                                                                              |
| Fim da partida                | Termina quando o tempo zera **ou** quando todas as palavras do baralho são concluídas.                                                                                                              | Se a intenção for exigir completar o baralho, ajustar tempo/quantidade; expert é um desafio de 30 palavras em 40 s e mostra `X/30`. |
| Acentuação                    | Comparação sensível a acentos e insensível a maiúsculas/minúsculas.                                                                                                                                 | É o que dá sentido à progressão de dificuldade.                                                                                     |
| Layout do teclado             | ABNT2 (inclui `Ç`, `´`, `~`, `^`), com versão compacta no mobile.                                                                                                                                   | Testar também teclado US na matriz de QA.                                                                                           |
| Pool personalizado            | As quatro listas somam 100 entradas, mas 99 palavras únicas (`mesa` aparece em iniciante e extras). O modo personalizado pode conter essa repetição; não deduplicar para preservar o limite de 100. | Se repetição for indesejada, limitar a 99 ou completar com repetição controlada.                                                    |
| Música                        | Trilha ambiente sintetizada via Web Audio API, sem arquivo externo e sem problema de licenciamento.                                                                                                 | Pode ser trocada por faixa royalty-free depois.                                                                                     |
| Domínio                       | A definir na Netlify; `PUBLIC_SITE_URL` configurável.                                                                                                                                               | Canonical, sitemap e OG usam essa variável.                                                                                         |
| Autenticação                  | Não haverá login. Ranking anônimo com apelido opcional.                                                                                                                                             | Exigiria nova fase de auth e moderação.                                                                                             |
| Escopo de “sem ID”            | Refere-se a IDs de DOM; IDs de banco (chave primária) são permitidos.                                                                                                                               | Se a intenção for banir IDs de banco também, revisar o schema.                                                                      |

---

## 3. Stack e arquitetura

### 3.1 Stack

- **SvelteKit 3.x** com **Svelte 5** (runes: `$state`, `$derived`, `$effect`, `$props`) e TypeScript estrito.
- **Tailwind CSS 4** via `@tailwindcss/vite` e tokens em CSS custom properties.
- **@sveltejs/adapter-netlify** para deploy.
- **@neondatabase/serverless** (Neon) para acesso ao Postgres do ranking (driver HTTP + tagged template parametrizado).
- **Vitest + Testing Library** para unidade/componentes; **Playwright** para E2E.
- **ESLint 9 (flat config) + Prettier**.
- **lucide-svelte** para ícones; **@fontsource-variable/inter** e **@fontsource/jetbrains-mono** (self-hosted, subset latin-ext).
- **Zod** para validação de payloads e configurações persistidas.

Versões de referência em outubro/2026: SvelteKit 3.1, Svelte 5.57, Tailwind 4.3, adapter-netlify 7, `@neondatabase/serverless` 1.2. Fixar tudo no `package-lock.json`.

### 3.2 Desenho da solução

```text
Navegador
├── Svelte 5: UI, estado, motor do jogo, áudio
├── /jogar: partida 100% client-side
└── fetch → /api/leaderboard e /api/scores
                 │
                 └── SvelteKit server (Netlify Functions)
                         └── @neondatabase/serverless → Postgres (Neon)
```

- A landing page e as páginas institucionais usam SSR/prerender para SEO.
- O jogo é hidratado no cliente e funciona mesmo se o banco estiver indisponível.
- O banco é usado apenas para ranking; não é necessário para iniciar ou concluir uma partida.
- Deploy previews usam o mesmo banco de produção (sem branches automáticos, que eram exclusivos do Netlify Database).

### 3.3 Estado e organização

- Estado global mínimo: tema e preferências de áudio (`settings.svelte.ts`).
- Estado da partida criado por factory (`createGame()`), sem singleton global e sem classes.
- Lógica pura separada: baralho, comparação de palavras, pontuação, timer e configurações de nível.
- Componentes apenas orquestram estado e renderização; regras ficam em `src/lib/game/`.

---

## 4. Estrutura de pastas prevista

```text
typing-game/
├── docs/
│   ├── intro.md
│   ├── stack.md
│   ├── visual.md
│   ├── plan.md
│   ├── assets/
│   └── reviews/                  # criado na Fase 0; um registro por fase
├── netlify/
│   └── database/migrations/      # migrações SQL aplicadas pela Netlify
├── e2e/                          # testes Playwright
├── static/
│   ├── favicon.svg
│   ├── og.png
│   ├── robots.txt                # opcional se gerado por rota
│   └── manifest.webmanifest
├── src/
│   ├── app.css
│   ├── app.html
│   ├── app.d.ts
│   ├── hooks.server.ts           # handleError, headers
│   ├── lib/
│   │   ├── assets/               # SVGs do cenário e ilustrações
│   │   ├── audio/                # Web Audio API (SFX + trilha)
│   │   ├── components/
│   │   │   ├── background/       # teclas flutuantes/parallax
│   │   │   ├── game/             # HUD, palavra, teclado, cenário, resultados
│   │   │   ├── layout/           # header, footer, shell
│   │   │   ├── modals/           # nível, configurações, resultados
│   │   │   └── ui/               # botão, dialog, toggle, toast
│   │   ├── game/
│   │   │   ├── words.ts
│   │   │   ├── levels.ts
│   │   │   ├── deck.ts
│   │   │   ├── engine.ts
│   │   │   ├── scoring.ts
│   │   │   ├── keyboard-layout.ts
│   │   │   └── types.ts
│   │   ├── seo/                  # metadados, JSON-LD, canonical
│   │   ├── server/
│   │   │   ├── db.ts
│   │   │   └── leaderboard.ts
│   │   ├── stores/
│   │   │   ├── settings.svelte.ts
│   │   │   └── game.svelte.ts
│   │   └── utils/                # storage, números, strings
│   └── routes/
│       ├── +layout.svelte
│       ├── +layout.ts
│       ├── +page.svelte
│       ├── +page.ts
│       ├── +error.svelte
│       ├── jogar/+page.svelte
│       ├── api/leaderboard/+server.ts
│       ├── api/scores/+server.ts
│       ├── sitemap.xml/+server.ts
│       └── robots.txt/+server.ts
├── netlify.toml
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 5. Design system e experiência

### 5.1 Princípios

- **Palavra em primeiro lugar**, no espírito de Termo/Contexto: interface limpa, tipografia forte, HUD discreto.
- **Tátil, não infantil:** teclas com profundidade, sombras e resposta ao toque; brilho contido.
- **Movimento com propósito:** parallax e animações decorativas não podem competir com a leitura da palavra.
- **Azul-marinho como base**, preto/branco como contraste, cores semânticas apenas para feedback.
- **Mobile de verdade:** teclado compacto, sem overflow, com o campo de palavra sempre visível.

### 5.2 Paleta

| Token             | Claro     | Escuro    | Uso                     |
| ----------------- | --------- | --------- | ----------------------- |
| `--bg`            | `#F5F8FC` | `#030A16` | Fundo geral             |
| `--surface`       | `#FFFFFF` | `#071426` | Cards e painéis         |
| `--surface-2`     | `#E8EFF8` | `#0B1E38` | Superfícies secundárias |
| `--text`          | `#05070D` | `#FFFFFF` | Texto principal         |
| `--text-muted`    | `#46536A` | `#A8B6CB` | Texto secundário        |
| `--primary`       | `#0A2A52` | `#FFFFFF` | Ação principal          |
| `--primary-hover` | `#123E73` | `#DCE8F8` | Hover da ação           |
| `--on-primary`    | `#FFFFFF` | `#061326` | Texto sobre ação        |
| `--border`        | `#C9D5E4` | `#1E3554` | Bordas                  |
| `--focus`         | `#1D4ED8` | `#93C5FD` | Anel de foco            |
| `--success`       | `#15803D` | `#4ADE80` | Acerto                  |
| `--danger`        | `#B91C1C` | `#F87171` | Erro                    |
| `--warning`       | `#B45309` | `#FBBF24` | Aviso/tempo baixo       |
| `--key-bg`        | `#080D16` | `#0B1322` | Teclas                  |
| `--key-text`      | `#FFFFFF` | `#FFFFFF` | Legendas das teclas     |

- A cena do teclado usa os tokens do próprio tema (fundo elevado, grade sutil e brilho suave), sem adereços decorativos; os painéis de UI seguem o tema.
- Contrastes devem ser validados com ferramenta (mínimo AA; ideal AAA para texto da palavra).

### 5.3 Tipografia e escalas

- **UI:** Inter Variable; corpo 16 px/1.6; títulos com `clamp()`.
- **Jogo:** JetBrains Mono 600 para a palavra e legendas de tecla; tamanho fluido com `clamp(1.5rem, 5vw, 4rem)`.
- **Fontes self-hosted** com subset `latin-ext` para acentos; `font-display: swap`; preload apenas do critical.
- Espaçamento em múltiplos de 4 px; raios de 8–20 px; sombras suaves e em camadas.
- Animações entre 120 e 250 ms; `prefers-reduced-motion` reduz para fade/estado estático.

### 5.4 Componentes principais

| Componente              | Responsabilidade                                                           |
| ----------------------- | -------------------------------------------------------------------------- |
| `BackgroundKeys`        | Camadas de teclas flutuantes com parallax de ponteiro e animação autônoma. |
| `SiteHeader`            | Marca, tema, configurações e navegação mínima.                             |
| `SiteFooter`            | Copyright com ano atual e links.                                           |
| `Button` / `IconButton` | Variantes primária, secundária, fantasma e perigo.                         |
| `Dialog`                | Wrapper de `<dialog>` nativo, backdrop, animação e foco.                   |
| `LevelDialog`           | Escolha dos três níveis + modo personalizado.                              |
| `SettingsDialog`        | Música, efeitos, tema e reset de preferências.                             |
| `WordDisplay`           | Palavra atual, letras corretas/erradas/pendentes e dica de acento.         |
| `GameHud`               | Tempo, progresso, WPM, precisão, pausa e nível.                            |
| `VirtualKeyboard`       | Teclado ABNT2 interativo, sincronizado com teclado físico.                 |
| `DeskScene`             | Mesa, mousepad com mapa, caneca, notebook e mouse ilustrados.              |
| `ResultsDialog`         | Estatísticas, recorde, envio ao ranking e ações.                           |
| `Leaderboard`           | Top 10 por nível, estados de carregamento/erro/vazio.                      |
| `Toast`                 | Feedback não bloqueante (ex.: ranking indisponível).                       |

### 5.5 Breakpoints e comportamento

- **360–639 px:** teclado compacto (sem F-row e cluster de navegação), HUD em duas linhas, cenário simplificado; palavra sempre visível ao digitar.
- **640–1023 px:** teclado intermediário; props laterais reduzidos.
- **1024 px+:** cena completa com todos os elementos; teclado TKL ABNT2.
- **Até 1440 px+:** largura máxima confortável; fundo expande.
- Evitar overflow horizontal; testar zoom de 200% e orientação paisagem no celular.

### 5.6 Acessibilidade

- Todos os fluxos operáveis apenas por teclado.
- Diálogos nativos com foco preso, Escape, retorno de foco e título acessível.
- `aria-live="polite"` para nova palavra, acerto/erro e status; timer com `role="timer"` e anúncios econômicos (10 s, 5 s, 3, 2, 1).
- Não depender só de cor: ícones, texto e animação/estado.
- `prefers-reduced-motion` desliga parallax, flutuação e transições longas.
- Teclado virtual é complementar; o campo de texto nativo permanece funcional.
- Instruções curtas antes da partida: “Digite a palavra e pressione Espaço ou Enter”.

---

## 6. Telas e fluxos

### 6.1 Home (`/`)

- Header com marca, alternador de tema e botão de configurações.
- Hero compacto: título curto e uma linha de apoio, sem CTAs de marketing nem selos.
- Menu de níveis em lista, com início imediato por item:
  - iniciante, amador e expert com palavras, tempo, acentuação e melhor recorde local;
  - “Personalizado” abre o modal de partida personalizada;
  - atalhos de teclado 1–4.
- Painel único de ranking: abas por nível, top 10 e botão de atualizar.
- Conteúdo enxuto para SEO: instruções em uma linha e FAQ curta em `details`.
- Fundo animado com teclas em pelo menos três camadas de profundidade, parallax suave e movimento contínuo.
- Rodapé com `© {ano} ZionCodes Todos os direitos reservados`; ano calculado em runtime e corrigido no cliente para virar o ano sem novo deploy; link do desenvolvedor (`target="_blank"`, `rel="noopener noreferrer"`).
- _Revisão 2026-10-19: a home deixa de ser landing page; indicadores e CTA secundário do hero saem, as seções “como jogar”, “níveis” e “recursos” viram o próprio menu e o link do desenvolvedor fica só no rodapé._

### 6.2 Modal de partida personalizada

- Aberto pelo item “Personalizado” do menu da home (ou atalho 4).
- Sliders de palavras (1–100) e tempo (5–120 s) com resumo dinâmico.
- Aviso de que o modo não entra no ranking global e o recorde fica no navegador.
- Botão inicia a partida via `/jogar?nivel=personalizado&palavras=N&tempo=S`.
- Parâmetros inválidos nunca quebram a página: exibem mensagem e CTA para voltar à escolha.

### 6.3 Modal de configurações

- Música: ligada/desligada.
- Efeitos de teclas: ligados/desligados.
- Tema: sistema, claro, escuro.
- Volume (opcional, se houver tempo): música e efeitos.
- Resetar preferências.
- Alterações aplicadas na hora e persistidas; áudio só começa após gesto do usuário.

### 6.4 Tela de jogo (`/jogar`)

- Top bar: voltar (com confirmação se a partida estiver em andamento), nível, timer, progresso, precisão e pausa.
- Card central com a palavra atual e feedback letra a letra.
- Cena minimalista de superfície com o teclado interativo em destaque; sem adereços decorativos.
- Contagem regressiva 3-2-1 antes de liberar a digitação; o timer do nível só começa depois.
- Pausa manual e automática ao trocar de aba (`visibilitychange`), com overlay de retomada.
- Mobile: HUD compacto, palavra fixa na parte superior e teclado na parte inferior.

### 6.5 Resultados

- Estatísticas: palavras concluídas/total, WPM, precisão, tempo ativo, caracteres corretos.
- Novo recorde local e posição no ranking (quando aplicável).
- Campo de apelido opcional (máx. 20 caracteres) e envio ao ranking.
- Ações: jogar novamente (novo embaralhamento), trocar nível, voltar ao início.
- Se o banco falhar, mostra fallback local e mensagem discreta; a partida nunca é perdida.

### 6.6 Estados de erro

- `+error.svelte` com mensagem amigável e link para a home.
- Ranking offline: estado vazio com aviso.
- Rota/parâmetro inválido: mensagem clara, sem stack trace.
- 404 estilizado.

---

## 7. Regras do jogo

### 7.1 Configuração dos níveis

| Nível         | Palavras |   Tempo | Acentuação              | Ranking       |
| ------------- | -------: | ------: | ----------------------- | ------------- |
| Iniciante     |       10 |    35 s | leve                    | global        |
| Amador        |       15 |    30 s | moderada                | global        |
| Expert        |       30 |    40 s | complexa                | global        |
| Personalizado |    1–100 | 5–120 s | misto (todas as listas) | somente local |

- As palavras devem ser copiadas **verbatim** de `docs/visual.md` para `src/lib/game/words.ts`.
- Os nomes dos níveis no código usam os identificadores `iniciante`, `amador`, `expert` e `personalizado`.
- O baralho de cada nível é embaralhado no início da partida (Fisher–Yates com `crypto.getRandomValues` quando disponível).
- O modo personalizado usa o pool unificado das quatro listas: 100 entradas, 99 palavras únicas (a palavra `mesa` aparece em iniciante e extras).

### 7.2 Fluxo da partida

```text
entrada → contagem (3 s) → jogando ⇄ pausado → finalizado
                                  └──────────→ finalizado (tempo zerou ou baralho acabou)
```

- **Início:** usuário escolhe o nível, navega para `/jogar`, vê instruções e contagem.
- **Digitação:** campo de texto controlado recebe a entrada; o teclado virtual insere caracteres e comandos no mesmo estado.
- **Envio:** `Espaço` ou `Enter` submete a palavra atual.
- **Acerto:** avança para a próxima palavra, toca som de acerto e atualiza métricas.
- **Erro:** destaca letras divergentes, treme o card, toca som de erro, registra a tentativa e **não avança**. O jogador pode corrigir ou limpar com `Escape`.
- **Fim:** tempo zerado ou última palavra concluída.
- **Reinício:** novo embaralhamento, mesmas configurações.
- **Pausa:** congela o tempo ativo; retomada continua de onde parou.

### 7.3 Entrada e composição

- Comparação **sensível a acentos** e **insensível a caixa** (`toLocaleLowerCase('pt-BR')`).
- Usar input nativo com `autocomplete="off"`, `autocapitalize="off"`, `autocorrect="off"`, `spellcheck="false"`.
- Tratar `compositionstart`/`compositionend` para teclas mortas (ABNT2) e IME; não submeter durante composição.
- Teclado físico: `keydown`/`keyup` apenas animam as teclas visuais; o texto entra pelo input nativo para preservar acentos.
- Teclado virtual: `pointerdown` aplica o caractere/backspace/envio e anima a tecla; suportar toque e mouse.
- Enter e Espaço têm animação dedicada; o mouse ilustrado reage ao clique.
- Teclas modificadoras (Shift, Ctrl, Alt, AltGr) não inserem texto; servem para estado visual.
- Teclas repetidas: a animação acompanha o `repeat`, sem duplicar caracteres além do comportamento normal do input.

### 7.4 Métricas

```text
WPM = (caracteres corretos / 5) / duração ativa em minutos
precisão = (1 - erros de caractere / caracteres comparados) × 100
```

- Caracteres são contados por code point (`Array.from`) para lidar com acentos.
- Tempo ativo exclui pausas e a contagem regressiva.
- No envio de uma palavra, comparar a entrada com o alvo caractere a caractere; caracteres extras contam como erro.
- Ranking ordena por WPM, depois precisão, depois data de criação.
- O servidor recalcula WPM e precisão a partir dos dados brutos enviados (caracteres corretos, comparados e duração) e valida faixas plausíveis.
- Não há compensação por palavras não concluídas; o resultado mostra `X/total`.

### 7.5 Áudio

- `AudioContext` criado apenas após gesto do usuário.
- Efeitos sintetizados: clique de tecla, erro, acerto, contagem e fim.
- Trilha ambiente sintetizada em loop, volume baixo; sem autoplay.
- Toggles separados para música e efeitos; persistidos.
- Suspender áudio em pausa, fim de partida e aba oculta.
- Falha ao inicializar áudio nunca bloqueia o jogo (`Promise.catch`).

### 7.6 Casos de borda

- Tempo termina durante composição: finalizar após o evento de composição, sem perder a palavra.
- Fim exato enquanto a última palavra é submetida: vitória por baralho concluído.
- Aba oculta: pausar automaticamente e mostrar overlay ao voltar.
- Sem palavras restantes: finalizar mesmo com tempo sobrando.
- Parâmetros de URL fora do intervalo: mensagem e retorno à seleção.
- Preferência de movimento reduzido: sem parallax/flutuação; feedback por opacidade/cor.
- Sem armazenamento local: jogo funciona em memória; preferências voltam ao padrão.
- Banco indisponível: ranking degrada; partida e recorde local continuam.

---

## 8. Dados, API e Postgres (Neon)

### 8.1 Schema

Migração em `db/migrations/<timestamp>_create_leaderboard_scores.sql` (idempotente, aplicada com `npm run db:apply`):

```sql
CREATE TABLE leaderboard_scores (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nickname VARCHAR(20) NOT NULL DEFAULT 'Anônimo',
  level VARCHAR(16) NOT NULL CHECK (level IN ('iniciante', 'amador', 'expert')),
  words_completed SMALLINT NOT NULL CHECK (words_completed >= 0),
  words_total SMALLINT NOT NULL CHECK (words_total > 0),
  correct_chars INTEGER NOT NULL CHECK (correct_chars >= 0),
  compared_chars INTEGER NOT NULL CHECK (compared_chars >= 0),
  duration_ms INTEGER NOT NULL CHECK (duration_ms > 0),
  wpm NUMERIC(6,2) NOT NULL CHECK (wpm >= 0 AND wpm <= 300),
  accuracy NUMERIC(5,2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX leaderboard_scores_ranking_idx
  ON leaderboard_scores (level, wpm DESC, accuracy DESC, created_at ASC);
```

- `id` de banco é permitido; a restrição de IDs vale para o DOM.
- Sem tabela de usuários, sem e-mail, sem IP.
- Migrações são aplicadas manualmente com `npm run db:apply` (usa `DATABASE_URL`); a Netlify não provisiona mais banco.

### 8.2 Endpoints

#### `GET /api/leaderboard?nivel=iniciante&limite=10`

- Valida `nivel` com Zod (`iniciante | amador | expert`) e `limite` entre 1 e 20.
- Retorna os melhores por WPM, depois precisão, depois data.
- Resposta:

```json
{
	"scores": [
		{
			"nickname": "Zion",
			"level": "iniciante",
			"wordsCompleted": 10,
			"wordsTotal": 10,
			"wpm": 62.4,
			"accuracy": 97.5,
			"createdAt": "2026-10-19T14:00:00.000Z"
		}
	]
}
```

- Cache: `s-maxage=30, stale-while-revalidate=300`.

#### `POST /api/scores`

Payload:

```json
{
	"nickname": "Zion",
	"level": "iniciante",
	"wordsCompleted": 10,
	"wordsTotal": 10,
	"correctChars": 48,
	"comparedChars": 50,
	"durationMs": 35000
}
```

- Validação estrita de tipos, intervalos e coerência (`wordsCompleted <= wordsTotal`, `correctChars <= comparedChars`, duração compatível com o nível).
- `nickname` é opcional; normalizar Unicode NFC, remover caracteres de controle, limitar a 20 caracteres e aceitar letras/números/espaço/hífen.
- O servidor calcula `wpm` e `accuracy`; o cliente não envia valores finais.
- Respostas: `201` criado, `400` inválido, `429` limite de taxa, `503` banco indisponível.
- Nenhum `try/catch`: JSON inválido é tratado com `request.json().catch(() => null)`, falhas de banco com `.catch` mapeadas para `503`, e erros inesperados seguem para `handleError`.

### 8.3 Acesso ao banco

```ts
// src/lib/server/db.ts (resumo)
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$app/env/private';

export function getSql() {
	if (!DATABASE_URL) return null;
	return neon(DATABASE_URL);
}
```

- Todo acesso fica em `src/lib/server/`, nunca importado pelo cliente.
- Consultas sempre parametrizadas via tagged template.
- Sem ORM e sem transações no MVP (apenas insert/select simples).
- `DATABASE_URL` é privada, lida em runtime via `$app/env/private`; sem ela a API responde `503`.
- Desenvolvimento local: defina `DATABASE_URL` no `.env` (projeto Neon próprio) e rode `npm run db:apply`.

### 8.4 Comandos de banco

```bash
npm install @neondatabase/serverless
npm run db:apply   # aplica db/migrations usando DATABASE_URL
```

- `DATABASE_URL` é privada (somente servidor); não expor em variáveis públicas.
- `PUBLIC_SITE_URL` é a única variável pública necessária.

### 8.5 Ranking e fallback

- Ranking global exibido na home (top 10 com abas por nível) e nos resultados (top 10 do nível).
- Recordes locais por nível em `localStorage` (`typing-game:bests:v1`), sempre exibidos.
- Modo personalizado não envia resultado.
- Se a API falhar, o componente de ranking mostra estado de erro/vazio e o jogo segue normalmente.
- Limitação assumida: sem autenticação, não é possível impedir trapaça sofisticada; validar faixas e limitar taxa reduz abuso trivial.

---

## 9. Fases de implementação

Cada fase termina com o **gate de review** da seção 10. As estimativas são indicativas e incluem revisão.

**Status em 2026-10-19:** fases 0 a 6 implementadas e aprovadas nos gates locais (`check`, `lint`, `test`, `build` e `test:e2e`); site criado e conectado ao repositório na Netlify, com o provisionamento do banco migrado para Neon (ver nota no topo). Pendências manuais: `DATABASE_URL` + migração, `PUBLIC_SITE_URL`, deploy e smoke test. Registros completos em `docs/reviews/`.

> Revisão visual de 2026-10-19: home com menu de níveis direto e atalhos 1–4, cena do teclado minimalista (sem adereços) e ranking/modal personalizado enxutos — detalhes na seção 6.

### Fase 0 — Fundação do projeto (0,5 dia)

- [x] Inicializar git, `.gitignore` e README.
- [x] Criar projeto SvelteKit 3 + Svelte 5 + TypeScript estrito. Como a pasta já contém `docs/`, scaffoldar em diretório temporário e mover os arquivos, preservando a documentação.
- [x] Instalar e configurar Tailwind CSS 4, fontes, ícones e alias `$lib`.
- [x] Configurar ESLint, Prettier, Vitest, Testing Library e Playwright.
- [x] Instalar `@sveltejs/adapter-netlify` e criar `netlify.toml`.
- [x] Configurar scripts: `dev`, `build`, `preview`, `check`, `lint`, `format`, `test`, `test:e2e`, `db:apply`.
- [x] Criar `.env.example` com `PUBLIC_SITE_URL`.
- [x] Criar `docs/reviews/` e o template de revisão.
- [x] Página inicial mínima + `+error.svelte`.

**Aceite:** `npm run dev` funciona; `npm run check`, `npm run lint`, `npm run test` e `npm run build` passam; build gera saída compatível com Netlify; nenhuma violação das restrições de código.

### Fase 1 — Design system e shell (0,5–1 dia)

- [x] Tokens de cor, tipografia, espaçamento, sombras, foco e movimento em `app.css`.
- [x] Tema claro/escuro/sistema com persistência e sem flash inicial (script inline mínimo em `app.html`).
- [x] Fontes self-hosted com subset latin-ext.
- [x] Componentes base: `Button`, `IconButton`, `Dialog`, `Toggle`, `Toast`, `Tag`, `SiteHeader`, `SiteFooter`, `SeoHead`.
- [x] Diálogo nativo acessível (foco, Escape, backdrop, retorno de foco).
- [x] Layout raiz, página 404 e error boundary.
- [x] Rodapé com ano atual.

**Aceite:** contraste AA; foco visível; tema persiste após reload; sem flash claro/escuro; navegação por teclado nos componentes; 360 px sem overflow; build limpo.

### Fase 2 — Home, níveis e configurações (1–1,5 dia)

- [x] Fundo animado `BackgroundKeys` com três camadas, parallax de ponteiro e pausa fora da tela.
- [x] Hero, menu de níveis, ranking e FAQ (revisão 2026-10-19: layout enxuto, início direto e atalhos 1–4).
- [x] Link do desenvolvedor com segurança (`rel="noopener noreferrer"`), no rodapé.
- [x] Modal de partida personalizada com validação (os níveis fixos iniciam direto do menu).
- [x] Navegação para `/jogar` com query params validados.
- [x] Modal de configurações com música, efeitos e tema.
- [x] Persistência de preferências (`typing-game:settings:v1`).
- [x] Primeiros testes E2E: home, abertura de modais, link e ano do rodapé.

**Aceite:** RF-03 a RF-08 atendidos; modal fecha por Escape/backdrop; foco retorna ao botão de origem; personalizado limita 1–100 palavras e 5–120 s; tema e toggles persistem; background respeita `prefers-reduced-motion`.

### Fase 3 — Motor do jogo (1,5–2 dias)

- [x] Copiar as listas de `docs/visual.md` e validar contagens (10/15/30/45).
- [x] Configuração de níveis, baralho, embaralhamento e parsing de query params.
- [x] Máquina de estados: entrada, contagem, jogando, pausado, finalizado.
- [x] Timer com `performance.now()`, pausa e retomada sem drift.
- [x] Campo de entrada com composição/IME, comparação de acentos e feedback letra a letra.
- [x] Envio por Espaço/Enter, erro sem avançar, Escape para limpar.
- [x] Cálculo de WPM/precisão e tela de resultados.
- [x] Recordes locais e reinício com novo baralho.
- [x] Testes unitários das funções puras e E2E de uma partida completa.

**Aceite:** três níveis com tempos corretos; personalizado funciona; acentos são obrigatórios; case-insensitive; timer pausa/retoma; resultados corretos; nenhuma partida quebra com parâmetro inválido.

### Fase 4 — Cenário, teclado e áudio (1,5–2 dias)

- [x] `DeskScene` minimalista em CSS: superfície do tema, grade sutil e brilho suave (a revisão de 2026-10-19 removeu madeira, mousepad, caneca, notebook, mouse e cabos).
- [x] `VirtualKeyboard` ABNT2 em camadas 3D, com versão compacta no mobile.
- [x] Sincronizar teclado físico com teclas visuais (`keydown`/`keyup`, incluindo Enter/Espaço).
- [x] Teclado virtual insere texto, backspace e envio; mouse/toque animam a tecla.
- [x] Adereços de cena (mouse ilustrado, caneca/steam e cabos) removidos na revisão minimalista de 2026-10-19.
- [x] Motor de áudio: SFX e trilha sintetizada, lazy init, toggles e suspensão.
- [x] Responsividade e `prefers-reduced-motion`.
- [ ] Medir FPS e reduzir camadas se necessário. _(proxy: Lighthouse TBT 0–250 ms e mobile em 91 de performance; medição direta de FPS fica como verificação manual)_

**Aceite:** RF-09 e RF-10 atendidos; teclado físico e virtual funcionam juntos; Enter/Espaço animam; mouse/toque pressionam; áudio só após gesto; toggles funcionam; mobile sem overflow; 60 fps em desktop médio.

### Fase 5 — Ranking e banco de dados (0,5–1 dia)

- [x] Migração `leaderboard_scores` em `db/migrations` e `npm run db:apply`. _(adaptado: Netlify Database exige plano com créditos; banco migrado para Neon — ver nota no topo)_
- [x] `src/lib/server/db.ts` e `src/lib/server/leaderboard.ts`.
- [x] `GET /api/leaderboard` e `POST /api/scores` com Zod, limites e respostas de erro.
- [x] Proteções básicas: validação estrita, normalização de apelido, limite de taxa best-effort e cache de leitura.
- [x] UI de ranking na home e nos resultados; envio opcional de apelido.
- [x] Fallback local quando a API falhar.
- [x] Testes de validação, ordenação e E2E com API mockada.

**Aceite:** migração aplica localmente; top 10 ordena por WPM/precisão; modo personalizado não envia; banco indisponível não quebra o jogo; nenhum segredo no cliente.

### Fase 6 — SEO, performance, acessibilidade e QA (1 dia)

- [x] `SeoHead` com title/description/canonical/OG/Twitter por rota.
- [x] JSON-LD `WebApplication` e `FAQPage` na home.
- [x] OG image 1200×630, favicon, manifest e `theme-color`.
- [x] Sitemap e robots gerados por rota.
- [x] Headers de segurança na Netlify.
- [x] Auditoria Lighthouse mobile/desktop; ajustes de bundle, fontes e animações.
- [x] Suite E2E completa + axe.
- [ ] Matriz manual de navegadores/dispositivos/temas/movimento reduzido. _(parcial: temas e movimento reduzido cobertos por E2E; navegadores e dispositivos físicos ficam como verificação de entrega)_
- [x] Conteúdo e metadados revisados em pt-BR.

**Aceite:** SEO/Acessibilidade/Boas Práticas ≥ 95 no Lighthouse; Performance ≥ 85 mobile e ≥ 90 desktop; LCP < 2,5 s, CLS < 0,1, INP < 200 ms; sem erros de console; todos os fluxos E2E verdes.

### Fase 7 — Deploy e entrega (0,5 dia)

- [x] Criar site na Netlify e conectar o repositório. _(feito em 19/10/2026; primeiro build falhou no provisionamento automático do Netlify Database)_
- [ ] Criar projeto Neon, definir `DATABASE_URL` (local e Netlify) e aplicar a migração (`npm run db:apply`). _(manual: requer conta Neon)_
- [ ] Configurar `PUBLIC_SITE_URL`, build e adapter. _(manual: requer conta Netlify)_
- [ ] Validar deploy preview e depois produção. _(manual: requer conta Netlify)_
- [ ] Smoke test: home, jogo, configurações, ranking e banco. _(manual: requer conta Netlify)_
- [x] Documentar deploy e variáveis no README.
- [x] Revisão final e atualização deste plano.

**Aceite:** URL de produção funcional; banco gravando/lendo; deploy preview funcional; rollback documentado; todos os requisitos rastreáveis atendidos.

---

## 10. Protocolo de code review por etapa

O review é um gate obrigatório, não uma etapa opcional. O ciclo é sempre: **revisar → registrar → corrigir → rodar tudo novamente → aprovar**.

### 10.1 Comandos do gate

```bash
npm run check
npm run lint
npm run test
npm run build
npm run test:e2e   # obrigatório a partir da Fase 2
```

Verificações mecânicas complementares:

```bash
rg "try\s*\{|catch\s*\(" src
rg "^\s*(export\s+)?class\s" src
rg "\bid=" src
rg "getElementById" src
rg "from ['\"]\\$lib/server" src/routes src/lib/components
```

- `try/catch`, classes de OOP e IDs de DOM devem retornar vazio (ou ter justificativa documentada).
- Imports de `$lib/server` não podem existir em componentes/client.
- Nenhum segredo ou URL de banco em código público.

### 10.2 Checklist de revisão

**Requisitos**

- [ ] A fase atende aos RFs mapeados e não quebrou fases anteriores.
- [ ] Textos em português, acentuação correta.
- [ ] Comportamento em telas pequenas e grandes.

**Código**

- [ ] Sem `try/catch`, sem classes de OOP, sem IDs de DOM como seletor.
- [ ] Funções pequenas, nomes claros, sem `any`/`@ts-ignore`.
- [ ] Lógica pura separada de UI.
- [ ] Sem código morto, logs de debug ou dependências desnecessárias.
- [ ] Acessibilidade e estados de erro tratados.

**UI/UX**

- [ ] Foco visível e ordem de tabulação correta.
- [ ] Diálogos fecham por Escape/backdrop e devolvem foco.
- [ ] Tema claro/escuro consistente.
- [ ] `prefers-reduced-motion` respeitado.
- [ ] Sem overflow horizontal; alvos de toque adequados.
- [ ] Estados de carregamento, vazio, erro e sucesso.

**SEO/Performance**

- [ ] Metadados e semântica corretos.
- [ ] Sem CLS perceptível; imagens/fontes otimizadas.
- [ ] Animações pausadas fora da tela.
- [ ] Bundle sem dependência pesada injustificada.

**Segurança/Dados**

- [ ] Validação no servidor, queries parametrizadas.
- [ ] Nenhum dado sensível no cliente.
- [ ] Fallback quando API/banco falham.

### 10.3 Registro e ciclo

Criar `docs/reviews/fase-N.md` com:

```markdown
# Revisão — Fase N

- Data:
- Escopo:
- Comandos executados:
- Resultado dos comandos:
- Achados bloqueantes:
- Achados não bloqueantes:
- Correções aplicadas:
- Evidências (screenshots/logs):
- Resultado final: aprovado | precisa de nova rodada
```

Regras:

1. Fazer uma passada de revisão **sem editar** o código; listar os achados.
2. Corrigir os bloqueantes e os não bloqueantes acordados.
3. Rodar o gate completo novamente.
4. Repetir até não haver achados bloqueantes.
5. Só então marcar a fase como concluída e avançar.
6. Atualizar os checkboxes deste plano e o registro da fase.

**Achados bloqueantes:** requisito não atendido, falha de acessibilidade grave, bug funcional, violação das restrições de código, risco de segurança, teste quebrado ou build vermelho.

---

## 11. Plano de testes e QA

### 11.1 Testes unitários (Vitest)

| Módulo       | Casos principais                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| `levels`     | Quantidades e tempos corretos; nível inválido; personalizado dentro/fora dos limites.                        |
| `deck`       | Embaralhamento usa todas as palavras; nova partida gera nova ordem; 100 entradas do pool personalizado.      |
| `engine`     | Transições da máquina de estados; contagem; pausa/retomada; fim por tempo e por baralho.                     |
| `scoring`    | WPM e precisão com valores conhecidos; acentos/code points; zero palavras; entrada vazia; caracteres extras. |
| `input`      | Comparação case-insensitive e accent-sensitive; composição; backspace; Escape.                               |
| `query`      | Parsing de nível/palavras/tempo; valores inválidos; fallback.                                                |
| `validation` | Apelido, payload de score, limites e coerência.                                                              |
| `settings`   | Defaults; parse de JSON inválido; persistência; reset.                                                       |
| `timer`      | Tempo ativo sem drift; pausa; visibilidade da aba.                                                           |

### 11.2 Testes E2E (Playwright)

1. Home carrega com título, H1, menu de níveis e ano atual.
2. Modal de partida personalizada abre/fecha por Escape, backdrop e botão.
3. Menu mostra 10/35 s, 15/30 s e 30/40 s; atalhos 1–4 iniciam os níveis.
4. Personalizado valida limites e inicia com os parâmetros corretos.
5. Partida iniciante: contagem, digitação da primeira palavra e atualização do HUD.
6. Palavra errada: feedback, sem avanço, correção e envio.
7. Envio por Espaço e Enter; animação das teclas.
8. Clique/toque em tecla virtual insere caractere e anima.
9. Pausa manual e automática por visibilidade.
10. Fim por tempo e por baralho; estatísticas corretas.
11. Configurações: música/efeitos/tema persistem após reload.
12. Link do desenvolvedor no rodapé com URL e `rel` corretos.
13. Ranking: envio, top 10 e ordenação (API mockada e/ou banco local).
14. Falha da API: jogo continua e ranking mostra fallback.
15. Mobile 360 px: sem overflow, teclado compacto, palavra visível.
16. `prefers-reduced-motion`: sem parallax/flutuação.
17. Axe sem violações críticas nas telas principais.

### 11.3 Matriz manual

| Dimensão       | Cobertura                                                      |
| -------------- | -------------------------------------------------------------- |
| Navegadores    | Chrome, Firefox, Safari (desktop) e Safari iOS/Chrome Android. |
| Teclados       | ABNT2 físico, US físico, teclado virtual/toque.                |
| Viewports      | 360×640, 768×1024, 1280×720, 1440×900, 1920×1080.              |
| Temas          | Claro, escuro, sistema.                                        |
| Movimento      | Normal e `prefers-reduced-motion`.                             |
| Áudio          | Ligado, desligado, aba oculta, pausa.                          |
| Rede/banco     | Online, API lenta, API indisponível.                           |
| Acessibilidade | Navegação só por teclado, zoom 200%, leitor de tela básico.    |

### 11.4 Metas de qualidade

- Lighthouse mobile: Performance ≥ 85; Acessibilidade, SEO e Boas Práticas ≥ 95.
- Lighthouse desktop: Performance ≥ 90.
- Core Web Vitals: LCP < 2,5 s; CLS < 0,1; INP < 200 ms.
- Sem erros no console em fluxos normais.
- Build e type-check sem warnings bloqueantes.
- Cobertura de testes focada nas regras de jogo e validações (não perseguir percentual global).

---

## 12. Riscos e mitigação

| Risco                                                | Impacto                        | Mitigação                                                                                                                 |
| ---------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Fundo animado pesado em celulares                    | Travamentos e queda de SEO     | Camadas limitadas, `transform`/`opacity`, pausa fora da tela, reduced motion, testes em dispositivo real.                 |
| Expert quase impossível (30 palavras longas em 40 s) | Frustração                     | Baralho é um pool, não meta obrigatória; resultado mostra progresso; ajustar apenas com dados de uso.                     |
| Teclas mortas/acentos no ABNT2                       | Não conseguir digitar palavras | Composition events, input nativo, teclado virtual com acentos, testes em ABNT2 e US.                                      |
| Teclado nativo do celular cobrir a tela              | UI inutilizável                | Layout compacto, `visualViewport`, palavra fixa no topo, teclado virtual como alternativa.                                |
| Abuso do ranking                                     | Ranking inútil                 | Validação estrita, recálculo no servidor, limites plausíveis, rate limit best-effort, sem prêmios.                        |
| Custo/disponibilidade do banco de ranking            | Ranking fora do ar             | Jogo e recordes locais independentes; fallback visual; cache de leitura; Neon gratuito substitui o Netlify Database pago. |
| SEO de jogo client-side                              | Pouca indexação                | Landing SSR/prerender com conteúdo real, metadados, sitemap e JSON-LD.                                                    |
| Fontes sem acentos                                   | Texto quebrado                 | Subset latin-ext e teste com palavras acentuadas.                                                                         |
| Escopo crescer (contas, multiplayer, i18n)           | Atraso                         | Lista de fora de escopo e backlog pós-MVP.                                                                                |
| “Sem ID” conflitar com acessibilidade                | Barreira                       | Preferir `aria-label` e semântica; se um ID for inevitável, documentar e usar só para relação acessível.                  |

---

## 13. Fora de escopo do MVP

- Login, cadastro, perfis e histórico de partidas.
- Multiplayer, salas, chat ou competição em tempo real.
- Internacionalização (além de pt-BR).
- Aplicativo nativo ou PWA offline completo.
- Painel administrativo e moderação de ranking.
- Pagamentos, anúncios ou assinaturas.
- Editor de listas de palavras pelo usuário.

---

## 14. Definition of Done

O projeto estará concluído quando:

- [ ] Todos os RFs e NFRs desta página estiverem atendidos.
- [ ] Os três níveis e o modo personalizado funcionarem conforme as regras.
- [ ] O teclado físico, mouse/toque, Enter e Espaço funcionarem com animação.
- [ ] Tema, música e efeitos persistirem e respeitarem as preferências.
- [ ] Ranking global e recordes locais funcionarem, com fallback.
- [ ] Home, jogo e resultados forem responsivos e acessíveis.
- [ ] SEO técnico e conteúdo estiverem publicados.
- [ ] `check`, `lint`, `test`, `test:e2e` e `build` passarem.
- [ ] Nenhum `try/catch`, classe de OOP ou ID de DOM indevido no código.
- [ ] Todos os registros de review das fases estiverem aprovados.
- [ ] Deploy de produção na Netlify estiver funcionando com banco e migrações.
- [ ] README explicar setup, scripts, banco, deploy e variáveis.

---

## 15. Backlog pós-MVP

- Desafio diário com a mesma sequência para todos.
- Histórico de partidas e gráficos de evolução.
- Contas opcionais e ranking semanal.
- Mais idiomas e layouts de teclado (US, Dvorak).
- Modo treino sem timer e modo “fantasma” contra recorde pessoal.
- Temas visuais adicionais e customização de teclas.
- PWA com jogo offline.
- Moderação e verificação de scores.

---

## 16. Decisões em aberto para confirmação

| #   | Questão                         | Decisão do plano                              | Impacto se mudar                                              |
| --- | ------------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| 1   | O mini banco é para ranking?    | Sim, ranking global + recordes locais.        | Refazer Fase 5.                                               |
| 2   | Personalizado entra no ranking? | Não.                                          | Precisa de regras de fairness e validação extra.              |
| 3   | Música pode ser sintetizada?    | Sim, Web Audio API.                           | Trocar por faixa royalty-free.                                |
| 4   | Domínio final?                  | Netlify até definir custom domain.            | Atualizar `PUBLIC_SITE_URL`, canonical e OG.                  |
| 5   | “Sem ID” inclui banco?          | Não; vale para DOM.                           | Revisar schema e chaves.                                      |
| 6   | Expert deve ser concluível?     | Pool de 30 palavras; progresso é a pontuação. | Ajustar quantidade/tempo se a intenção for “completar todas”. |

---

**Próximo passo:** aprovar este plano e iniciar a Fase 0 (fundação + tooling). Ao final de cada fase, o gate da seção 10 deve ser executado e registrado em `docs/reviews/`.
