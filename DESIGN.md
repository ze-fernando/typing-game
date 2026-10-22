---
name: Typing Game
description: Jogo de digitação feito para o português, com identidade ZionCodes; a palavra é o palco e o acento é o sinal azul.
colors:
  canvas: '#000000'
  surface: '#0a0a0a'
  surface-raised: '#111113'
  surface-track: '#1c1c1f'
  elevated: '#03080e'
  ink: '#ffffff'
  ink-muted: '#a1a1aa'
  ink-soft: '#8d8d96'
  hairline: 'rgb(255 255 255 / 0.1)'
  hairline-strong: 'rgb(255 255 255 / 0.2)'
  control-border: '#71717a'
  primary: '#3b82f6'
  primary-solid: '#2563eb'
  primary-strong: '#1d4ed8'
  primary-soft: 'rgb(59 130 246 / 0.14)'
  on-primary: '#ffffff'
  success: '#34d399'
  danger: '#fb7185'
  warning: '#fbbf24'
  light-canvas: '#fafafa'
  light-surface: '#ffffff'
  light-surface-raised: '#f4f4f5'
  light-surface-track: '#e4e4e7'
  light-elevated: '#f4f6fa'
  light-ink: '#09090b'
  light-ink-muted: '#52525b'
  light-ink-soft: '#63636b'
  light-hairline: 'rgb(9 9 11 / 0.1)'
  light-hairline-strong: 'rgb(9 9 11 / 0.2)'
  light-control-border: '#84848d'
  light-primary: '#1d4ed8'
  light-primary-soft: 'rgb(37 99 235 / 0.1)'
  light-success: '#047857'
  light-danger: '#be123c'
  light-warning: '#b45309'
typography:
  display:
    fontFamily: 'Saira Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(2rem, 7vw, 3.25rem)'
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: '0.025em'
  headline:
    fontFamily: 'Saira Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: '0.025em'
  title:
    fontFamily: 'Saira Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: '0.025em'
  body:
    fontFamily: 'Saira Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.625
  body-sm:
    fontFamily: 'Saira Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: 'Saira Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.6875rem'
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: '0.15em'
  wordmark:
    fontFamily: 'Saira Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 800
    letterSpacing: '0.08em'
  word:
    fontFamily: 'JetBrains Mono Variable, ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: 'clamp(2.25rem, 9vw, 3.5rem)'
    fontWeight: 700
    lineHeight: 1
    letterSpacing: '0.025em'
  timer:
    fontFamily: 'JetBrains Mono Variable, ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: '3rem'
    fontWeight: 700
    lineHeight: 1
    fontFeature: 'tnum'
  numeric:
    fontFamily: 'JetBrains Mono Variable, ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: '0.875rem'
    fontWeight: 400
    fontFeature: 'tnum'
rounded:
  key: '6px'
  control: '8px'
  panel-sm: '12px'
  panel: '16px'
  pill: '9999px'
spacing:
  hairline-gap: '1px'
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  container: '48rem'
components:
  button-primary:
    backgroundColor: '{colors.primary-solid}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.control}'
    padding: '0 20px'
    height: '44px'
  button-primary-hover:
    backgroundColor: '{colors.primary-strong}'
    textColor: '{colors.on-primary}'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '0 20px'
    height: '44px'
  button-secondary-hover:
    textColor: '{colors.primary}'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.ink-muted}'
    rounded: '{rounded.control}'
    padding: '0 20px'
    height: '44px'
  button-ghost-hover:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.ink}'
  icon-button:
    backgroundColor: 'transparent'
    textColor: '{colors.ink-muted}'
    rounded: '{rounded.control}'
    size: '44px'
  chip:
    backgroundColor: 'transparent'
    textColor: '{colors.ink-muted}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '3px 10px'
  chip-primary:
    backgroundColor: '{colors.primary-soft}'
    textColor: '{colors.primary}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '3px 10px'
  segmented-option-active:
    backgroundColor: '{colors.primary-solid}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.pill}'
    height: '40px'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '0 12px'
    height: '44px'
  keycap:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.key}'
    height: '44px'
  keycap-pressed:
    backgroundColor: '{colors.primary-soft}'
    textColor: '{colors.primary}'
  panel:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.panel}'
    padding: '24px'
  keyboard-deck:
    backgroundColor: '{colors.elevated}'
    rounded: '{rounded.panel}'
    padding: '20px'
---

# Design System: Typing Game

## Overview

**Creative North Star: "O Palco da Palavra"**

