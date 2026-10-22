# Validação QA: redesign ZionCodes, inglês, modo demo e ranking

- **Data:** 22/10/2026
- **Papel:** QA (validador principal). Reporta ao PO. Não implementa features.
- **Base:** working tree atual, sem commit, com a entrega descrita em `docs/reviews/senior-entrega.md`.
- **Ambiente:** Node 24.21.0, Chromium headless do Playwright (`/home/zeco/.cache/ms-playwright`) com viewports emulados e toque sintetizado. Safari, Firefox, aparelhos físicos, IME real e teclado do sistema **não foram testados**.

## Veredito

**REPROVADO.** Há 2 defeitos P1 e nenhum P0:

- **P1-1:** no celular em paisagem, a palavra sobrepõe o tempo, o HUD, a barra de progresso e o campo.
- **P1-2:** na versão `/en`, o ranking mostra o apelido padrão "Anônimo".

As regras de negócio centrais estão corretas: modo demo, ranking por modo e nível, poda de 1000, SQLite, 503, SEO, temas e acessibilidade. As suítes passam inteiras.

## Checklist de regras de negócio

| #   | Regra                      | Resultado                         | Evidência                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | -------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Identidade ZionCodes       | **APROVADO**                      | O site de referência usa `Saira` e `body` `rgb(0, 0, 0)` (lido do DOM). O jogo segue o mesmo padrão: canvas preto, wordmark `TYPING` + `GAME` em azul, chips pill em caixa-alta, botão sólido `#2563eb` e secundário com hairline. Comparação: [qa-ref-zioncodes-1440](assets/qa-ref-zioncodes-1440.png) × [qa-home-1440x900-dark](assets/qa-home-1440x900-dark.png) e [qa-home-1440x900-light](assets/qa-home-1440x900-light.png)                                                                                                                                                 |
| 2   | Temas claro/escuro/sistema | **APROVADO**                      | No primeiro quadro (`requestAnimationFrame` antes da pintura), `data-theme` já é `dark` com o sistema escuro, em `/` e `/en`. O claro salvo vence o sistema escuro. Em "sistema", o tema acompanha a troca do SO. O axe (wcag2a/aa/22aa) não acusa violações nos dois temas: home, diálogos, jogo, resultado e demo. O E2E "carrega, aplica tema e joga mesmo com localStorage lançando erro" passa. Testes: `e2e/qa-validacao.e2e.ts` › "QA tema" (4/4) e `e2e/a11y.e2e.ts`                                                                                                       |
| 3   | Versão `/en`               | **REPROVADO** (P1-2)              | A busca de marcadores pt no `innerText` encontrou `{"home":[],"settings":[],"play":[],"results":[],"notFound":[]}`. O seletor BR/US alterna `/`↔`/en` e `/jogar`↔`/en/play`, e `lang` muda. O banco inglês tem 191/226/226 palavras. **Falha:** jogador anônimo aparece como `Anônimo` no top 10 de `/en` (saída `QA_EN_BOARD "#1\nAnônimo\n234.9 wpm\n100.0%"`)                                                                                                                                                                                                                   |
| 4   | Modo demo EN→PT            | **APROVADO** (com P2-1)           | Testado nos 6 casos (3 níveis × `/en/play` e `/jogar`): a alternativa da lista, digitada em MAIÚSCULAS, é aceita; a palavra sem acento é recusada (ex.: `muscle → musculo`, `efficiency → eficiencia`, com "Acento errado"). A dica mostra a primeira letra e o tamanho da tradução principal (ex.: "Começa com “e” e tem 10 letras."). O resultado mostra "Dicas usadas 1" e "1 hinted word scored half the characters.". O servidor recusa `hintedWords` fora de `en-pt` (`400 invalid_payload`). **P2-1:** a mensagem de acento some quando outra alternativa empata no prefixo |
| 5   | Ranking                    | **APROVADO**                      | Veja o detalhamento abaixo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 6   | Banco                      | **APROVADO** (Neon só por código) | Veja o detalhamento abaixo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 7   | SEO                        | **APROVADO**                      | Veja o detalhamento abaixo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 8   | Multiplataforma e UX       | **REPROVADO** (P1-1)              | Sem rolagem horizontal e com o campo visível em 360×740, 390×844, 768×1024, 1440×900, 740×360 e 844×390, nos dois temas (12/12). Foco: 30 Tabs na home, 0 elementos sem foco visível; jogo iniciado pelo atalho `1` sem mouse. Toque sintetizado no teclado virtual em 360×740 digita e confirma (`TOUCH_PROGRESS 1/10 PALAVRAS`). O E2E de movimento reduzido passa. **Falha:** sobreposição em paisagem (P1-1); placeholder cortado em 360 px (P2-2)                                                                                                                             |
| 9   | Pendências `po-audit.md`   | **REPROVADO** (1 item P1 aberto)  | Veja a tabela de pendências abaixo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 10  | Qualidade                  | **APROVADO**                      | Veja "Suítes" e "Impeccable audit"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### 5. Ranking

