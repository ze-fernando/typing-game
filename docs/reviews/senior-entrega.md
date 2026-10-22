# Entrega senior — redesign ZionCodes, inglês, modo demo e ranking

- **Data:** 22/10/2026
- **Papel:** senior (implementação e testes). Coordenação: PO. Validação seguinte: QA.
- **Escopo:** design com identidade ZionCodes, versão completa em `/en`, modo demo inglês → português, ranking por modo e nível com Neon (produção) e SQLite (local), fechamento dos P1/P2 de `docs/reviews/po-audit.md`.
- **Sem commit e sem push.** As alterações do usuário que já estavam no working tree foram preservadas e usadas como base.

## Resultado em uma tela

| Verificação                        | Resultado                                                                |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `npm run check`                    | `COMPLETED 4620 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS`         |
| `npm run lint`                     | Prettier: "All matched files use Prettier code style!"; ESLint sem erros |
| `npm run test`                     | `Test Files 20 passed (20)` · `Tests 120 passed (120)`                   |
| `npm run build`                    | `✓ built` (client e server) · adapter Netlify `✔ done`                   |
| `npm run test:e2e` (Playwright)    | `54 passed (56.8s)`, com SQLite real em `.data/e2e/`                     |
| `impeccable detect --json` (UI)    | `[]`                                                                     |
| Revisão de acabamento (impeccable) | disposição `fix`; itens materiais 2 a 6 corrigidos (ver abaixo)          |

Para rodar o E2E nesta máquina, os navegadores ficam em `/home/zeco/.cache/ms-playwright`: `PLAYWRIGHT_BROWSERS_PATH=/home/zeco/.cache/ms-playwright npx playwright test`.

## O que mudou

### 1. Design ZionCodes

- Tokens em `src/app.css`, nos temas claro e escuro. Escuro: canvas `#000`, surface `#0a0a0a`, elevated `#03080e`, hairline `rgba(255,255,255,.10)`, acento `#3b82f6`. Claro: `#fafafa`/`#fff`, texto `#09090b`, mesmo azul.
- Contraste AA:
  - Os botões sólidos usam `#2563eb` (5,2:1 com branco), com hover `#1d4ed8`. O `#3b82f6` com branco daria só 3,7:1.
  - No claro, o token de texto `--primary` é `#1d4ed8`, para passar AA sobre o fundo azul suave. Essa troca corrigiu a única violação que o axe encontrou.
- Fontes self-hosted:
  - **Saira** (`@fontsource-variable/saira`) na UI e nos títulos.
  - **JetBrains Mono** só na palavra, no tempo e nos números tabulares.
  - A Inter foi removida.
- Componentes reescritos na linguagem Zion:
  - Wordmark `TYPING` + `GAME` em azul.
  - Chips pill em caixa-alta com tracking .15em.
  - Botões primário, secundário (hover azul), ghost e danger.
  - `SegmentedControl`, `LanguageSwitch` BR/US, `Dialog`, `Toggle` (role `switch`), toasts com botão fechar acessível e teclas planas com borda hairline.
- Home:
  - Título curto e a palavra-exemplo "coração" com `çã` em azul.
  - Combinações ABNT2 com `kbd`.
  - Menu de níveis com atalhos 1–4 e alternância de modo (digitar / demo).
  - Ranking com abas de modo e nível, FAQ e rodapé.
- Partida:
  - Tempo grande e tabular.
  - Chips de palavras, ppm, precisão e **combo**.
  - Barra de tempo que fica âmbar aos 10 s e vermelha aos 5 s.
  - Letras acentuadas pendentes em azul (assinatura) e feedback verde/vermelho por letra.
  - Tremida no erro, mensagem textual de acento errado e contagem 3-2-1.
- Resultado:
  - Faixa de **novo recorde**, com o delta sobre o recorde anterior.
  - Seis números: velocidade, precisão, palavras, tempo ativo, maior combo, e erros ou dicas.
  - Envio ao ranking com a posição obtida e o top 10, com a linha do jogador destacada.
- Imagem social nova (`static/og.png` e `og.svg`) e favicon novo no visual Zion.
- Movimento: `prefers-reduced-motion` desliga tremida, pop e deslocamentos, e mantém a contagem visível com opacidade 1 (coberto por E2E).

### 2. Versão em inglês

- Rotas `/en` e `/en/play`. A página de erro segue o idioma do caminho, então `/en/qualquer-coisa` vira um 404 em inglês.
- Módulo `src/lib/modules/i18n/`:
  - Mensagens `pt.ts`/`en.ts`; `en` é tipado como `Messages = typeof PT_MESSAGES`, então faltar uma chave quebra o build.
  - Contexto Svelte (`provideI18n`/`useI18n`), rotas por idioma e formatação de números (`42,3` em pt, `42.3` em en).
  - Sem biblioteca externa.
