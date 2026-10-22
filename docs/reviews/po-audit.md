# Auditoria e integração — Typing Game

Data: 22/10/2026. Responsável pela integração: dev-lider. **Estado: integração em andamento; aceite final pendente de MAIN e QA.**

## Integridade da implementação

O núcleo é específico ao produto: vocabulário português, progressão por acentuação e teclado ABNT2 interativo. A revisão visual anterior identificou decoração sobre texto, alinhamento inconsistente e controles comprimidos; os patches existentes simplificam o fundo e preservam o instrumento. Isso não equivale a aprovação visual da versão final.

Baseline comunicado pelo PO: Assessment A independente **23/40**; Assessment B da homepage `[]`, exit 0. O arquivo histórico `.impeccable/critique/2026-10-22T17-55-14Z__src-routes-page-svelte.md` registra outra avaliação, **22/40**: são registros distintos e não se deve misturar suas notas. Não foi atribuída nota UX posterior às correções.

O scan de fonte anterior em `/tmp/typing-audit-detector.json` contém um aviso consultivo `codex-grid-background` em `src/app.css:149`, sem falha primária. A classe ainda é usada em `DeskScene`; o aviso é estilístico, não uma violação funcional demonstrada. A limpeza do detector não comprova acessibilidade nem qualidade visual.

## Matriz de achados, correções e evidências

| Prioridade | Achado / impacto                                                                          | Correção ou encaminhamento                                                             | Evidência e situação                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| P1         | Homepage atribui Promise de `getBest` ao estado de recordes; rompe contrato TS e exibição | MAIN deve aguardar leituras e atualizar estado somente enquanto montado                | Confirmado em `src/routes/+page.svelte`; pendente                                                                            |
| P1         | Resposta de salvar resultado pode alterar outra partida                                   | MAIN deve vincular requisição ao resultado que a iniciou e invalidar ao trocar partida | Confirmado em `ResultsDialog.svelte`; pendente                                                                               |
| P1         | Timer, pausas e pontuação precisam manter tempo ativo e não premiar prefixos errados      | Patches no store já existentes; MAIN adicionará regressões de deadline, pausa e score  | Código revisado; testes específicos ainda pendentes                                                                          |
| P1         | Eventos globais de teclado podem interferir com modais e composição                       | Patches GameScreen isolam contexto e IME; verificar atalhos, configurações e saída     | Aceite funcional browser pendente                                                                                            |
| P1         | Jogo e teclado em viewport baixo/360px podem esconder controles                           | Patches permitem rolagem, campo visível e troca teclado virtual/dispositivo            | Capturas finais e interação landscape pendentes                                                                              |
| P1         | Storage bloqueado pode lançar no bootstrap do documento                                   | `src/app.html` lê tema em Promise com fallback, sem `try/catch`                        | Corrigido por dev-lider; QA browser com storage bloqueado pendente                                                           |
| P2         | Hydrate assíncrono pode sobrescrever preferência recém-alterada                           | QA deve invalidar leitura atrasada após edição do usuário                              | Confirmado em settings; pendente                                                                                             |
| P2         | Recorde personalizado agregado compara desafios diferentes                                | Patches persistem por quantidade/tempo e rejeitam resultados sem progresso             | Testes existentes bests passam; UI deve evitar recorde agregado enganoso                                                     |
| P2         | Ranking pode esperar indefinidamente ou tratar resposta inválida como sucesso             | Timeout de 10s, validação do envelope e mensagens de retry                             | 5 testes `src/lib/api/leaderboard.test.ts` passaram: offline, timeout, payload inválido, retry503, vazio versus indisponível |
| P2         | Canonical/social/sitemap inventavam domínio de produção                                   | Origem HTTP(S) configurável; omitir URLs públicas quando ausente                       | Patches SEO/env/robots/sitemap revisados; E2E final pendente                                                                 |
| P2         | Layout decorativo e resets tipográficos reduzem legibilidade                              | Patches neutralizam BackgroundKeys, preservam utilitários e alinham conteúdo           | Comparação visual final pendente                                                                                             |
| P2         | Contagem regressiva invisível com motion reduzido                                         | Patch CSS substitui reset global por alternativas específicas                          | QA reduced-motion pendente                                                                                                   |
| P2         | Teclado virtual usa tabstop invisível entre 640 e 767px                                   | MAIN alinhará lista de teclas navegáveis à visibilidade e semântica                    | Warning do compilador e código anterior confirmados; pendente                                                                |