- **Um ranking por modo e nível.** Uma partida EN→PT com dica, salva pelo navegador, aparece só na aba `EN → PT` · Iniciante, e não em `PT` nem em `EN` ([qa-ranking-enpt](assets/qa-ranking-enpt.png), [qa-results-enpt-saved](assets/qa-results-enpt-saved.png)).
- **Personalizado fica de fora.** O resultado mostra "O modo personalizado fica fora do ranking" e não tem botão de envio. A API recusa `level: personalizado`.
- **Poda de 1000 em arquivo SQLite real.** Teste novo, `src/lib/modules/leaderboard/server/qa-prune.test.ts`, com 1050 inserções:
  - `pt:iniciante` fica com 1000 linhas e mínimo de 5,1 wpm;
  - `en:iniciante` e `pt:amador` continuam com 1 linha cada;
  - um resultado pior volta com `rank: null`, e um melhor com `rank: 1`.
- **Apelido de 21 caracteres:** `400 invalid_nickname`.
- **Sem IP:** as colunas de `leaderboard_scores` são `id,nickname,mode,level,words_completed,words_total,correct_chars,compared_chars,hinted_words,duration_ms,wpm,accuracy,created_at`.
- **Rate limit:** sete envios válidos seguidos dão `201 201 201 201 201 429 429`. Payload inválido depois do limite continua `400`.
- **Velocidade implausível:** `400` (E2E).
- **Sem banco em produção:** `GET` e `POST` respondem `503 {"error":"unavailable"}`. A home mostra "Ranking indisponível agora… Tentar novamente", e o resultado diz "Seu recorde local foi mantido." ([qa-503-home-ranking](assets/qa-503-home-ranking.png), [qa-503-results](assets/qa-503-results.png)).

### 6. Banco

- **SQLite em dev sem Postgres:** `npm run dev` sem `DATABASE_URL`, porta 5299. Partida `/en/play?nivel=expert` jogada no navegador, salva como "QA dev sqlite", com o resultado "Result saved. You placed #1.". A linha está em `.data/leaderboard.sqlite` (`id 4, en, expert, 123.5 wpm`) e aparece na aba Advanced de `/en` ([qa-dev-sqlite-results](assets/qa-dev-sqlite-results.png), [qa-dev-sqlite-ranking](assets/qa-dev-sqlite-ranking.png)).
- **`npm run db:apply` com `sqlite:`:** aplica 1 migração na primeira execução e 0 na segunda.
- **Escolha do driver:** `postgresql://` seleciona Neon (`repository.test.ts:140`); vazio em produção dá `none`, que vira `503`.
- **Neon não foi testado de verdade:** não há URL Neon nem Postgres local nesta máquina. O SQL do driver Postgres foi revisado e é equivalente: migração aditiva com `mode` e `hinted_words`, e índice novo.
- **README e `.env.example`** estão coerentes com o comportamento observado.

### 7. SEO

Verificado com `curl` no build de preview com `PUBLIC_SITE_URL`:

- **`lang`:** `pt-BR` em `/` e `/jogar`; `en` em `/en` e `/en/play`.
- **Por página:** `canonical` próprio; `hreflang` pt-BR/en/x-default; `og:locale` com alternate; Open Graph completo, com imagem 1200×630; `twitter:card summary_large_image`.
- **Títulos únicos** nas 4 rotas.
- **JSON-LD:** o `JSON.parse` funciona. `/` tem `WebApplication+VideoGame(pt-BR)` e `FAQPage(pt-BR)`; `/en`, os mesmos tipos com `(en)`.
- **Sitemap:** 4 URLs, cada uma com `xhtml:link` nas duas línguas.
- **robots.txt:** `Disallow: /api/` e `Sitemap:`.

### 9. Pendências de `po-audit.md`

| Prio. | Pendência                                   | Situação                                                                 |
| ----- | ------------------------------------------- | ------------------------------------------------------------------------ |
| P1    | Promise de `getBest` na home                | Fechada: `check` sem erros e recordes exibidos (E2E de recordes)         |
| P1    | Resposta do envio alterando outra partida   | Fechada (E2E de envio e recorde)                                         |
| P1    | Timer, pausa e pontuação                    | Fechada (`game.test.ts`, E2E de pausa e saída)                           |
| P1    | Teclado global × modais e IME               | Fechada no Chromium (E2E de atalhos com diálogo). IME real não testado   |
| P1    | Viewport 360 px e **paisagem**              | **Aberta (P1-1):** 360 px OK; em paisagem a palavra sobrepõe HUD e campo |
| P1    | Storage bloqueado                           | Fechada (E2E com `localStorage` lançando erro)                           |
| P2    | Hidratação de settings                      | Fechada (`settings.test.ts`)                                             |
| P2    | Recorde personalizado agregado              | Fechada (`bests.test.ts`, E2E de recordes)                               |
| P2    | Ranking sem timeout ou com payload inválido | Fechada (`leaderboard.test.ts`, 503 verificado na UI)                    |
| P2    | SEO inventando domínio                      | Fechada (URLs só com `PUBLIC_SITE_URL`)                                  |
| P2    | Layout decorativo (`BackgroundKeys`)        | Fechada (componente removido; detector sem achados)                      |
| P2    | Contagem invisível com movimento reduzido   | Fechada (E2E)                                                            |
| P2    | Tabstop invisível entre 640 e 767 px        | Fechada (E2E "teclado virtual não tem parada de tab invisível")          |

## Defeitos

### P1-1: em paisagem, a palavra sobrepõe tempo, HUD, barra de progresso e campo

