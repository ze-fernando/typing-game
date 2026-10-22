import type { FixedLevelId, GameMode, LevelId } from '#lib/modules/game/types';
import type { Locale } from '../types';

export const PT_MESSAGES = {
	meta: {
		siteName: 'Typing Game',
		homeTitle: 'Typing Game — Jogo de digitação em português com acentos',
		homeDescription:
			'Jogo de digitação grátis em português: treine velocidade e acentuação no teclado ABNT2, em três níveis, com modo inglês → português e ranking online.',
		playTitle: 'Jogar — Typing Game em português',
		playDescription:
			'Partida de digitação em português com contagem regressiva, combo, precisão e ranking por nível. Acentos de verdade contam.',
		ogImageAlt: 'Typing Game — jogo de digitação em português',
		appDescription:
			'Jogo de digitação em português com níveis iniciante, amador e avançado, modo demo inglês → português, modo personalizado e ranking por modo e nível.'
	},
	common: {
		skipLink: 'Pular para o conteúdo',
		settings: 'Configurações',
		close: 'Fechar',
		home: 'Início',
		playAgain: 'Jogar novamente',
		backHome: 'Voltar ao início',
		continue: 'Continuar',
		languageGroup: 'Idioma do site',
		languageNames: { 'pt-BR': 'Português (Brasil)', en: 'English' } satisfies Record<
			Locale,
			string
		>,
		languageCodes: { 'pt-BR': 'BR', en: 'US' } satisfies Record<Locale, string>,
		speedUnit: 'ppm',
		speedUnitLong: 'palavras por minuto'
	},
	theme: {
		toDark: 'Ativar tema escuro',
		toLight: 'Ativar tema claro',
		label: 'Tema',
		system: 'Sistema',
		light: 'Claro',
		dark: 'Escuro'
	},
	modes: {
		names: {
			pt: 'Português',
			en: 'Inglês',
			'en-pt': 'Inglês → português'
		} satisfies Record<GameMode, string>,
		short: { pt: 'PT', en: 'EN', 'en-pt': 'EN → PT' } satisfies Record<GameMode, string>,
		menuTitle: 'Modo de jogo',
		typingTab: 'Digitar em português',
		translationTab: 'Demo: traduzir do inglês',
		translationIntro:
			'Aparece uma palavra em inglês; digite a tradução em português. Traduções alternativas valem, e acento continua contando.'
	},
	levels: {
		names: {
			iniciante: 'Iniciante',
			amador: 'Amador',
			expert: 'Avançado',
			personalizado: 'Personalizado'
		} satisfies Record<LevelId, string>,
		descriptions: {
			pt: {
				iniciante: 'Palavras curtas e sem acento para pegar o ritmo.',
				amador: 'Palavras do dia a dia com á, ç, ã e companhia.',
				expert: 'Palavras longas, acentuação densa e pouco tempo.'
			},
			en: {
				iniciante: 'Palavras curtas em inglês para aquecer.',
				amador: 'Palavras médias em inglês, mais velocidade.',
				expert: 'Palavras longas de grafia traiçoeira.'
			},
			'en-pt': {
				iniciante: 'Traduções curtas e sem acento: house → casa.',
				amador: 'Traduções com acento: apple → maçã.',
				expert: 'Ideias abstratas e acentos densos: knowledge → conhecimento.'
			}
		} satisfies Record<GameMode, Record<FixedLevelId, string>>,
		recommended: 'comece aqui',
		wordsCount: (count: number) => `${count} ${count === 1 ? 'palavra' : 'palavras'}`,
		seconds: (seconds: number) => `${seconds}s`,
		record: (speed: string) => `recorde ${speed} ppm`,
		customDescription: 'De 1 a 100 palavras, de 5 a 120 s. Treino livre, fora do ranking.',
		customRecord: (words: number, seconds: number, speed: string) =>
			`recorde ${speed} ppm · ${words} palavras em ${seconds}s`,
		customSummary: (words: number, seconds: number) => `${words} palavras em ${seconds}s`
	},
	home: {
		heading: 'Digite em português. Com acento.',
		lead: 'No teclado ABNT2, acento é tecla: ~ depois a vira ã, ´ depois a vira á. Maiúsculas não contam, acentos sim.',
		demoWordLabel: 'Exemplo de palavra: coração',
		keyComboTilde: 'til mais a forma ã',
		keyComboAcute: 'acento agudo mais a forma á',
		keyOwnCedilla: 'tecla própria',
		menuHeading: 'Escolha um nível',
		shortcutsHint: 'Atalhos: 1 a 4 escolhem o nível. Na partida, Espaço ou Enter confirmam.',
		rankingHeading: 'Ranking',
		rankingRefresh: 'Atualizar ranking',
		faqHeading: 'Dúvidas frequentes',
		faq: [
			{
				question: 'Preciso instalar alguma coisa para jogar?',
				answer:
					'Não. O Typing Game roda direto no navegador, de graça, no computador, tablet ou celular, com teclado físico ou toque.'
			},
			{
				question: 'Os acentos contam?',
				answer:
					'Sim. O iniciante aquece sem acentos; o amador cobra á, ç, ã e companhia; o avançado traz palavras longas e acentuação densa. Maiúsculas e minúsculas não fazem diferença.'
			},
			{
				question: 'Como funciona o modo inglês → português?',
				answer:
					'Aparece uma palavra em inglês e você digita a tradução em português. Traduções alternativas valem. A dica mostra a primeira letra e o tamanho da palavra, mas a palavra com dica vale metade dos caracteres no ranking.'
			},
			{
				question: 'Como funciona o ranking?',
				answer:
					'Cada modo e nível tem seu próprio ranking, com os 1000 melhores resultados. Você joga sem cadastro e informa um apelido opcional ao final. O modo personalizado fica fora do ranking; o recorde dele fica no navegador.'
			}
		]
	},
	custom: {
		title: 'Modo personalizado',
		description:
			'Monte a partida do seu jeito. Fica fora do ranking; o recorde fica no seu navegador.',
		words: 'Palavras',
		time: 'Tempo',
		mode: 'Banco de palavras',
		invalid: 'Ajuste os valores para continuar',
		start: 'Jogar personalizado'
	},
	settings: {
		title: 'Configurações',
		description: 'Som, efeitos e aparência. Tudo fica salvo no seu navegador.',
		music: 'Música',
		musicHelp: 'Trilha ambiente durante a partida.',
		effects: 'Efeitos de teclas',
		effectsHelp: 'Cliques, acertos, erros e contagem.',
		reset: 'Restaurar padrões',
		resetDone: 'Preferências restauradas.'
	},
	game: {
		heading: (level: string, mode: string) => `Partida: ${level} · ${mode}`,
		exit: 'Sair',
		pause: 'Pausar',
		resume: 'Continuar',
		getReady: 'Prepare os dedos',
		go: 'Vai!',
		paused: 'Pausado',
		pausedHelp: 'O tempo está congelado.',
		backToField: 'Voltar ao campo',
		inputLabel: 'Digite a palavra',
		inputLabelTranslation: 'Digite a tradução em português',
		placeholder: 'Digite aqui',
		inputHelp: 'Digite a palavra; Espaço ou Enter confirmam; Esc limpa.',
		useDeviceKeyboard: 'Usar teclado do dispositivo',
		useVirtualKeyboard: 'Usar teclado virtual ABNT2',
		statusPaused: 'Partida pausada. O tempo está congelado.',
		statusResumed: 'Partida retomada.',
		statusRunning: 'Partida em andamento. Digite a palavra.',
		statusFinished: 'Partida finalizada. Confira seu resultado.',
		timerLabel: (seconds: number) => `Tempo restante: ${seconds} segundos`,
		timeLeft: (seconds: number) => `Faltam ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}.`,
		wordsProgress: (done: number, total: number) => `${done}/${total} palavras`,
		wordsProgressLabel: 'Progresso de palavras',
		speedLabel: 'Velocidade',
		accuracyLabel: 'Precisão',
		comboLabel: 'Combo',
		combo: (count: number) => `combo ×${count}`,
		currentWord: (word: string) => `Palavra atual: ${word}`,
		currentPrompt: (word: string) => `Traduza para o português: ${word}`,
		translatePlaceholder: 'Em português',
		accentError: (expected: string, typed: string) =>
			`Acento errado: use ${expected} em vez de ${typed}.`,
		wrongWord: 'Ainda não. Corrija com Backspace ou limpe com Esc.',
		typeHint: 'Digite e confirme com Espaço ou Enter',
		hintButton: 'Dica',
		hintRule: 'A dica mostra a 1ª letra e o tamanho. Palavra com dica vale metade no ranking.',
		hintReveal: (first: string, length: number) =>
			`Começa com “${first}” e tem ${length} ${length === 1 ? 'letra' : 'letras'}.`,
		hintUsed: 'Dica usada nesta palavra',
		exitTitle: 'Sair da partida?',
		exitDescription: 'O progresso desta partida será perdido.',
		exitBody: 'O tempo fica congelado enquanto você decide.',
		exitConfirm: 'Sair da partida',
		finished: 'Partida finalizada',
		viewResult: 'Ver resultado',
		invalidTitle: 'Configuração inválida',
		invalidText: 'Os parâmetros da partida não são válidos. Volte ao início e escolha um nível.'
	},
	keyboard: {
		group: 'Teclado virtual ABNT2',
		instructions:
			'Use Tab para entrar no teclado e as setas para navegar. Enter ou Espaço aciona a tecla em foco.',
		accentPicker: 'Escolha o caractere acentuado',
		closeAccents: 'Fechar acentos',
		accentStrip: 'Acentos e cedilha',
		accentStripTitle: 'Acentos',
		actions: 'Ações de digitação',
		rows: {
			function: 'funções',
			numbers: 'números',
			'top-letters': 'letras superiores',
			'home-letters': 'letras centrais',
			'bottom-letters': 'letras inferiores',
			bottom: 'modificadores'
		} as Record<string, string>,
		row: (name: string) => `Linha de ${name}`,
		delete: 'Apagar',
		space: 'Espaço',
		enter: 'Enter',
		keyLabels: {
			BracketLeft: 'Tecla de acento agudo e crase',
			Quote: 'Tecla de til e circunflexo',
			Semicolon: 'Tecla Ç'
		} as Record<string, string>
	},
	results: {
		title: 'Fim de partida',
		description: 'Seus números desta rodada.',
		region: 'Resumo da partida',
		record: 'Novo recorde pessoal',
		recordDelta: (delta: string) => `+${delta} ppm sobre o anterior`,
		firstRecord: 'Primeiro recorde neste nível',
		speed: 'Velocidade',
		accuracy: 'Precisão',
		words: 'Palavras',
		activeTime: 'Tempo ativo',
		bestCombo: 'Maior combo',
		hints: 'Dicas usadas',
		misses: 'Erros',
		hintsNote: (count: number) =>
			`${count} ${count === 1 ? 'palavra com dica valeu' : 'palavras com dica valeram'} metade dos caracteres.`,
		rankingTitle: (level: string, mode: string) => `Entrar no ranking · ${mode} · ${level}`,
		nickname: 'Apelido',
		nicknamePlaceholder: 'Seu apelido (opcional)',
		nicknameHelp: 'Até 20 caracteres: letras, números, espaço, apóstrofo ou hífen.',
		save: 'Salvar no ranking',
		saving: 'Salvando…',
		saved: 'Resultado salvo.',
		rank: (position: number) => `Você ficou em ${position}º lugar.`,
		outsideTop: 'Seu resultado ficou fora dos 1000 melhores deste ranking.',
		customNotice: 'O modo personalizado fica fora do ranking. O recorde fica no navegador.',
		incompleteNotice: 'Conclua pelo menos uma palavra para entrar no ranking.',
		errors: {
			network: 'O ranking não respondeu. Verifique a conexão e tente de novo.',
			invalid: 'O resultado não passou na validação do ranking.',
			nickname: 'Apelido inválido. Use até 20 letras, números, espaço, apóstrofo ou hífen.',
			rateLimited: 'Muitos envios em pouco tempo. Aguarde um minuto.',
			unavailable: 'Ranking indisponível agora. Seu recorde local foi mantido.',
			response: 'Resposta inesperada do ranking.'
		}
	},
	leaderboard: {
		title: (mode: string, level: string) => `Top 10 · ${mode} · ${level}`,
		modeGroup: 'Modo do ranking',
		levelGroup: 'Nível do ranking',
		loading: 'Carregando ranking',
		unavailable: 'Ranking indisponível agora.',
		unavailableHelp: 'O jogo segue normal. Verifique a conexão e tente de novo.',
		retry: 'Tentar novamente',
		empty: 'Ainda não há resultados aqui.',
		emptyHelp: 'Jogue uma partida e abra o placar.',
		position: (position: number) => `${position}º`,
		anonymous: 'Anônimo'
	},
	errorPage: {
		notFoundTitle: 'Página não encontrada',
		notFoundText: 'O endereço não existe ou foi movido. Volte ao início para começar a digitar.',
		genericTitle: 'Algo deu errado',
		genericText: 'Tente recarregar a página em alguns instantes.',
		code: (status: number) => `Erro ${status}`
	},
	footer: {
		copyright: (year: number) => `© ${year} ZionCodes Todos os direitos reservados`,
		tagline: 'Português no teclado, acento por acento.',
		developer: 'ZionCodes'
	}
};

export type Messages = typeof PT_MESSAGES;