## Cinco dimensões técnicas

Sem nota final /20 nesta versão intermediária: estados e renderização ainda precisam ser verificados após integração. As cinco dimensões permanecem separadas da avaliação heurística /40.

| Dimensão       | Fundamentos positivos                                                                                 | Aceite restante                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Acessibilidade | `pt-BR`, landmarks, labels, diálogos nativos, foco visível, mensagens de erro textuais e live regions | Axe em ambos temas, fluxo completo por teclado, foco em retorno, IME e modais, contraste de controles |
| Performance    | Fontes locais, áudio sintetizado, código por rota, fundo simplificado e requests de ranking limitados | Build/bundle final; sem alegar Core Web Vitals ou desempenho em aparelho real                         |
| Temas          | Tokens semânticos claros/escuros, preferência sistema e bootstrap com fallback                        | Verificação visual clara/escura, hidratação sem sobrescrever usuário, storage bloqueado               |
| Responsividade | Teclado compacto, layout flexível e opção teclado do dispositivo                                      | 360/390px, tablet intermediário, desktop, landscape, zoom/texto ampliado e toque sintetizado          |
| Integridade    | ABNT2 e acentuação reais, estados de ranking distintos, recordes separados por configuração           | Fechar races e divergências de contrato; documentação e verificação final                             |

## Verificação já executada

- `npm run test`: 10 arquivos, **66 testes passaram** no checkpoint anterior às duas regressões novas de API; log `/tmp/lider-unit.log`.
- `npx vitest run src/lib/api/leaderboard.test.ts`: **5 testes passaram** após ampliar API client. Não somar execuções como se fossem uma suíte final.
- Prettier aplicado apenas aos arquivos de integração do líder. `.env.example` não tem parser inferido pelo Prettier e foi excluído dessa formatação.
- Capturas anteriores inspecionadas: `/tmp/qa-before-390.png` e `/tmp/qa-before-1440.png`. São baseline e não comprovam o estado atual.
- `npm run check`, `npm run lint`, `npm run test`, `npm run build`, E2E e capturas after: **aguardam integração final**.

## Coordenação e limites

Fluxo determinado pelo usuário: **PO → dev-lider → dev-main → dev-qa → PO**, nos terminais externos existentes. Nenhum subagente interno, nova biblioteca, worktree, commit ou push foi criado nesta integração.

O child Run `run_44c403513349` contém briefs MAIN/QA. `worker-start` recusou ambos terminais com `agent_unconfigured`; o fallback `dispatch` recusou `nested_worker_depth_exceeded` (depth 2, max 1, `effectsApplied: false`). O PO foi notificado e solicitou ajuste da profundidade ao usuário. Não houve envio de trabalho por caminho que contornasse esse limite. MAIN e QA ainda não começaram estes briefs.

As alterações prévias do usuário foram preservadas. A remoção autorizada de `.cursor`, `.gemini` e `.vscode` já estava aplicada no checkout; não se apagaram configurações adicionais. `.codex/hooks.json` contém caminho absoluto local do Impeccable: não foi reparado como efeito colateral; requer revisão se o projeto mudar de ambiente.

## Limitações de segurança e plataforma

- O servidor continua confiando no resultado enviado pelo cliente; validação de consistência não é antifraude nem prova de partida real.
- Rate limit em memória é por instância e reinicia com o processo; não é limite global distribuído.
- Sem banco configurado, `503` é degradação esperada. Não se comprovou escrita/leitura em Neon nem se executou migração remota.
- Capturas em viewport emulado não comprovam teclado do sistema, aparelho físico nem gesto de toque. Informar separadamente os gestos sintetizados quando QA executá-los.
- Chromium local não comprova Safari/WebKit, Firefox, iOS ou Android físicos.
- `PUBLIC_SITE_URL` ainda precisa receber o domínio real no ambiente de produção antes do build público.

## Próximas ações

1. `$impeccable harden`: fechar Promise homepage, races de resultado/settings, contratos e regressões de jogo.
2. `$impeccable adapt`: verificar 360px, tablet intermediário, landscape, zoom e teclado por toque.
3. `$impeccable audit`: executar checks e evidências finais nas cinco dimensões.
4. `$impeccable polish`: conferir alinhamento, tipografia, foco e estados após correções.