- **Onde:** tela de partida em celular deitado (`GameScreen.svelte` / `WordDisplay.svelte`), nos modos pt e en-pt.
- **Reprodução:**
  1. Viewport 740×360 (ou 844×390).
  2. Abrir `/jogar?nivel=expert` e avançar até uma palavra longa. Exemplo: `anticonstitucionalissimamente` quebra em 4 linhas, cobre o tempo e as fichas, e o final some atrás do campo.
  3. Mesmo palavras curtas sobrepõem o HUD: em `/en/play?nivel=amador&modo=en-pt`, `dance` e `healthy` passam por cima de "0.0 WPM" e da barra.
- **Esperado:** palavra legível e inteira, sem cobrir tempo e campo, como pede o requisito de paisagem do `po-audit` P1.
- **Evidência:**
  - [qa-play-pt-longword-landscape-740x360-dark](assets/qa-play-pt-longword-landscape-740x360-dark.png)
  - [qa-play-pt-landscape-740x360-dark](assets/qa-play-pt-landscape-740x360-dark.png) (`extravag|ância` quebrada no meio)
  - [qa-play-enpt-landscape-740x360-dark](assets/qa-play-enpt-landscape-740x360-dark.png)
  - [qa-play-enpt-landscape-844x390-light](assets/qa-play-enpt-landscape-844x390-light.png)
- **Por que os testes não pegaram:** o E2E `responsive.e2e.ts` "campo de digitação continua alcançável" só verifica se o campo está no viewport, não se há sobreposição.

### P1-2: "Anônimo" aparece no ranking da versão em inglês

- **Onde:**
  - `src/lib/modules/leaderboard/limits.ts:3` (`DEFAULT_NICKNAME = 'Anônimo'`);
  - `src/lib/validation.ts:28` e `:67`: o padrão é gravado no banco e exibido sem tradução.
- **Reprodução:**
  1. Em `/en/play?nivel=amador`, terminar a partida.
  2. Clicar em "Save to leaderboard" sem apelido.
  3. O top 10 mostra `Anônimo`. O mesmo acontece na home `/en` e em todos os registros anônimos dos três modos.
- **Esperado:** nenhum texto em português vazando na UI inglesa (critério 3). Por exemplo, gravar vazio ou `null` e traduzir na exibição ("Anonymous" / "Anônimo").
- **Evidência:** o teste `e2e/qa-validacao.e2e.ts` › "QA nome padrão do ranking aparece em inglês para jogador anônimo" **falha de propósito** até a correção.

### P2-1: a mensagem "Acento errado" some quando outra tradução empata no prefixo

- **Onde:**
  - `src/lib/components/game/WordDisplay.svelte:39`: `closestAnswer`;
  - `src/lib/modules/translation/matching.ts:36-44`: no empate, fica a primeira resposta.
- **Reprodução:**
  1. `/en/play?nivel=iniciante&modo=en-pt`, palavra `dog` (respostas `cachorro`, `cão`).
  2. Digitar `cao` e Enter.
  3. Aparece "Not yet. Fix it with Backspace…" em vez de "Wrong accent: use ã instead of a." A recusa está correta; só o feedback se perde.
- **Correção sugerida:** testar `findAccentMismatch` contra cada alternativa antes do prefixo.

### P2-2: placeholder cortado no celular em EN→PT

- **Reprodução:** 360×740 em `/en/play?nivel=amador&modo=en-pt`. O campo mostra "Translate into Portu" ([qa-play-enpt-360x740-light](assets/qa-play-enpt-360x740-light.png)). Em 844×390, mostra "Translate into Portug".
- **Esperado:** instrução legível. Por exemplo, um texto mais curto ("In Portuguese") ou fonte menor só no placeholder.

### P2-3: tipagem de retorno faltando (regra `code.md`)

- `src/lib/stores/game.svelte.ts:73`: `createGame(...)` sem tipo de retorno.
- `src/lib/modules/leaderboard/server/sqlite.server.ts:93` e `:98`; `postgres.server.ts:19` e `:31`: `listTop` e `insert` internos sem tipo de retorno.
- `src/lib/components/game/VirtualKeyboard.svelte:50`: `const sync = () => {` sem retorno.
- `scripts/db-apply.js`: JavaScript sem tipos (`resolveTarget(rawUrl)`, `listMigrations(driver)`, `splitStatements(content)`, `applyPostgres(url)`, `applySqlite(filename)`).

As demais regras de código foram fiscalizadas por `grep` e estão cumpridas:

- **Zero comentários:** nenhum `//`, `/*` ou `<!--` em `src`, `e2e` e `scripts`.
- **Zero `try/catch`:** só `.catch()` de Promise.
- **Zero classes.**
- **IDs de DOM:** só `#conteudo` e `game-input-help`, nenhum usado como seletor. O único `querySelector` usa `[data-view-result]`.

### P2-4: estrutura modular incompleta

`PRODUCT.md` pede "estrutura modular em `src/lib/modules`". Ainda ficam fora: `src/lib/components/`, `src/lib/game/`, `src/lib/stores/`, `src/lib/utils/`, `src/lib/api/`, `src/lib/seo/`, `src/lib/audio/` e `src/lib/validation.ts`. Não é defeito funcional. Fica como dívida, para o PO decidir se entra nesta entrega.

### P3 (observações, não bloqueiam)

- **Envio de resultado implausível:** o resultado oferece "Save to leaderboard" mesmo quando o servidor vai recusar. Por automação, saiu 324,6 wpm em EN→PT, acima do teto de 180, e a mensagem foi "did not pass the leaderboard checks". Só acontece com bots.
- **Seletor BR/US:** não existe dentro da tela de partida e não preserva a query (`?nivel=…`). Ele preserva a rota (home↔home, jogar↔jogar), que é o exigido.

