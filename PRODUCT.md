# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Público brasileiro e anglófono, em sessões curtas no navegador, sem instalação e sem cadastro. Quatro frentes confirmadas:

- **Iniciantes em teclado** — pessoas começando a digitar, que precisam treinar coordenação e acentuação em teclado pt-BR/ABNT2.
- **Competitivos casuais** — quem já digita bem e persegue WPM, precisão e posição no ranking.
- **Aprendizes de português** — pessoas praticando acentuação e vocabulário, incluindo não nativas; atendidas pelo modo inglês → português.
- **Quem digita em inglês** — visitantes da versão `/en`, que treinam palavras em inglês e praticam vocabulário pelo modo português → inglês.

O mesmo jogo atende todos por modo e nível, não por personas ou fluxos separados.

## Product Purpose

Jogo de digitação com três níveis fixos — iniciante (10 palavras em 35 s), amador (15 palavras em 30 s) e avançado (30 palavras em 40 s, id interno `expert`) — em quatro modos: português (acentuação progressiva), inglês (dificuldade por tamanho e grafia), inglês → português (no site em português) e português → inglês (no site em inglês), ambos traduzindo a palavra exibida. Há ainda modo personalizado (1 a 100 palavras, 5 a 120 s), teclado ABNT2 interativo, áudio sintetizado e ranking global por modo e nível. Existe para treinar digitação com acentuação de verdade, no vocabulário e no teclado do português.

Sucesso, confirmado: produto público, indexado nas duas línguas, recebendo tráfego orgânico e partidas reais. Ainda não lançado.

## Positioning

O jogo de digitação feito para o português: a acentuação é o eixo de dificuldade e o teclado ABNT2 é o instrumento. A versão em inglês amplia o alcance e usa o modo português → inglês como ponte com o vocabulário do jogo. A referência declarada é o espírito de Termo/Contexto: palavra em primeiro lugar, HUD discreto, sem marketing em volta.

## Operating Context

- Roda no navegador; as únicas rotas de servidor são os endpoints do ranking (SvelteKit como Netlify Functions).
- Português em `/` e `/jogar`; inglês em `/en` e `/en/play`; `<html lang>`, hreflang, canonical, Open Graph e JSON-LD por idioma.
- Ranking em Postgres Neon via `DATABASE_URL` em produção; SQLite local (`node:sqlite`) em desenvolvimento e testes. Sem banco em produção, a API responde `503` e o jogo segue com recordes locais.
- Sessões curtas em desktop, tablet e celular (a partir de 360 px), com toque ou teclado físico, em tema claro, escuro ou do sistema.
- Preferências (tema, música, efeitos) e recordes locais ficam em `localStorage`; não há login.
- Áudio só começa após gesto do usuário.
- Avaliação e uso acontecem direto no site; não há onboarding, tutoria ou conta.

## Capabilities and Constraints

- Três níveis fixos com quantidades e tempos iguais nos três modos; modo personalizado de 1 a 100 palavras e 5 a 120 s.
- Bancos com pelo menos 150 entradas por nível e por modo; no português a progressão é por acentuação.
- Comparação sensível a acentos e insensível a maiúsculas/minúsculas, em todos os modos.
- Os modos de tradução aceitam traduções alternativas; a dica (primeira letra e tamanho) faz a palavra valer metade dos caracteres no WPM, regra exibida antes do uso e contada no resultado.
- Teclado ABNT2 completo no desktop, sem teclas de função entre 640 e 767 px e compacto (letras + faixa de acentos) no celular; em telas de toque o padrão é o teclado nativo do aparelho, com opção de trocar para o virtual.
- A partida termina quando o tempo zera **ou** quando o baralho é concluído.
- Ranking por modo (`pt`, `en`, `en-pt`, `pt-en`) e nível, top 10 na interface, no máximo 1000 resultados guardados por ranking, posição exibida após o envio; anônimo, apelido opcional de até 20 caracteres, sem armazenar IP, com rate limit e checagens de plausibilidade.
- Partidas do modo personalizado nunca entram no ranking global; salvam apenas recorde local.
- Stack e restrições de engenharia: SvelteKit 3 + Svelte 5 + TypeScript estrito + Tailwind CSS 4; sem `try/catch`, sem classes de OOP, sem IDs de DOM como seletor e sem comentários no código; estrutura modular em `src/lib/modules`; UI em pt-BR e inglês via módulo i18n tipado, código em inglês.
- Requisitos não funcionais: WCAG 2.2 AA, responsividade de 360 px a telas grandes, SEO com SSR/prerender, sitemap bilíngue, robots e dados estruturados.
- **Decisão em aberto:** domínio de produção ainda não definido; `PUBLIC_SITE_URL` é configurável e alimenta canonical, hreflang, sitemap, robots e Open Graph.

## Brand Commitments

- Nome: **Typing Game**; assinatura **ZionCodes**, marca pessoal, com link para https://zioncodes.squareweb.app.
- Rodapé obrigatório: `© {ano atual} ZionCodes Todos os direitos reservados` (em inglês: `© {year} ZionCodes All rights reserved`).
- Identidade visual ZionCodes, tratada como compromisso: escuro com canvas preto, superfícies quase pretas, hairlines brancas a 10% e azul #3b82f6/#2563eb como único acento; claro como derivação coerente com o mesmo azul em contraste AA; Saira em títulos e wordmark caixa-alta com parte azul; chips pill caixa-alta. Detalhes em `DESIGN.md`.
- Voz direta e breve nas duas línguas, sem tom infantil e sem promessa de marketing.

## Evidence on Hand

- Bancos de palavras reais em `src/lib/modules/words/` (pt e en) e `src/lib/modules/translation/bank.ts` (en → pt); níveis em `src/lib/game/levels.ts`; pontuação e baralho em `src/lib/game/`.
- Mensagens de interface em `src/lib/modules/i18n/messages/`.
- Documentação de produto, requisitos e decisões em `docs/plan.md`, `docs/intro.md`, `docs/visual.md` e `docs/stack.md`.
- Reviews em `docs/reviews/`, com capturas em `docs/reviews/assets/`.
- Imagens sociais em `static/og.png` e `static/og.svg`.
- **Ausências que não devem ser inventadas:** não há depoimentos, clientes, estudos de caso, números de uso, imprensa, benchmark publicado nem URL de produção.

## Product Principles

1. **O português é o desafio, não o tema.** A progressão de acentuação é o eixo de dificuldade e a razão do produto existir; o inglês e os modos de tradução levam gente até ele.
2. **Digitar primeiro, interface depois.** Palavra atual e tempo lideram; cenário e movimento nunca competem com a leitura.
3. **Desafio honesto.** O ranking premia partidas reais dos níveis fixos, separado por modo; dica custa pontos e o modo personalizado é treino.
4. **Serve do primeiro ao speedrunner.** Mesmo jogo, níveis diferentes; sem conta, instalação ou tutorial obrigatório.
5. **Tátil e acessível por padrão.** Teclado como instrumento, navegação completa por teclado, movimento reduzido e WCAG 2.2 AA.

## Accessibility & Inclusion

Padrão WCAG 2.2 AA: todos os fluxos operáveis por teclado, foco visível, diálogos nativos com foco gerenciado, `prefers-reduced-motion` mantendo a contagem visível e desligando animações longas, feedback que não depende só de cor (mensagem textual de acento errado), alvos de toque de no mínimo 24 × 24 px (44 × 44 px no teclado do celular), contraste AA e ideal AAA para a palavra, e conteúdo marcado com o idioma correto (`pt-BR` ou `en`).