- `<html lang>` correto já no HTML pré-renderizado, via `src/hooks.server.ts` + `%lang%` em `app.html`, e atualizado na navegação do cliente.
- SEO por idioma:
  - Títulos e descrições únicos, `canonical`, `hreflang` pt-BR/en/x-default e `og:locale` com alternate.
  - Twitter card.
  - JSON-LD `["WebApplication","VideoGame"]` + `FAQPage` em `src/lib/seo/structured-data.ts`, com o `<` escapado.
  - Sitemap com as quatro URLs e alternates `xhtml:link`; robots com `Disallow: /api/`.
- Banco em inglês (`src/lib/modules/words/en.ts`): 191 / 226 / 226 palavras (3–5, 6–9 e 10+ letras).

### 3. Modo demo inglês → português

- Banco `src/lib/modules/translation/bank.ts`: 309 / 167 / 245 entradas, com até 4 traduções válidas por palavra. A progressão segue a resposta canônica: sem acento, com acento, abstratas e longas.
- `src/lib/modules/translation/matching.ts`:
  - Aceite de qualquer alternativa: insensível a maiúsculas, sensível a acentos, com normalização NFC.
  - Feedback por letra sem vazar a resposta: a letra fica verde enquanto o prefixo existe em alguma alternativa.
  - Detecção de acento errado e dica.
- **Regra da dica (aprovada pelo PO):**
  - Mostra a primeira letra e o número de letras da tradução principal.
  - A palavra concluída com dica vale **metade dos caracteres corretos** (arredondado para baixo) no WPM.
  - A regra aparece na tela antes do uso.
  - O resultado mostra "Dicas usadas"; o servidor valida `hintedWords` e só aceita dicas em `en-pt`.
- Disponível nas duas versões: `?modo=en-pt` (e o alias `mode=en-pt`). No `/en`, a UI explica que o modo é para praticar português.
- O teto de WPM do modo é 180, menor que os 250 dos modos de digitação, porque a tarefa envolve pensar na tradução.

### 4. Ranking e banco

- `src/lib/modules/leaderboard/server/`:
  - Interface única `LeaderboardRepository` (`listTop`, `insert`), com dois drivers: `postgres.server.ts` (Neon) e `sqlite.server.ts` (`node:sqlite`).
  - Escolha do driver em `target.ts`:
    - `postgresql://` → Neon;
    - `sqlite:arquivo` → SQLite;
    - vazio em dev → `.data/leaderboard.sqlite`;
    - vazio em produção → `503`.
  - Os arquivos `.server.ts` são protegidos contra import no cliente.
- Um ranking por modo (`pt`, `en`, `en-pt`) e nível. A cada envio, a poda mantém no máximo 1000 resultados (`wpm desc, accuracy desc, created_at asc, id asc`). A posição é calculada em SQL; o `rank` vem `null` se o resultado ficou fora dos 1000.
- Migrations:
  - `db/migrations/postgres/`: a migração original foi movida para cá, e uma nova é aditiva (colunas `mode` com padrão `pt` e `hinted_words`, `CHECK`s e índice `(mode, level, wpm, accuracy, created_at, id)`).
  - `db/migrations/sqlite/`: o schema equivalente.
  - Os dois drivers registram o que já rodou em `schema_migrations`. `scripts/db-apply.js` aplica nos dois.
- API:
  - Códigos de erro estáveis (`invalid_json`, `invalid_payload`, `invalid_nickname`, `rate_limited`, `unavailable`), traduzidos no cliente.
  - O `GET` usa `cache-control: no-store` (ver decisão abaixo).
  - O `POST` devolve `{ score, rank }`.
- Validação zod em `src/lib/validation.ts`:
  - Recálculo de WPM e precisão, total de palavras do nível e duração compatível.
  - Faixa de caracteres corretos pelas respostas do banco, reduzida quando há dica.
  - Mínimo de 150 ms por palavra e teto de WPM por modo.
  - Apelido de até 20 caracteres.
  - O rate limit roda depois da validação, para que envios inválidos não consumam a cota. Nenhum IP é armazenado.
- O cliente separa os schemas de resposta em `modules/leaderboard/schemas.ts`, para não carregar os bancos de palavras na home.
- `package.json`: `engines.node >=24.0.0` (o `node:sqlite` dispensa dependência); `.data/` no `.gitignore`; `.env.example` e README explicam SQLite local e Neon na Netlify.

### 5. Pendências da auditoria (`po-audit.md`)