## Suítes

| Comando                                | Resultado                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run check`                        | `COMPLETED 4621 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS`                         |
| `npm run lint`                         | "All matched files use Prettier code style!"; ESLint sem erros (inclui os testes QA)     |
| `npm run test`                         | `Test Files 21 passed (21)` · `Tests 121 passed (121)` (120 do Senior + 1 de poda do QA) |
| `npm run build`                        | `✓ built` · adapter Netlify `✔ done`                                                     |
| E2E oficial (54 testes)                | `54 passed (42.8s)`                                                                      |
| E2E QA (`e2e/qa-validacao.e2e.ts`, 31) | 30 passam; 1 falha, que é o P1-2, de propósito                                           |

**Nota de ambiente sobre o E2E:** `npm run test:e2e` não roda como está, porque a porta 4173 já estava ocupada por um `vite preview` de outro agente. Além disso, builds concorrentes no mesmo checkout fizeram uma primeira tentativa falhar 54/54 por hidratação. Não é defeito do produto. Por isso:

- criei `e2e/qa.playwright.config.ts` (sem `webServer`, `baseURL` 4273);
- fiz o build com `PUBLIC_SITE_URL=https://typing-game.netlify.app npm run build`;
- subi `DATABASE_URL=sqlite:.data/qa-e2e/leaderboard.sqlite npx vite preview --port 4273`;
- rodei `PLAYWRIGHT_BROWSERS_PATH=/home/zeco/.cache/ms-playwright npx playwright test -c e2e/qa.playwright.config.ts`.

## Impeccable audit

**Detector:**

- Fonte (`impeccable detect src`): 0 achados primários; 4 avisos `design-system-font-size`: `app.css:133` com `0.75rem` e `VirtualKeyboard.svelte:205/223` com `0.625rem`, fora da escala do `DESIGN.md`.
- Páginas renderizadas: 0 achados em `/`, `/en`, `/jogar?nivel=amador` e `/en/play?nivel=amador&modo=en-pt`, em 1280×800 e 390×844.

| #         | Dimensão       | Nota      | Achado principal                                                                      |
| --------- | -------------- | --------- | ------------------------------------------------------------------------------------- |
| 1         | Acessibilidade | 3         | axe limpo nos dois temas e foco visível; em paisagem, a palavra cobre conteúdo (P1-1) |
| 2         | Performance    | 3         | Fontes self-hosted, áudio sintetizado, rotas separadas; sem medição em aparelho real  |
| 3         | Temas          | 4         | Tokens nos dois temas, sem flash no primeiro quadro, modo sistema reativo             |
| 4         | Responsividade | 2         | 360/390/768/1440 OK; paisagem quebrada (P1-1); placeholder cortado (P2-2)             |
| 5         | Integridade    | 3         | Sistema coerente com ZionCodes; "Anônimo" vazando em `/en` (P1-2)                     |
| **Total** |                | **15/20** | **Bom**: corrigir responsividade em paisagem e o texto padrão do ranking              |

Comandos recomendados ao Senior: `/impeccable adapt` (P1-1 e P2-2), `/impeccable harden` (P1-2 e P2-1) e, por último, `/impeccable polish`.

## Arquivos criados pelo QA

- `docs/reviews/qa-validacao.md` (este relatório)
- `docs/reviews/assets/qa-*.png`: 36 capturas. Home e jogo EN→PT em 6 viewports × 2 temas, além de paisagem pt, palavras longas, resultado, 503, SQLite dev, ranking e a referência ZionCodes.
- `e2e/qa-validacao.e2e.ts`: tema no primeiro quadro, vazamento de pt em `/en`, seletor de idioma, demo nos 3 níveis × 2 sites, ranking por modo, personalizado, apelido, viewports, foco e axe.
- `e2e/qa.playwright.config.ts`: config de execução contra servidor já em pé.
- `src/lib/modules/leaderboard/server/qa-prune.test.ts`: poda de 1000 em arquivo SQLite real.

Nenhum código de produção foi alterado. Sem commit e sem push.

---

## Rodada 2

- **Data:** 22/10/2026
- **Base:** working tree com as correções da seção "Rodada 2" de `docs/reviews/senior-entrega.md`.
- **Ambiente:** o mesmo da rodada 1. Chromium headless com viewports emulados. Porta 5190, do usuário, não foi tocada.

### Veredito da rodada 2

**APROVADO.** Os 6 defeitos da rodada 1 (P1-1, P1-2 e P2-1 a P2-4) estão corrigidos e verificados. A regressão completa passa, inclusive com o `npm run test:e2e` literal na porta 4173. Não há defeito novo P0, P1 ou P2; restam só observações P3.

### Reteste dos defeitos