O Typing Game veste a identidade ZionCodes (https://zioncodes.squareweb.app): um canvas preto absoluto, superfícies quase pretas separadas por hairlines brancas a 10% e um único azul que carrega todo o significado. A palavra da partida é o palco; tudo ao redor (HUD, teclado, menus) recua em cinza para que o olho vá direto às letras. O azul não decora: marca o que ainda é desafio (as letras acentuadas pendentes), onde o cursor está e o que está ativo.

A densidade é baixa e o ritmo é de painel único: uma coluna de até 48rem, painéis arredondados com hairline, listas com divisórias em vez de grades de cards. O tema claro é uma derivação coerente: off-white #fafafa, superfícies brancas, tinta #09090b e o mesmo azul escurecido para passar AA como texto. O movimento é curto e funcional (tremor no erro, pop no combo, contagem, subida de toasts) e some por completo com `prefers-reduced-motion`, mantendo a contagem visível.

**Key Characteristics:**

- Canvas preto com um único brilho radial azul no topo da página.
- Azul como único acento; verde, rosa e âmbar existem só como estado (acerto, erro, alerta).
- Saira bold com tracking largo para UI e títulos; JetBrains Mono só para palavra, tempo e números.
- Profundidade por camadas tonais e hairlines; sombra apenas em elementos flutuantes.
- Teclas planas, pressionadas por borda azul, fundo azul suave e 1px de descida.

## Colors

Monocromático em preto e cinza-zinco, com um azul elétrico como única voz e três cores de estado reservadas ao feedback.

### Primary

- **Azul ZionCodes** (primary): texto azul, acentos, caret, hover de bordas, letras acentuadas pendentes e o anel de foco no escuro. Sobre preto passa AA como texto; nunca serve de fundo para texto branco (só 3,7:1).
- **Azul Sólido** (primary-solid): fundo de botão primário, opção ativa do controle segmentado, toggle ligado, seleção de texto e skip link. Com branco dá 5,2:1. É o mesmo nos dois temas.
- **Azul Profundo** (primary-strong): hover do botão sólido. No tema claro também é o `--primary` de texto (light-primary), para passar AA sobre o fundo azul suave.
- **Véu Azul** (primary-soft / light-primary-soft): fundo de tecla pressionada, chip de combo, linha do jogador no ranking e caixa de recorde no resultado.

### Neutral

- **Canvas Noturno** (canvas) / **Off-white** (light-canvas): fundo da página, sob o brilho radial.
- **Superfície Quase Preta** (surface) / **Branco** (light-surface): painéis, diálogos, toasts, teclas, campos.
- **Superfície Elevada** (surface-raised): hover de linhas e botão ghost, trilho do toggle, esqueleto de carregamento.
- **Trilho** (surface-track): trilho da barra de tempo.
- **Deck Azulado** (elevated / light-elevated): fundo do deck do teclado virtual, quase preto com um fio de azul.
- **Tinta** (ink / light-ink): texto principal e a palavra.
- **Tinta Calma** (ink-muted / light-ink-muted): texto secundário, labels, chips neutros, letras pendentes sem acento.
- **Tinta Suave** (ink-soft / light-ink-soft): placeholders, dicas e ícones de seta.
- **Hairline** (hairline / light-hairline): toda borda de painel, divisória e chip neutro. **Hairline Forte** (hairline-strong): bordas de botão secundário, toast informativo, `kbd`, deck flutuante.
- **Borda de Controle** (control-border / light-control-border): borda de campos e do trilho do toggle, mais escura para passar 3:1 de contraste de componente.

### Estados

- **Acerto** (success / light-success): letras corretas e mensagens de sucesso.
- **Erro** (danger / light-danger): letra errada (sempre com sublinhado, nunca só cor), tempo crítico, mensagens de erro, botão de perigo.
- **Alerta** (warning / light-warning): tempo baixo e o chip de dica do modo demo.

### Named Rules

**The One Blue Rule.** O azul é o único acento. Nenhuma outra matiz aparece fora de estado de feedback; nada de gradientes coloridos, roxos ou segundo acento.

**The Solid-Is-Darker Rule.** Texto branco só pousa em #2563eb ou mais escuro. O #3b82f6 é para texto sobre preto, foco e acentos.

**The Single Glow Rule.** Há um único brilho radial azul (60rem por 28rem, centrado 6rem acima do topo) atrás de cada página, mais um halo difuso sob o deck do teclado. Nenhum outro brilho.

## Typography

**Display Font:** Saira Variable (self-hosted, com ui-sans-serif e system-ui de fallback)
**Body Font:** Saira Variable
**Label/Mono Font:** JetBrains Mono Variable (self-hosted, com ui-monospace de fallback)

**Character:** Saira é técnica e larga, e em bold com tracking aberto dá à UI a voz da ZionCodes; JetBrains Mono separa o que se digita e o que se mede do resto da interface.

### Hierarchy

- **Display** (700, clamp(2rem, 7vw, 3.25rem), 1.05, tracking-wide): título da home, com `text-wrap: balance` e no máximo 36rem.
- **Headline** (700, 1.25rem, tracking-wide): títulos de seção e de estados do jogo.
- **Title** (700, 1.125rem, tracking-wide): títulos de diálogo e nomes de nível no menu.
- **Body** (400, 1rem, 1.625): parágrafo de abertura, até 60ch. **Body-sm** (0.875rem) é o texto corrido padrão de painéis e FAQ, até 65ch.
- **Label** (600, 0.6875rem, tracking 0.15em, caixa-alta): chips, rótulos de estatística no resultado, título do ranking, "prepare-se" acima da contagem.
- **Wordmark** (800, 1rem a 1.125rem, tracking 0.08em, caixa-alta): TYPING em tinta, GAME em azul.
- **Word** (Mono 700, clamp(2.25rem, 9vw, 3.5rem), 1): a palavra da partida. O tamanho vem de `.word-fit`: o menor entre o teto do papel e a largura do contêiner dividida pelo número de letras, com piso de 1.125rem; abaixo do piso a palavra quebra em mais linhas em vez de cobrir o HUD. Na home, a palavra-exemplo sobe para clamp(2.75rem, 13vw, 5rem) com tracking justo.
- **Timer** (Mono 700, 2.25rem a 3rem, números tabulares): tempo restante; a contagem inicial usa 4.5rem em azul.
- **Numeric** (Mono, tabular): estatísticas, meta dos níveis, pontuações do ranking.

### Named Rules

**The Mono-Is-Measure Rule.** JetBrains Mono aparece só na palavra, no tempo, em números e nas teclas. Títulos, botões e texto corrido são sempre Saira.

**The Tabular Rule.** Todo número que muda durante a partida usa algarismos tabulares, para o HUD não tremer.

## Layout

Coluna única centrada de até 48rem (max-w-3xl) com gutter de 16px no celular e 24px a partir de 640px. A home empilha título, palavra-exemplo com combinações de tecla ABNT2, menu de níveis em lista e FAQ em acordeão, sempre na mesma coluna. A partida é uma pilha vertical de cabeçalho fino, painel de jogo (HUD, palavra, campo) e deck do teclado.

O ritmo é em passos de 4px: 4, 8, 12, 16, 24px dentro de componentes; 32 a 64px entre seções da home. A tela de jogo comprime padding e gaps em alturas menores que 800px e 560px, e em paisagem baixa (variante `landscape-short`, até 480px de altura) passa a duas colunas: o painel da partida fica com a coluna mais larga, o tempo cai para 1.875rem, a palavra tem teto de 2.5rem e a dica de digitação some, para que tempo, HUD, palavra e campo nunca se sobreponham. O teclado vira compacto (letras e faixa de acentos) no celular e perde a fileira de funções entre 640 e 767px.

## Elevation & Depth

A profundidade vem de camadas tonais (canvas, superfície, superfície elevada) e de hairlines; a maior parte da interface é plana. Sombra existe só para o que flutua ou se destaca do fluxo: o painel de jogo, toasts, o deck flutuante de acentos e o botão primário, que carrega um halo azul difuso. Diálogos se separam por backdrop escurecido com desfoque de 6px.

### Shadow Vocabulary

- **Sombra de Painel** (`--shadow-card`, `0 24px 60px -30px rgb(0 0 0 / 0.9)` no escuro, `0 24px 60px -32px rgb(9 9 11 / 0.35)` no claro): painel de jogo, toasts, faixa flutuante de acentos.
- **Halo do Primário** (`0 8px 24px -12px rgb(37 99 235 / 0.8)`): só no botão primário sólido.

### Named Rules

**The Hairline-First Rule.** Separação se faz com hairline a 10% e mudança tonal. Sombra só onde o elemento de fato flutua.

## Shapes

Cantos suaves e consistentes por escala de importância: teclas e `kbd` a 6px, botões, campos e botões de ícone a 8px, toggles e toasts a 12px, painéis e decks a 16px. Pill total (9999px) para chips, controle segmentado e trilho de toggle. Toda borda é 1px; grades de estatística usam o truque de gap de 1px sobre fundo hairline para desenhar divisórias internas.

## Components

### Buttons

Tátil e contido: semibold, tracking-wide, pequenas compressões ao toque.

- **Shape:** cantos suaves (8px), altura mínima 40, 44 ou 48px por tamanho.
- **Primary:** fundo Azul Sólido, texto branco, halo azul; hover vai para Azul Profundo.
- **Secondary:** transparente com Hairline Forte; hover troca borda e texto para azul.
- **Ghost:** texto Tinta Calma; hover ganha Superfície Elevada e Tinta.
- **Danger:** contorno e texto Erro; hover ganha fundo de erro suave.
- **Hover / Focus / Active:** transição de 150ms; `:active` escala para 0.98; foco é o contorno global de 2px com offset de 3px na cor de foco; desabilitado a 50% de opacidade.
- **Icon Button:** 44 por 44px, hairline, ícone em Tinta Calma; hover pinta borda e ícone de azul.

### Chips

- **Style:** pill, hairline, label caixa-alta 0.6875rem com tracking 0.15em, Tinta Calma.
- **Tons:** primary (borda azul a 45%, fundo Véu Azul, texto azul) para combo e "recomendado"; success, warning e danger seguem o mesmo molde com sua cor. O chip de dica do demo dispensa caixa-alta e tracking.

### Segmented Control

Pill com hairline e 4px de respiro interno; opções em pill, semibold, Tinta Calma; a ativa ganha Azul Sólido com texto branco.

### Cards / Containers

- **Corner Style:** 16px (painéis), 12px (caixas internas).
- **Background:** Superfície; o deck do teclado usa Deck Azulado.
- **Shadow Strategy:** plano, exceto painel de jogo e flutuantes (ver Elevation & Depth).
- **Border:** hairline 1px sempre.
- **Internal Padding:** 16px no celular, 20 a 24px a partir de 640px.
- Listas (menu de níveis, FAQ) vivem dentro de um único painel com divisórias hairline entre linhas; hover da linha usa Superfície Elevada.

### Inputs / Fields

- **Style:** 44 a 48px de altura, 8px de canto, Borda de Controle, fundo de superfície (ou canvas no campo da partida, centralizado em Mono 1.125rem).
- **Focus:** borda azul mais anel azul a 30% de 2px.
- **Disabled:** 60% de opacidade.

### Toggle

Linha com label e descrição dentro de caixa hairline de 12px; trilho pill 44 por 24px com Borda de Controle, ligado em Azul Sólido com bolinha branca.

### Dialog

`<dialog>` nativo, larguras de 28, 36 ou 48rem, entra com pop. Cabeçalho e rodapé separados por hairline, título em Title, fechar em botão de 40px que fica azul no hover. Backdrop a 75% de preto (55% no claro) com desfoque de 6px.

### Toasts

Canto inferior direito, até 24rem, superfície com borda tonal (Hairline Forte, ou Acerto e Erro a 50%), Sombra de Painel, entram com rise.

### Navigation

Cabeçalho fino com hairline inferior: wordmark à esquerda, seletor BR/US, tema e configurações como botões de ícone à direita. Rodapé com hairline superior, texto Tinta Calma e o wordmark ZionCodes que fica azul no hover.

### Palavra da Partida (assinatura)

A palavra em Mono bold, centralizada. Letras digitadas corretas em Acerto; erradas em Erro com sublinhado de 2px; pendentes em Tinta Calma, exceto as acentuadas pendentes, que ficam em azul: o acento é o desafio. Caret azul de 3px sob a posição atual. A letra recém-digitada desce 3px em 160ms. Erro de palavra treme a palavra (280ms); combo aparece como chip azul que dá pop (260ms).

### Teclado Virtual (assinatura)

Teclas planas em Mono sobre o Deck Azulado, borda hairline de 1px e 6px de canto. Hover pinta a borda de azul. Pressionada: borda azul, fundo Véu Azul, texto azul e 1px de descida, em 80ms. Alvos de 44px no celular.

## Do's and Don'ts

### Do:

- **Do** usar Azul Sólido (#2563eb) sob qualquer texto branco e reservar #3b82f6 para texto sobre preto, foco e acentos.
- **Do** separar superfícies com hairline a 10% e passo tonal antes de recorrer a sombra.
- **Do** marcar em azul só o que é desafio ou estado ativo: letras acentuadas pendentes, caret, combo, opção selecionada.
- **Do** escrever títulos e wordmark em Saira bold com tracking aberto, e números em JetBrains Mono tabular.
- **Do** desligar shake, pop, rise, letter e countdown com `prefers-reduced-motion`, mantendo o número da contagem visível e as teclas sem descida.
- **Do** acompanhar todo erro sinalizado em cor com um segundo sinal (sublinhado ou mensagem textual).

### Don't:

- **Don't** colocar texto branco sobre #3b82f6 (3,7:1, reprova AA).
- **Don't** introduzir segundo acento, gradiente colorido ou brilho além do radial do topo e do halo do teclado.
- **Don't** usar Mono em títulos, botões ou texto corrido.
- **Don't** dar volume às teclas com sombra dura ou relevo; a tecla é plana e a pressão é borda, véu azul e 1px.
- **Don't** trocar a lista de níveis por grade de cards iguais.