| Prioridade | Achado                                          | Como foi fechado                                                                                                                                                                                                         | Evidência                                                                                 |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| P1         | Promise de `getBest` atribuída ao estado        | A home aguarda `Promise.all` e só aplica enquanto o efeito está ativo                                                                                                                                                    | `npm run check` sem erros; `HomePage.svelte`                                              |
| P1         | Resposta do envio alterando outra partida       | O envio guarda o resultado de origem e ignora resposta de partida trocada. `lastResult`/`savedFor` usam `$state.raw`, para a comparação por identidade funcionar (com proxy, o recorde era descartado)                   | E2E "joga, salva com apelido…" e "joga uma partida completa" (faixa de recorde)           |
| P1         | Timer, pausa e pontuação                        | O store recebe um relógio injetável. Cobertos: prazo exato, envio depois do prazo ignorado, pausa congelando o tempo ativo, pausa na contagem, prefixo errado sem pontuar, WPM pelo tempo ativo e reinício               | `src/lib/stores/game.test.ts` (10 testes)                                                 |
| P1         | Teclado global contra modais e IME              | Atalhos e digitação ignoram qualquer `dialog[open]`, composição (`isComposing`, `Dead`, `Process`, 229), modificadores e campos de texto. Na partida, `compositionstart`/`compositionend`                                | E2E "atalhos não disparam com um diálogo aberto", "sair no meio pede confirmação"         |
| P1         | Viewport 360 px e paisagem                      | Teclado compacto com alvos de 44 px; alternador de teclado no cabeçalho; a partida cabe inteira em 360×740 (inclusive EN→PT); paisagem 740×360 com campo alcançável                                                      | `e2e/responsive.e2e.ts`                                                                   |
| P1         | Storage bloqueado                               | O bootstrap do tema e o storage usam Promise com fallback                                                                                                                                                                | E2E "carrega, aplica tema e joga mesmo com localStorage lançando erro"; `src/app.test.ts` |
| P2         | Hidratação de settings sobrescrevendo o usuário | Contador de edição: a leitura atrasada não sobrescreve a escolha feita durante a hidratação                                                                                                                              | `src/lib/stores/settings.test.ts`                                                         |
| P2         | Recorde personalizado agregado                  | A chave inclui modo, quantidade e tempo; o resultado mostra o delta do recorde anterior                                                                                                                                  | `src/lib/utils/bests.test.ts`                                                             |
| P2         | Ranking sem timeout ou com payload inválido     | Timeout de 10 s, validação zod da resposta, estados "vazio" e "indisponível" distintos, novas tentativas                                                                                                                 | `src/lib/api/leaderboard.test.ts`, E2E de ranking                                         |
| P2         | SEO inventando domínio                          | URLs absolutas só com `PUBLIC_SITE_URL`                                                                                                                                                                                  | `src/lib/seo/sitemap.test.ts`, `links.test.ts`, `e2e/seo.e2e.ts`                          |
| P2         | Contagem invisível com movimento reduzido       | O CSS de movimento reduzido mantém opacidade 1                                                                                                                                                                           | E2E "contagem regressiva continua visível com movimento reduzido"                         |
| P2         | Tabstop invisível entre 640 e 767 px            | Três faixas calculadas em JS (`keyboard-tiers.ts`): teclas escondidas não são renderizadas e há um único tabstop, sempre visível; a raiz virou `role="toolbar"`                                                          | `keyboard-tiers.test.ts`; E2E "tablet 700 px"                                             |
| Crítica    | Resultado sem saída e Esc destruindo trabalho   | Fechar o resultado deixa o painel com "Jogar novamente", "Ver resultado" e "Início", e o foco volta para "Ver resultado". O foco inicial do diálogo é "Jogar novamente". Sair no meio pede confirmação e congela o tempo | E2E "fecha o resultado sem perder as ações…"                                              |
| Crítica    | Clique no teclado virtual perdido               | O `mousedown` nas teclas não tira o foco do campo, e o botão "Voltar ao campo" virou sobreposição, sem deslocar o layout                                                                                                 | E2E "teclado virtual insere acento", "erro não avança…"                                   |

## Decisões de arquitetura

1. **Ids estáveis** `iniciante`/`amador`/`expert` no código, no banco e nas URLs; a UI exibe "Avançado"/"Advanced" (aprovado pelo PO). Os recordes locais do português mantêm a chave antiga.
2. **i18n tipado sem biblioteca:** `typeof PT_MESSAGES` é o contrato, e um teste compara a forma recursiva das duas línguas, incluindo a aridade das funções.
3. **Rotas separadas** `(/, /jogar)` e `(/en, /en/play)`, que renderizam os mesmos componentes de página (`modules/home`, `modules/play`). O idioma vem do caminho, no `+layout.ts`.
4. **Ranking sem cache HTTP** (`no-store`). Com `stale-while-revalidate`, o próprio navegador mostrava o top 10 antigo logo após o envio. A consulta é indexada e devolve no máximo 20 linhas, então o frescor vale mais que o cache de CDN.
5. **SQLite via `node:sqlite`** para não adicionar dependência. As migrações SQLite são embutidas com `import.meta.glob` e aplicadas ao abrir o arquivo. Em produção a Netlify usa só o Neon.
6. **Dependências:**
   - Adicionada `@fontsource-variable/saira`, pela fonte exigida pela identidade, self-hosted e sem Google Fonts.
   - Removida `@fontsource-variable/inter`.
   - Nenhuma outra.
7. **IDs de DOM:** restam apenas os dois exigidos pela acessibilidade e já documentados no plano: `#conteudo` (skip link) e `game-input-help` (`aria-describedby`). Nenhum é usado como seletor.
8. **Sem comentários no código:** os comentários dos arquivos tocados foram removidos (`env.ts`, `app.d.ts`, `lib/index.ts`, `vite.config.ts`, `eslint.config.js`, `storage.ts`, `rate-limit.ts`, `query.ts`, `words.ts`). A exceção de `@html` do JSON-LD ficou no `eslint.config.js`, restrita a `Seo.svelte`, e não como comentário.