| Defeito | Situação      | Evidência                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1-1    | **CORRIGIDO** | Veja o detalhamento abaixo                                                                                                                                                                                                                                                                                                                                                                       |
| P1-2    | **CORRIGIDO** | Veja o detalhamento abaixo                                                                                                                                                                                                                                                                                                                                                                       |
| P2-1    | **CORRIGIDO** | `dog` (palavra forçada) digitado como `cao` + Enter mostra "Wrong accent: use ã instead of a."; a palavra não avança; `CÃO` é aceito e vira "1/10 words". Captura: [qa-r2-dog-cao-wrong-accent](assets/qa-r2-dog-cao-wrong-accent.png)                                                                                                                                                           |
| P2-2    | **CORRIGIDO** | Em 360×740, o placeholder é "In Portuguese" / "Em português". A largura do texto, medida por canvas com a fonte real, cabe no campo: `{"text":"In Portuguese","fits":true}` e `{"text":"Em português","fits":true}`. Capturas: [qa-r2-placeholder-360x740-en-play](assets/qa-r2-placeholder-360x740-en-play.png) e [qa-r2-placeholder-360x740-jogar](assets/qa-r2-placeholder-360x740-jogar.png) |
| P2-3    | **CORRIGIDO** | Veja o detalhamento abaixo                                                                                                                                                                                                                                                                                                                                                                       |
| P2-4    | **CORRIGIDO** | `find src -type f` fora de `src/lib/modules/` lista só os pontos de entrada exigidos pelo SvelteKit: `app.css`, `app.html`, `app.d.ts`, `app.test.ts`, `env.ts`, `hooks.server.ts`, `lib/index.ts` e `src/routes/**`. Módulos: `audio`, `game`, `home`, `i18n`, `layout`, `leaderboard`, `play`, `seo`, `settings`, `shared`, `translation`, `ui` e `words`                                      |

#### P1-1: paisagem

- **Teste novo e independente do do Senior:** `e2e/qa-r2.e2e.ts` cobre 2 tamanhos (740×360 e 844×390) × 2 temas (claro e escuro) × 12 casos (pt, en, en-pt em `/en/play` e en-pt em `/jogar`, nos 3 níveis), com a palavra mais longa de cada banco forçada no início. São **48/48 aprovados**.
- **O que o teste mede:** as caixas de cada linha de texto da palavra (`Range.getClientRects`) contra tempo, fichas, barra, campo e regra da dica.
- **Quando mede:** antes de digitar e com a palavra quase toda digitada; no en-pt, também com a dica aberta.
- **Capturas:** [pt avançado 740×360 claro](assets/qa-r2-pt-expert-740x360-light.png), [en avançado 844×390 escuro](assets/qa-r2-en-expert-844x390-dark.png), [en-pt em `/jogar` 740×360](assets/qa-r2-enpt-pt-expert-740x360-dark.png) e as demais `qa-r2-*-740x360-*` e `qa-r2-*-844x390-*`.

#### P1-2: "Anônimo" em `/en`

- **Partida nova anônima:** aparece como "Anonymous" no resultado em `/en` e como "Anônimo" na home pt (teste "QA R2 anônimo localizado nas duas línguas").
- **Registro legado migrado:**
  1. Criei um SQLite só com a migração antiga e um registro `'Anônimo'`.
  2. Ao abrir o banco, a migração `20261023120000_anonymous_nickname.sql` rodou e o apelido virou `''` (`schema_migrations` com as duas).
  3. O registro aparece como "Anonymous" em `/en` e "Anônimo" em `/`.
- **Registro `'Anônimo'` gravado depois da migração (sentinela):** inserido direto no banco, também aparece como "Anonymous" em `/en` e "Anônimo" em `/`.
- **Capturas:** [qa-r2-legado-migrada-en](assets/qa-r2-legado-migrada-en.png), [qa-r2-legado-migrada-pt](assets/qa-r2-legado-migrada-pt.png), [qa-r2-legado-sentinela-en](assets/qa-r2-legado-sentinela-en.png) e [qa-r2-legado-sentinela-pt](assets/qa-r2-legado-sentinela-pt.png).

#### P2-3: tipos de retorno

- **Varredura por `grep`:** nenhuma função sem tipo de retorno em `.ts` ou `.svelte`. `scripts/db-apply.js` virou `scripts/db-apply.ts`, tipado, e roda com `node scripts/db-apply.ts`.
- **A regra ESLint nova pega violações.** Enviei por `--stdin` uma função e uma arrow sem retorno, simulando arquivos em `src/lib/modules/`, `scripts/` e `e2e/`. Nos três casos veio `2 errors … @typescript-eslint/explicit-function-return-type`.
- **Limite:** em `.svelte` não dá para testar por `stdin`, porque o arquivo tem de estar no projeto TS. Para esses, valem o `grep` e a configuração da regra em `eslint.config.js:27`.

### Regressão

