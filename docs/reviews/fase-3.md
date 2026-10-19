# Revisão — Fase 3

- **Data:** 2026-10-19
- **Escopo:** motor do jogo (listas de palavras, níveis, baralho, máquina de estados, timer, comparação com acentos, WPM/precisão, resultados e recordes locais).
- **Comandos executados:** `npm run check`, `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e`; comparação automática das listas com `docs/visual.md`.
- **Resultado dos comandos:** todos verdes; 53 testes unitários (scoring, deck, words, levels, query, validation, rate limit).
- **Achados bloqueantes:**
  1. `append()` bloqueava a digitação após um erro (`wordError`); corrigido para permitir continuar e limpar o erro. Regressão coberta pelo E2E "permite continuar digitando após um erro".
- **Achados não bloqueantes:**
  1. `gameQuerySchema` ficou sem uso ao migrarmos o parser para funções puras; removido.
- **Correções aplicadas:** correção do `append` e remoção de código morto.
- **Evidências (screenshots/logs):** contagens 10/15/30/45 conferidas contra `docs/visual.md`; pool personalizado com 100 entradas e 99 únicas (duplicata `mesa` conforme documentado); E2E de partida completa.
- **Resultado final:** aprovado.