## Capturas finais

Todas com movimento reduzido, em 1440×900 e 360×740, em `docs/reviews/assets/`:

| Tela                            | Escuro                                                                                              | Claro                                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Home pt, desktop                | [senior-home-pt-dark-desktop](assets/senior-home-pt-dark-desktop.png)                               | [senior-home-pt-light-desktop](assets/senior-home-pt-light-desktop.png)                               |
| Home pt, mobile                 | [senior-home-pt-dark-mobile](assets/senior-home-pt-dark-mobile.png)                                 | [senior-home-pt-light-mobile](assets/senior-home-pt-light-mobile.png)                                 |
| Home en, desktop                | [senior-home-en-dark-desktop](assets/senior-home-en-dark-desktop.png)                               | [senior-home-en-light-desktop](assets/senior-home-en-light-desktop.png)                               |
| Home en, mobile                 | [senior-home-en-dark-mobile](assets/senior-home-en-dark-mobile.png)                                 | [senior-home-en-light-mobile](assets/senior-home-en-light-mobile.png)                                 |
| Partida pt, desktop             | [senior-game-pt-dark-desktop](assets/senior-game-pt-dark-desktop.png)                               | [senior-game-pt-light-desktop](assets/senior-game-pt-light-desktop.png)                               |
| Partida pt, mobile              | [senior-game-pt-dark-mobile](assets/senior-game-pt-dark-mobile.png)                                 | [senior-game-pt-light-mobile](assets/senior-game-pt-light-mobile.png)                                 |
| Demo EN→PT com dica, desktop    | [senior-game-enpt-dark-desktop](assets/senior-game-enpt-dark-desktop.png)                           | [senior-game-enpt-light-desktop](assets/senior-game-enpt-light-desktop.png)                           |
| Demo EN→PT com dica, mobile     | [senior-game-enpt-dark-mobile](assets/senior-game-enpt-dark-mobile.png)                             | [senior-game-enpt-light-mobile](assets/senior-game-enpt-light-mobile.png)                             |
| Resultado personalizado         | [desktop](assets/senior-results-dark-desktop.png) · [mobile](assets/senior-results-dark-mobile.png) | [desktop](assets/senior-results-light-desktop.png) · [mobile](assets/senior-results-light-mobile.png) |
| Resultado ranqueado com recorde | [senior-results-ranked-dark-desktop](assets/senior-results-ranked-dark-desktop.png)                 | [senior-results-ranked-light-mobile](assets/senior-results-ranked-light-mobile.png)                   |

O resultado personalizado veio de uma partida digitada por automação em menos de 1 s. A velocidade aparece como "—" de propósito: abaixo de 1 s de tempo ativo o WPM não é confiável.

## Revisão de acabamento (impeccable)

Disposição `fix`. Itens materiais:

1. **Referência da rolagem de conceito no contrato.** Não aplicada: a direção foi fixada pelo brief do usuário (identidade ZionCodes), então não houve rolagem; o contrato registra isso.
2. **Rótulo em caixa-alta acima da palavra no modo tradução.** Removido; a instrução foi para o placeholder do campo.
3. **Teclas em relevo físico fora do mundo Zion.** Agora são planas, com borda hairline; pressionadas ganham borda azul e fundo azul suave.
4. **Teclado escuro no tema claro.** O tema claro tem teclas brancas próprias.
5. **EN→PT passando de 740 px no celular.** A dica virou botão-ícone na mesma linha do campo; o E2E agora exige o teclado inteiro em 360×740 nos dois modos.
6. **Revanche como ação padrão.** "Jogar novamente" recebe o foco ao abrir (coberto por E2E).

Opcionais não aplicados:

- Remover a fileira de funções do teclado no desktop.
- Encurtar o rótulo do segmentado a 360 px.
- Título do bloco de ranking depois de salvo.
- Exemplo do hero em `/en`.
- Pontuação do rodapé: **recusada**, porque o texto exato é exigido pelo usuário.

## Incidente durante a entrega

Às 16:53–17:09, agentes **OpenCode** do usuário (`.opencode/front-1..3`) editaram em paralelo:

- `PlayPage`, `GameScreen`, `HomePage`, `IconButton`, `ThemeToggle`, `LanguageSwitch`;
- as mensagens;
- `seo/links.ts` (novo) e `Seo.svelte`;
- os E2E.

O PO foi avisado duas vezes e encerrou o `opencode serve` com autorização do usuário. Por decisão do PO, incorporei o que fazia sentido:

- restauração de foco ao fechar o resultado;
- `links.ts` com teste;
- link "Voltar ao início";
- estado do botão de tema.

E corrigi o que eles quebraram:

- dois erros de tipo com `resolve()`;
- um import removido;
- um comentário `eslint-disable`.

Os scripts deles continuam em `.opencode/`, que é ignorado pelo git; não toquei neles.

## Riscos e limites