| Comando                            | Resultado                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run check`                    | `COMPLETED 4623 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS`                                             |
| `npm run lint`                     | "All matched files use Prettier code style!" e ESLint com exit 0, repetido depois dos testes QA novos        |
| `npm run test`                     | `Test Files 22 passed (22)` · `Tests 126 passed (126)`                                                       |
| `npm run build`                    | `✓ built` · adapter Netlify `✔ done`                                                                         |
| `npm run test:e2e` (literal, 4173) | `103 passed (2.8m)`: oficiais, `landscape.e2e.ts` e `qa-validacao.e2e.ts`. A porta 4173 ficou livre ao final |
| `e2e/qa-r2.e2e.ts` (QA, rodada 2)  | `52 passed (4.9m)`                                                                                           |

**Fluxo no navegador** (`npm run dev` na porta 5299, SQLite padrão `.data/leaderboard.sqlite`):

- **Partidas salvas:** joguei e salvei pt Amador, en Avançado e en-pt Iniciante. As linhas estão no SQLite com o modo e o nível certos (`pt/amador`, `en/expert`, `en-pt/iniciante`).
- **Ranking:** cada apelido aparece só na aba do seu modo e nível. Nas outras abas, a contagem é 0 (`PT:0`, `EN:0`, `EN → PT:0`).
- **Tema:** passou de `light` para `dark` e continuou `dark` depois do reload.
- **Idioma:** BR → US levou a `/en` com `lang=en`, mantendo o tema.
- **Capturas:** [qa-r2-fluxo-home-tema-dark](assets/qa-r2-fluxo-home-tema-dark.png) e [qa-r2-fluxo-en-dark](assets/qa-r2-fluxo-en-dark.png).

**Regras do usuário:**

- **Zero comentários:** nenhum `//`, `/*` ou `<!--` em `src`, `e2e` e `scripts`.
- **Zero `try/catch` e zero classes.**
- **IDs de DOM:** só `#conteudo` e `game-input-help`, nenhum como seletor.
- **Tipagem e estrutura modular:** conforme os retestes de P2-3 e P2-4.

### Observações (P3, não bloqueiam)

- **Folga apertada em paisagem.** No EN→PT do site pt em 740×360, com a dica aberta, sobram só ~3 px entre a barra de progresso e o topo das letras. Motivo: a regra da dica, mais longa em português, quebra em 2 linhas.
  - Sem `line-height` 1, a caixa da linha invade a barra em 4,8 px, mas o desenho das letras não encosta. Confira no zoom 3×: [qa-r2-enpt-pt-740x360-zoom-bar](assets/qa-r2-enpt-pt-740x360-zoom-bar.png).
  - Por isso, meu teste tolera 6 px de entrelinha só contra a barra fina.
  - Em 844×390 a folga é de 10 px.
- **Palavras de 45–46 letras** usam o piso de 1.125rem e quebram em 2 linhas. Ficam legíveis e sem sobreposição; é um limite físico da largura.
- **Continuam abertos os P3 da rodada 1:** o envio implausível ainda é oferecido e não há seletor BR/US dentro da partida.
- **Evidência da rodada 1 sobrescrita.** O `npm run test:e2e` literal roda `qa-validacao.e2e.ts`, que gravava em `docs/reviews/assets`. Por isso, as capturas `qa-home-*`, `qa-play-enpt-*`, `qa-results-enpt-saved` e `qa-ranking-enpt` agora mostram o código corrigido, e não o estado reprovado. Não havia backup.
  - As evidências do P1-1 que continuam valendo são `qa-play-pt-longword-*` e `qa-play-pt-landscape-740x360-dark`, que vêm de scripts avulsos.
  - Para não repetir o problema, mudei os dois testes QA: agora gravam em `test-results` (`test.info().outputPath`), e só gravam em `docs/` quando `QA_ASSETS_DIR` é definido.
- **Não verificado:** Neon real, Safari, Firefox, aparelhos físicos, IME e leitor de tela.

### Impeccable audit (rodada 2)

Detector: `impeccable detect src` deu `[]` (os 4 avisos de fonte da rodada 1 sumiram). As páginas `/`, `/en`, `/jogar?nivel=expert`, `/en/play?nivel=amador&modo=en-pt` e `/jogar?nivel=amador&modo=en-pt` deram 0 achados em 1280×800, 390×844 e 740×360.

| #         | Dimensão       | Nota      | Achado principal                                                                 |
| --------- | -------------- | --------- | -------------------------------------------------------------------------------- |
| 1         | Acessibilidade | 3         | axe limpo nos dois temas e foco visível; leitor de tela e IME reais não testados |
| 2         | Performance    | 3         | Sem regressão; sem medição em aparelho real                                      |
| 3         | Temas          | 4         | Sem flash, sistema reativo, tema mantido na troca de idioma                      |
| 4         | Responsividade | 4         | 48/48 combinações de paisagem sem sobreposição; placeholder cabe em 360 px       |
| 5         | Integridade    | 4         | Estrutura modular, i18n completo (anônimo localizado), detector limpo            |
| **Total** |                | **18/20** | **Excelente** (era 15/20 na rodada 1)                                            |

### Arquivos do QA nesta rodada

- `docs/reviews/qa-validacao.md`: esta seção.
- `docs/reviews/assets/qa-r2-*.png`: 58 capturas.
- `e2e/qa-r2.e2e.ts`: novo.
- `e2e/qa-validacao.e2e.ts`: capturas redirecionadas para `test-results`.

Nenhum código de produção foi alterado. Sem commit e sem push. Os servidores que subi (4273, 4274 e 5299) foram encerrados; a 4173 está livre e a 5190 continua rodando.

---

## Rodada 3

- **Data:** 22/10/2026
- **Base:** working tree com as entregas da seção "Rodada 3" de `docs/reviews/senior-entrega.md` (música de fundo, `neon.ts`, isolamento do banco).
- **Banco:** nenhum envio foi feito ao Neon. A porta 5190, do usuário e ligada ao Neon de produção, não foi usada nem encerrada.

### Veredito da rodada 3

**APROVADO.** Música, `neon.ts`, isolamento do banco e regressão passam. Não há defeito P0, P1 ou P2; restam 4 observações P3, listadas abaixo.

### 1. Música de fundo

Para medir, criei o teste `e2e/qa-r3-musica.e2e.ts` (8 testes), que instrumenta a Web Audio na página:

