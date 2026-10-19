# Revisão — Fase 5

- **Data:** 2026-10-19
- **Escopo:** ranking global (Netlify Database), endpoints, validação, proteções e fallback local.
- **Comandos executados:** `npm run check`, `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e`; verificação mecânica de imports `#lib/server`.
- **Resultado dos comandos:** todos verdes. E2E: API responde `503` sem banco configurado (ou `200` com scores), `400` para nível personalizado, ranking renderiza com API mockada e mostra fallback quando falha.
- **Achados bloqueantes:**
  1. O `zod` entrou no bundle do cliente via parser de query e validação de respostas, pesando ~30 KB gzip e elevando o TBT móvel do `/jogar` (Lighthouse 82, abaixo da meta de 85). O pacote foi removido do cliente: parser de query em funções puras e type guards manuais no cliente; o Zod permanece apenas no servidor.
  2. A migração e o provisionamento do Netlify Database não puderam ser aplicados neste ambiente (CLI sem autenticação). Fica como pendência manual documentada no README e na Fase 7.
- **Achados não bloqueantes:**
  1. Cache de leitura e rate limit best-effort implementados; sem segredos no cliente.
- **Correções aplicadas:** parser e guardas sem Zod no cliente; confirmação de imports de servidor apenas em `+server.ts`.
- **Evidências (screenshots/logs):** nenhum chunk do cliente contém Zod após o build; E2E "ranking na home" (sucesso e fallback).
- **Resultado final:** aprovado (provisionamento do banco é pendência manual).
- **Atualização (2026-10-19, pós-fase 7):** o Netlify Database passou a exigir plano com créditos e o deploy falhava ao provisionar (`database feature not available for this account`). O acesso foi migrado para Neon (`@neondatabase/serverless` + `DATABASE_URL`), com migração idempotente em `db/migrations` aplicada por `npm run db:apply`. Endpoints, validação e fallback `503` inalterados.