- **Neon não testado de verdade nesta máquina** (não há string de conexão). O driver Postgres tem o mesmo SQL do SQLite e foi revisado, mas só os testes de SQLite rodam. A migração aditiva no Neon precisa de `npm run db:apply` antes do deploy.
- **A poda e o cálculo de posição no Neon são três requisições HTTP**, não uma transação. Uma corrida entre envios simultâneos pode deixar momentaneamente mais de 1000 linhas; o envio seguinte poda.
- **O rate limit é em memória, por instância**, e não global.
- O antifraude é de plausibilidade, não prova de partida real.
- O `node:sqlite` emite um `ExperimentalWarning` no Node 24 (só em dev e testes).
- Capturas e E2E rodaram em Chromium com viewport emulada. Safari, Firefox e aparelhos físicos (teclado do sistema, IME real) não foram verificados.
- O `PUBLIC_SITE_URL` real precisa ser definido na Netlify antes do build público. O E2E usa `https://typing-game.netlify.app` apenas como origem de teste.

## O que o QA deve conferir

1. A suíte inteira na própria máquina: `npm run check && npm run lint && npm run test && npm run build`, e depois `npm run test:e2e`.
2. Jogo real com teclado físico ABNT2 e com teclas mortas (´ ~ ^), IME no celular e o teclado virtual por toque (alvos de 44 px, faixa de acentos).
3. O modo demo nos dois sites:
   - traduções alternativas;
   - mensagem de acento errado;
   - a dica valendo metade;
   - a contagem de dicas no resultado;
   - o ranking `EN → PT` separado.
4. O ranking com SQLite local (`npm run dev`):
   - posição após o envio e destaque no top 10;
   - isolamento entre modos e níveis nas abas;
   - `429` após 5 envios válidos em 1 minuto.
5. Temas claro, escuro e sistema, sem flash ao recarregar, e alternância com o sistema operacional em "sistema".
6. SEO no build com `PUBLIC_SITE_URL`: `view-source` de `/` e `/en` (`lang`, `canonical`, `hreflang`, `og:locale`, JSON-LD) e `sitemap.xml`.
7. Leitor de tela:
   - anúncios de palavra, tempo (30, 10, 5, 3, 2, 1) e pausa;
   - foco ao abrir e fechar o resultado;
   - teclado virtual como toolbar com setas.
8. Opcionalmente, rodar `npm run db:apply` contra um Neon de teste e repetir o fluxo de envio.

## Rodada 2

Correções de todos os itens reprovados em `docs/reviews/qa-validacao.md` (P1-1, P1-2, P2-1 a P2-4), mais um polish geral. Sem commit e sem push.

### P1-1: paisagem sem sobreposição

- **Tamanho da palavra pelo espaço disponível.** Nova classe `.word-fit` em `src/app.css`. O tamanho é o menor entre o teto do papel e a largura do contêiner (`100cqi`) dividida pelo número de letras, com piso de 1.125rem. Abaixo do piso, a palavra quebra em mais linhas e ocupa altura própria, sem cobrir o HUD. Vale para a palavra digitada, o prompt em inglês e a linha da tradução.
- **Paisagem compacta.** A variante `landscape-short` (até 480 px de altura, em paisagem) substitui as media queries arbitrárias:
  - o painel da partida fica com a coluna mais larga (`flex-[1.2]`);
  - o tempo cai para 1.875rem e o HUD fica mais justo;
  - a palavra tem teto de 2.5rem e a área dela ocupa o espaço que sobra;
  - a frase "Digite e confirme" some (o placeholder já diz isso);
  - campo e botão de dica têm 44 px.

  O teclado virtual continua visível.

- **E2E novo:** `e2e/landscape.e2e.ts`, com 18 testes: 740×360 e 844×390 × a palavra mais longa de cada banco (pt, en e en-pt, nos 3 níveis).
  - **Palavra forçada:** o helper `forceFirstEntry` controla `crypto.getRandomValues` para pôr a palavra mais longa no início do baralho, por exemplo `pneumoultramicroscopicossilicovulcanoconiótico` e `pneumonoultramicroscopicsilicovolcanoconiosis`.
  - **O que mede:** compara as caixas (`boundingBox`) da palavra com as do tempo, das fichas, da barra, do campo e da regra da dica. Exige também que a palavra esteja dentro do viewport e sem corte (`scrollWidth`).
  - **Quando mede:** antes de digitar, com a palavra quase toda digitada e, no en-pt, com a dica aberta.

### P1-2: apelido anônimo localizado

- **Gravação:** apelido vazio é gravado como `''`. O `DEFAULT_NICKNAME` deixou de existir, substituído por `ANONYMOUS_NICKNAME` em `modules/leaderboard/limits.ts`.
- **Exibição:** `displayNickname` mostra `leaderboard.anonymous` no idioma da página ("Anônimo" / "Anonymous"). `'Anônimo'` continua sendo tratado como sentinela, então registros antigos aparecem como "Anonymous" em `/en`, mesmo antes da migração.
- **Migrações novas:**
  - Postgres: `20261023120000_anonymous_nickname.sql` muda o default para `''` e converte os `'Anônimo'` existentes;
  - SQLite: a migração de mesmo nome faz a conversão.