- um `AnalyserNode` ligado em paralelo a tudo o que vai para o `destination`, para medir pico e RMS de verdade a cada 40 ms;
- contagem de `AudioContext`, de osciladores e de `BufferSource`, e de `setInterval` ativos;
- `disconnect` dos ganhos e alvos de `setTargetAtTime` do filtro.

**Resultado: 8/8**, sob `xvfb-run` com `QA_HEADED=1`.

| Item                                       | Resultado                      | Evidência                                                                                                                                                                                                                                                                   |
| ------------------------------------------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Só toca após gesto                         | **APROVADO**                   | Veja o detalhamento abaixo                                                                                                                                                                                                                                                  |
| Botão Música liga e desliga e persiste     | **APROVADO**                   | Desliguei pela UI (configurações, switch "Música" por teclado): `data-music="off"` e nenhuma nota nova em 2 s. Depois do reload, continua desligada, com **0** notas criadas mesmo após digitar. Religada, volta a criar notas e persiste depois do reload                  |
| Pausa, aba oculta e retomada               | **APROVADO**                   | Com `visibilitychange` e `hidden=true`, o jogo pausa, `data-music="off"` e o contador de notas fica parado por 2 s. Quando a aba volta, o jogo continua pausado, que é a regra documentada. Com "Continuar", a música volta (`data-music="on"`) e as notas voltam a crescer |
| Resultado                                  | **APROVADO**                   | Conforme documentado, a música para no resultado: `data-music="off"`, nenhuma nota nova em 2,5 s, o barramento é desconectado (`disconnects: 1`) e o pico no último segundo é `0`                                                                                           |
| Combo e últimos 10 s                       | **APROVADO**                   | Em janelas iguais de 8 s, o combo de 3 aumenta as notas de **35 → 51**. Por compasso, a camada de arpejo entra no compasso seguinte: 11→19 e 15→22 notas. Numa partida personalizada de 12 s, o filtro recebe alvo de **9000 Hz** nos últimos 10 s (`QA_R3_FILTRO [9000]`)  |
| Sem silêncio e sem clipping (medição real) | **APROVADO**                   | Em 25 s de trilha medidos em tempo real (575 janelas): pico de **0,0555 (−25,1 dBFS)**, bem abaixo de 0 dBFS; RMS de **0,0117 (−38,6 dBFS)**, não nulo; maior silêncio de **0 ms**                                                                                          |
| Volume abaixo dos efeitos                  | **APROVADO** (com ressalva P3) | Veja o detalhamento abaixo                                                                                                                                                                                                                                                  |
| Sem vazamento ao trocar de rota            | **APROVADO**                   | 8 ciclos home → nível (teclas 1, 2 e 3) → contagem e música → "Sair" → confirmar → home. `setInterval` ativos depois de cada volta: `[0,0,0,0,0,0,0,0]`. Há um único `AudioContext` em toda a sessão, e nenhuma nota nova na home parada                                    |
| Sem erros de console                       | **APROVADO**                   | `pageerror` e `console.error` vazios nos testes de gesto, trilha, botão, pausa, resultado e rotas                                                                                                                                                                           |
| Teste unitário do agendador                | **APROVADO**                   | `src/lib/modules/audio/music/scheduler.test.ts` usa relógio falso injetado, sem `AudioContext` real. Os 12 testes de áudio deram `12 passed` três vezes seguidas                                                                                                            |

#### Só toca após gesto

O Chromium headless ignora a política de autoplay, mesmo com `--autoplay-policy=user-gesture-required`. Por isso, este item foi verificado com Chromium **com janela** (`channel: 'chromium'`, sob `xvfb-run`).

**Rastro sem gesto (script avulso, 5 execuções):** o contexto nasce `suspended`, com `userActivation=false`, e continua suspenso durante a contagem e a partida. Só passa a `running` ~26 ms depois do primeiro `keydown`, já com `userActivation=true`. Exemplo:

```
status:countdown@362
new:suspended@465 act=false
status:running@3389
running@6301 act=true
```

**No E2E:** o próprio runner injeta ativação de usuário. Por isso, o teste verifica a regra: o contexto nasce `suspended:false` e nunca chega a `running` sem ativação.

**No `npm run test:e2e` padrão,** o teste fica `skipped`, porque exige `QA_HEADED=1`.

#### Volume abaixo dos efeitos

Medi em contextos separados, efeitos sozinhos e música sozinha:

| Medida              | Efeitos             | Música                                  |
| ------------------- | ------------------- | --------------------------------------- |
| RMS                 | −37,2 dBFS (top 10) | −38,5 dBFS                              |
| Pico                | −22,7 dBFS          | −25,7 dBFS                              |
| RMS acima de 200 Hz | −36,7 dBFS          | −43,3 dBFS (média), −40,2 dBFS (top 10) |

A medida acima de 200 Hz aproxima a percepção, porque desconta o bumbo e o baixo. Nela, a música fica 3,5 a 6,6 dB abaixo dos efeitos.

Avaliação de ouvido: não foi possível, porque o navegador roda mudo (`--mute-audio`) e não há ouvinte humano. A medição real em tempo de execução substitui a gravação: pico abaixo de 0 dBFS, RMS não nulo e sem silêncio.

### 2. `neon.ts`

