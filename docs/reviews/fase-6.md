# Revisão — Fase 6

- **Data:** 2026-10-19
- **Escopo:** SEO, metadados, imagens sociais, sitemap/robots, headers, acessibilidade, Lighthouse e suíte E2E + axe.
- **Comandos executados:** `npm run check`, `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e`, Lighthouse (mobile e desktop) e axe via Playwright.
- **Resultado dos comandos:**
  - Lighthouse mobile — home: 97 performance, 100 acessibilidade, 96 boas práticas, 100 SEO; `/jogar`: 91/100/100/100. Desktop — home: 100/100/96/100.
  - LCP 2,1–2,4 s mobile e 0,5 s desktop; CLS ≈ 0; TBT 0–250 ms.
  - axe: 4 cenários (home claro/escuro, modais, jogo com movimento reduzido, resultados) sem violações WCAG 2.0/2.1 A/AA.
- **Achados bloqueantes:**
  1. `{@html}` com JSON-LD dentro de `svelte:head` quebrava o parser do ESLint; o JSON-LD estático foi movido para `app.html`.
  2. Regra `svelte/no-navigation-without-resolve`: `goto()` e `href` internos passaram a usar `resolve()` de `$app/paths`.
  3. `new URLSearchParams` em módulo runes violava `svelte/prefer-svelte-reactivity`; trocado por `SvelteURLSearchParams`.
  4. axe `label-content-name-mismatch` no logo (aria-label não continha o texto visível); aria-label removido e selo decorativo marcado com `aria-hidden`.
  5. O skip link apontava para `#conteudo`, ausente na tela do jogo e na página de erro; alvos adicionados.
  6. Performance mobile do `/jogar` em 82 (< 85) por causa do Zod no cliente; resolvido na Fase 5 (91 após a correção).
- **Achados não bloqueantes:**
  1. `og.svg` não é renderizado de forma confiável por redes sociais; geramos `og.png` 1200×630 com Chromium e atualizamos o metadado.
  2. Boas práticas ficam em 96 em ambiente local por causa do `503` esperado do ranking sem banco; em produção, com o banco provisionado, o erro some.
  3. A matriz manual de navegadores/dispositivos físicos fica como verificação de entrega; temas e movimento reduzido já são cobertos por E2E.
- **Correções aplicadas:** as descritas acima.
- **Evidências (screenshots/logs):** relatórios Lighthouse em `lh-home.json`, `lh-game.json`, `lh-desktop.json` (execução local) e 25 testes E2E verdes, incluindo os 4 de acessibilidade.
- **Resultado final:** aprovado.