- **Testes:**
  - `limits.test.ts`;
  - `validation.test.ts`, atualizado;
  - `repository.test.ts`, com a migração convertendo o registro antigo e o vazio gravado;
  - o E2E do QA passa, com a saída `QA_EN_BOARD "#1\nAnonymous\n232.6 wpm\n100.0%"`.

### P2-1: "Acento errado" com alternativas empatadas

`closestAnswer` agora testa `findAccentMismatch` em cada alternativa antes de comparar prefixos. Assim, `dog` digitado como `cao` mostra "Wrong accent: use ã instead of a.". Há teste unitário novo em `matching.test.ts`. No E2E do QA, os 4 casos com palavra acentuada registraram "mensagem de acento: sim".

### P2-2: placeholder do EN→PT

O placeholder passou para "Em português" / "In Portuguese" (chave `translatePlaceholder`) e cabe em 360 px com o botão de dica. A instrução completa continua no rótulo acessível do campo.

### P2-3: tipos de retorno

- **Na fonte:**
  - `createGame` devolve a interface `Game`, que substitui o antigo `ReturnType<typeof createGame>`;
  - `listTop` e `insert` dos dois drivers ganharam `Promise<ScoreEntry[]>` e `Promise<SubmittedScore>`;
  - o `sync` do `VirtualKeyboard` ganhou `(): void`;
  - os helpers de teste ganharam tipos.
- **`scripts/db-apply.js` virou `scripts/db-apply.ts`:**
  - tipos `DatabaseTarget`, `Driver`, `Migration` e `MigrationRow`, sem JSDoc;
  - o Node 24 executa TypeScript direto, então `db:apply` é `node scripts/db-apply.ts`, sem dependência nova;
  - `scripts` entrou no `tsconfig` para o `check` verificar o arquivo.
- **Varredura permanente:** o ESLint passou a exigir `@typescript-eslint/explicit-function-return-type` em `.ts` e `.svelte` (com `allowExpressions` e `allowTypedFunctionExpressions`). O lint passa com zero erros.

### P2-4: estrutura modular

Tudo saiu de `components`, `game`, `stores`, `utils`, `api`, `seo`, `audio` e `validation.ts` para `src/lib/modules/`: 57 arquivos, com imports reescritos por script.

| Módulo         | Conteúdo                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `game`         | tipos, níveis, baralho, query, pontuação, layout e faixas do teclado, estado da partida (`game.svelte.ts`), recordes locais e componentes do jogo |
| `leaderboard`  | cliente HTTP (`api.ts`), validação, schemas, limites, componentes do ranking e servidor                                                           |
| `settings`     | preferências, codec, `SettingsDialog` e `ThemeToggle`                                                                                             |
| `ui`           | Button, Chip, Dialog, IconButton, SegmentedControl, Toggle, ToastHub e o estado de UI                                                             |
| `layout`       | SiteHeader, SiteFooter e Wordmark                                                                                                                 |
| `i18n`         | ganhou `components/LanguageSwitch.svelte`                                                                                                         |
| `seo`, `audio` | movidos sem mudança                                                                                                                               |
| `shared`       | storage e guardas de teclado                                                                                                                      |

O alias `#lib` continua o mesmo, e não houve mudança de comportamento. O README foi atualizado.

### Polish

- **Escala de fonte:** os 4 avisos `design-system-font-size` do QA foram para a escala Label do `DESIGN.md`, de 0.6875rem. São eles o `kbd` em `app.css` e os rótulos secundários do teclado virtual.
- **`DESIGN.md`:** passou a documentar `.word-fit` e a variante `landscape-short`.
- **Detector do impeccable:** `[]` na fonte e nas páginas `/`, `/en`, `/jogar?nivel=expert` e `/en/play?nivel=amador&modo=en-pt`.

### Aceite