- **Zero comentários:** `grep` deu 0.
- **Configuração:** `auth: false`; a branch padrão volta `{}`; branch nova volta `{ ttl: '7d' }`; branch existente volta `{}`. Confere com o que o Senior descreve. Não há original versionado para comparar byte a byte, porque o arquivo é novo e não rastreado.
- **Arquivos ignorados:** `git check-ignore -v` dá `.gitignore:17:.env.*  .env.local` e `.gitignore:33:.neon  .neon`. `git ls-files --error-unmatch` confirma que nenhum dos dois está rastreado.
- **Sem vazamento de segredo:** o host do Neon do `.env.local` não aparece em `build/`, `.netlify/`, `.svelte-kit/output`, `docs/`, `e2e/`, `src/` nem `scripts/` (0 arquivos).

### 3. E2E e preview nunca usam o Neon

- **Código:**
  - `DATABASE_URL` é variável de **runtime** (`src/env.ts`, sem `static`), não embutida no build;
  - `playwright.config.ts` define `DATABASE_URL: 'sqlite:.data/e2e/leaderboard.sqlite'` no `webServer`, que vale para build e preview, com `reuseExistingServer: false`;
  - nenhum teste unitário importa o repositório de servidor.
- **Prova empírica, só com GET e nada enviado ao Neon:**
  1. Subi o preview com `DATABASE_URL=sqlite:.data/qa-r3/leaderboard.sqlite` e o `.env.local` do Neon presente.
  2. `GET /api/leaderboard?modo=pt&nivel=expert` respondeu `{"scores":[]}`.
  3. Inseri uma linha marcadora ("QA marcador R3") **direto no arquivo SQLite**, e o mesmo GET passou a devolvê-la.

  Conclusão: o valor do processo vence o `.env.local`, e o servidor lê o SQLite.

- **Depois do `npm run test:e2e`:** `.data/e2e/leaderboard.sqlite` tem `en/amador:1`, `en/iniciante:2` e `en-pt/iniciante:1`, que são os 4 envios bem-sucedidos da suíte.
- **Risco já documentado no README (P3):** com o `.env.local` presente, `npm run dev` ou `npm run preview` **sem** `DATABASE_URL` passam a usar o Neon de produção. Meu `e2e/qa.playwright.config.ts` não tem `webServer`, então só deve ser usado contra um servidor subido com `DATABASE_URL=sqlite:…`, como fiz em todas as rodadas.

### 4. Regressão

| Comando                                              | Resultado                                                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run check`                                      | `COMPLETED 4647 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS`, repetido depois dos testes QA novos |
| `npm run lint`                                       | exit 0, Prettier e ESLint, repetido depois dos testes QA novos                                        |
| `npm run test`                                       | `Test Files 25 passed (25)` · `Tests 138 passed (138)`                                                |
| `npm run build`                                      | `✓ built` · `✔ done`                                                                                  |
| `npm run test:e2e` (literal, antes do teste QA novo) | `158 passed (6.6m)`                                                                                   |
| `npm run test:e2e` (literal, com `qa-r3-musica`)     | `165 passed`, `1 skipped` (o teste de gesto sem `QA_HEADED`), em 6.6m                                 |
| `qa-r3-musica.e2e.ts` com `QA_HEADED=1`              | `8 passed (3.2m)`                                                                                     |

**Regras do usuário:**

- **Zero comentários:** nenhum `//`, `/*` ou `<!--` em `src`, `e2e`, `scripts` e `neon.ts`.
- **Zero `try/catch`.**
- **Zero classes** no código de produção. No meu teste, a interceptação do `AudioContext` usa `Proxy`, não `class`.
- **Tipagem:** ESLint exige retorno explícito.
- **Estrutura modular:** fora de `src/lib/modules` só ficam os pontos de entrada do SvelteKit; o áudio está em `src/lib/modules/audio/music/`.

### Observações (P3, não bloqueiam)

- **Margem da mixagem menor que a declarada.** O relatório do Senior fala em "~9 dB atrás". Na banda toda, medi 1 dB de RMS e picos equivalentes; acima de 200 Hz, 3,5 a 6,6 dB. O critério "abaixo dos efeitos" é cumprido. Se o usuário achar a trilha alta de ouvido, baixar `MUSIC_VOLUME` de 0.28 para ~0.2 resolve.
- **Retomada entre partidas.** O player é único na sessão, e `resumeBar` não é zerado ao começar uma partida nova. Por isso, a partida seguinte retoma a trilha do compasso em que a anterior parou, em vez de recomeçar pela intro. Leitura de código (`audio.ts` `music ??=`, `player.ts` `resumeBar`). Não afeta nenhuma regra documentada.
- **O teste de gesto exige navegador com janela.** O Chromium headless não aplica a política de autoplay. No CI, o teste fica `skipped`; para rodar: `QA_HEADED=1 xvfb-run -a npx playwright test e2e/qa-r3-musica.e2e.ts`.
- **Processos residuais e limites de teste.**
  - O servidor de desenvolvimento do Senior, na porta 4391, segue rodando; não é meu e não o encerrei.
  - Os meus foram encerrados (4273), e a 4173 está livre.
  - Não testei Safari, Firefox, aparelhos reais nem a audição humana.

### Arquivos do QA nesta rodada

- `docs/reviews/qa-validacao.md`: esta seção.
- `e2e/qa-r3-musica.e2e.ts`: novo, com 8 testes. O de gesto roda só com `QA_HEADED=1`.

Nenhum código de produção foi alterado. Sem commit e sem push.