| Comando                                               | Resultado                                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run check`                                       | `COMPLETED 4623 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS`                                  |
| `npm run lint`                                        | "All matched files use Prettier code style!" e ESLint sem erros (exit 0)                          |
| `npm run test`                                        | `Test Files 22 passed (22)` · `Tests 126 passed (126)`                                            |
| `npm run build`                                       | `✓ built` · adapter Netlify `✔ done`                                                              |
| E2E completo (54 oficiais, 31 do QA e 18 de paisagem) | `103 passed (2.8m)`, incluindo "QA nome padrão do ranking aparece em inglês para jogador anônimo" |
| `npm run db:apply` com `sqlite:`                      | aplica as migrações e fica idempotente                                                            |

**Nota de ambiente:** `npm run test:e2e` não roda literalmente aqui, porque a porta 4173 está ocupada por um `vite preview` residual da validação do QA (PID 480386).

- **Por que não encerrei:** o PO autorizou encerrar o processo, mas a permissão do ambiente bloqueou o `kill`.
- **Como rodei:** a suíte inteira rodou com uma config temporária fora do versionamento (`.data/r2/pw-full.config.ts`). É a mesma config oficial (build + preview, SQLite em `.data/e2e`, `PUBLIC_SITE_URL`), só que na porta 4473.
- **O que falta:** depois de liberar a 4173, `npm run test:e2e` deve dar o mesmo resultado.

A suíte do QA grava capturas `qa-*.png`. Restaurei os 36 originais do QA, conferidos byte a byte, para não alterar a evidência do relatório dele.

### Capturas da rodada 2

Em `docs/reviews/assets/senior-r2-*.png` há 24 capturas: 740×360, 844×390 e 360×740, nos temas claro e escuro, com a palavra mais longa de cada caso:

- `pt-expert`: `pneumoultramicroscopicossilicovulcanoconiótico`;
- `en-expert`: `pneumonoultramicroscopicsilicovolcanoconiosis`;
- `enpt-amador`: `passionfruit`;
- `enpt-expert`: `responsibility`.

Por exemplo: [paisagem pt 740×360](assets/senior-r2-pt-expert-740x360-dark.png), [paisagem en 844×390](assets/senior-r2-en-expert-844x390-dark.png), [en-pt 740×360 claro](assets/senior-r2-enpt-amador-740x360-light.png) e [en-pt 360×740](assets/senior-r2-enpt-amador-360x740-light.png).

### O que fica

- **Palavras de 45–46 letras:** no celular deitado ou em pé, quebram em duas linhas no piso de 1.125rem. Ficam inteiras e legíveis, sem cobrir nada, mas não cabem numa linha só nessas larguras.
- **P3 do QA (não pedidos nesta rodada):** o envio implausível ainda é oferecido na tela de resultado, e o seletor BR/US continua fora da partida.
- **Não verificado:** Neon real, Safari e Firefox, aparelhos físicos e IME real continuam fora do que foi testado.

## Rodada 3

### 1. Música de fundo

A nota senoidal a cada 2,6 s deu lugar a uma trilha própria, gerada em tempo real pela Web Audio API. Não há arquivo de áudio, licença de terceiros nem dependência nova.

**Composição (`src/lib/modules/audio/music/song.ts`):**

| Item       | Valor                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| Tonalidade | Lá menor (todas as notas na escala, verificado por teste)                                                      |
| Andamento  | 88 BPM, 4/4, grade de semicolcheias (16 passos por compasso, ~2,73 s)                                          |
| Progressão | `Am7 – Fmaj7 – Cmaj7 – Em7` (i–VI–III–v), com voicings próximos para o pad não saltar                          |
| Seções     | intro, groove, lift e breakdown (tabela abaixo)                                                                |
| Ordem      | intro → groove → lift → groove → breakdown, e o laço volta ao groove: 24 compassos, ~65 s, sem repetir a intro |

| Seção       | Compassos | Acordes                         | Camadas                                                       |
| ----------- | --------- | ------------------------------- | ------------------------------------------------------------- |
| `intro`     | 4         | Am7 – Fmaj7 – Cmaj7 – Em7       | pad, baixo longo, sino no tempo 3                             |
| `groove`    | 8         | progressão principal duas vezes | pad, baixo sincopado, arpejo em colcheias, bumbo, caixa e hat |
| `lift`      | 4         | Dm7 – Fmaj7 – Cmaj7 – G6        | arpejo uma oitava acima, baixo mais ativo e hats mais densos  |
| `breakdown` | 4         | Fmaj7 – Em7 – Dm7 – Em7         | pad, baixo em mínimas, sino e só um bumbo por compasso        |

**Módulos:**

| Arquivo           | Papel                                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `types.ts`        | partitura e eventos tipados                                                                                                                    |
| `patterns.ts`     | funções puras: `barAt` com o laço, `barEvents` por compasso e humor, `midiToFrequency`                                                         |
| `scheduler.ts`    | agendador lookahead com relógio injetável: timer de 25 ms, janela de 120 ms no `currentTime` do `AudioContext`, sem `setInterval` por nota     |
| `instruments.ts`  | pad com duas serras ±7 cents e passa-baixa, baixo triangular, arpejo pluck, sino, bumbo com queda de 110→42 Hz, caixa e hat por ruído filtrado |
| `player.ts`       | barramento com ganho e filtro, fades, retomada e humor                                                                                         |
| `state.svelte.ts` | estado exposto como `data-music` na tela de jogo                                                                                               |

**Mixagem:**

- O ganho do barramento é 0.28, com fade-in de 1,6 s e fade-out de 0,5 s.
- **Medição:** foi offline (`OfflineAudioContext`, no Chromium). A música fica com RMS de ~0,010 e pico de 0,04 a 0,06 por seção. O acerto de palavra tem pico de 0,044. A trilha fica cerca de 9 dB atrás dos efeitos.
- **Prévia:** há um WAV de 32 compassos fora do repositório, no scratchpad da sessão (`trilha-preview.wav`).

**Reação ao jogo:**

- **Combo de 3 ou mais:** soma uma camada de arpejo nas seções sem arpejo e hats extras no groove. A harmonia não muda e a camada entra no compasso seguinte.
- **Últimos 10 s:** o passa-baixa abre de 2,4 kHz para 9 kHz, com transição de 0,8 s.

**Comportamento (decisões documentadas também no README):**

- **Gesto:** a música só soa depois de um gesto, pela política de autoplay e pelo `unlockAudio` no teclado.
- **Contagem e pausa:** começa na contagem e pausa com o jogo, com a aba oculta (o jogo pausa no `visibilitychange`) e com as configurações abertas.
- **Retomada:** volta quando o jogo continua, no compasso seguinte ao da pausa. A aba que volta ao foco mantém o jogo pausado, regra da rodada 1, e a música retoma junto com o jogo.
- **Resultado:** a música **para na tela de resultado**, para o jogador ler o placar em silêncio. Os nós do barramento são desconectados depois do fade.
- **Botão Música:** liga e desliga de verdade e persiste no storage (`music=on|off`).
- **Bug corrigido:** antes, a música e o bipe da contagem tocavam no primeiro quadro, antes das preferências carregarem do storage. Agora nada soa até `settingsStatus.hydrated`.
- **Movimento reduzido:** `prefers-reduced-motion` não afeta o áudio.
- **Sem vazamento:** ao trocar de rota, o `onDestroy` para o agendador e o player não deixa timer ativo. Há teste para isso.
- **Código removido:** `suspendAudio`, que não era usado.

**Testes:**

- **Unitários, determinísticos e sem `AudioContext` real (12 testes):**
  - `patterns.test.ts`: BPM, ordem das seções, laço sem a intro, escala, determinismo e camadas por seção e por combo;
  - `scheduler.test.ts`: horizonte, tempos exatos, sem passo duplicado, `stop` sem timer e retomada no compasso seguinte;
  - `player.test.ts`: com AudioContext falso, liga e desliga 5 vezes com um único agendador e desconecta o barramento.
- **E2E `e2e/music.e2e.ts` (3 testes):**
  - **Durante a partida:** a música toca, o que é comprovado contando `createOscillator` com os efeitos desligados. Ela para de criar nós ao pausar e ao esconder a aba.
  - **Botão Música:** desligar silencia de verdade e persiste após recarregar, com zero osciladores antes de interagir.
  - **Fim e saída:** a música para no resultado e ao voltar ao início.
  - **Console:** nenhum dos três registra erro.

### 2. `neon.ts`

- **Comentários:** removidos. A configuração é a mesma: `auth: false`, branch padrão sem override, branch nova com `ttl: '7d'` e branch existente sem mudança. O Prettier só trocou aspas e indentação.
- **Verificações:** o arquivo entrou no `include` do `tsconfig`, então o `check` também o verifica. Passa no ESLint e no Prettier.
- **Arquivos ignorados:** `.neon` e `.env.local` continuam fora do git (`git check-ignore`: `.gitignore:33 .neon` e `.gitignore:17 .env.*`).
- **`db:apply`:** passou a carregar `.env.local` e depois `.env`. Uma `DATABASE_URL` passada no comando continua vencendo; testei com `DATABASE_URL=sqlite:… npm run db:apply` com o `.env.local` do Neon presente, e foi para o SQLite.

### 3. README e isolamento do banco

- **Seção do Neon:** passou a descrever o fluxo da CLI: `neon login`, `neon env pull` (gera `.env.local`) e `npm run db:apply`. Ela registra que a produção já está migrada.
- **Nova seção "Música de fundo".**
- **E2E fora do Neon:** o `playwright.config.ts` já define `DATABASE_URL=sqlite:.data/e2e/leaderboard.sqlite` no `webServer`, e o valor do processo vence o do `.env.local`. Conferi depois do `npm run test:e2e`: o `.data/e2e/leaderboard.sqlite` tinha os 4 envios da suíte.
- **Risco anotado no README:** com o `.env.local` presente, `npm run dev` sem `DATABASE_URL` passa a usar o Neon de produção. Para desenvolver localmente, o comando indicado é `DATABASE_URL=sqlite:.data/leaderboard.sqlite npm run dev`.

### Aceite

| Comando            | Resultado                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run check`    | `COMPLETED 4647 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS`                                                                     |
| `npm run lint`     | exit 0: "All matched files use Prettier code style!" e ESLint sem erros                                                              |
| `npm run test`     | `Test Files 25 passed (25)` · `Tests 138 passed (138)`                                                                               |
| `npm run build`    | `✓ built` · adapter Netlify `✔ done`                                                                                                 |
| `npm run test:e2e` | `158 passed (6.7m)`: a11y 9, game 11, home 17, landscape 18, leaderboard 4, music 3, qa-r2 52, qa-validacao 31, responsive 8 e seo 5 |

Desta vez o `npm run test:e2e` rodou com o comando literal, porque a porta 4173 estava livre. A porta 5190 não foi usada. As capturas `qa-*.png` regravadas pelas suítes do QA foram restauradas (94 arquivos, conferidos byte a byte).

### Limites

- **Só no Chromium:** a trilha foi verificada por medição offline e contagem de nós, sem ouvido humano em aparelho real. Não testei Safari, que exige gesto para criar o `AudioContext`, nem Firefox.
- **Servidor de desenvolvimento:** o meu, na porta 4391 com SQLite, ficou rodando, porque o ambiente bloqueia encerrar processos.
