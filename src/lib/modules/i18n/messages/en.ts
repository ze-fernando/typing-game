import type { Messages } from './pt';

export const EN_MESSAGES: Messages = {
	meta: {
		siteName: 'Typing Game',
		homeTitle: 'Typing Game — Free typing game in English and Portuguese',
		homeDescription:
			'Free browser typing game: train speed and accuracy in English across three levels, then translate Portuguese words into English, with global leaderboards.',
		playTitle: 'Play — Typing Game',
		playDescription:
			'A typing round with countdown, combo, accuracy and per-level leaderboards. Type English words or translate Portuguese into English.',
		ogImageAlt: 'Typing Game — typing game in English and Portuguese',
		appDescription:
			'Typing game with beginner, amateur and advanced levels in English, a Portuguese → English translation mode, a custom mode and leaderboards per mode and level.'
	},
	common: {
		skipLink: 'Skip to content',
		settings: 'Settings',
		close: 'Close',
		home: 'Home',
		playAgain: 'Play again',
		backHome: 'Back to home',
		continue: 'Continue',
		languageGroup: 'Site language',
		languageNames: { 'pt-BR': 'Português (Brasil)', en: 'English' },
		languageCodes: { 'pt-BR': 'BR', en: 'US' },
		speedUnit: 'wpm',
		speedUnitLong: 'words per minute'
	},
	theme: {
		toDark: 'Switch to dark theme',
		toLight: 'Switch to light theme',
		label: 'Theme',
		system: 'System',
		light: 'Light',
		dark: 'Dark'
	},
	modes: {
		names: {
			pt: 'Portuguese',
			en: 'English',
			'en-pt': 'English → Portuguese',
			'pt-en': 'Portuguese → English'
		},
		short: { pt: 'PT', en: 'EN', 'en-pt': 'EN → PT', 'pt-en': 'PT → EN' },
		menuTitle: 'Game mode',
		typingTab: 'Type in English',
		translationTab: 'Translate from Portuguese',
		translationIntro:
			'You see a Portuguese word; type its English translation. Alternative translations count.'
	},
	levels: {
		names: {
			iniciante: 'Beginner',
			amador: 'Amateur',
			expert: 'Advanced',
			personalizado: 'Custom'
		},
		descriptions: {
			pt: {
				iniciante: 'Short Portuguese words with no accents.',
				amador: 'Everyday Portuguese words with á, ç, ã and friends.',
				expert: 'Long Portuguese words with dense accents.'
			},
			en: {
				iniciante: 'Short, common words to warm up.',
				amador: 'Medium words and a faster pace.',
				expert: 'Long words with tricky spelling.'
			},
			'en-pt': {
				iniciante: 'Short translations, no accents: house → casa.',
				amador: 'Translations with accents: apple → maçã.',
				expert: 'Abstract ideas and dense accents: knowledge → conhecimento.'
			},
			'pt-en': {
				iniciante: 'Short translations into English: casa → house.',
				amador: 'Accented Portuguese words into English: maçã → apple.',
				expert: 'Abstract ideas into English: conhecimento → knowledge.'
			}
		},
		recommended: 'start here',
		wordsCount: (count: number) => `${count} ${count === 1 ? 'word' : 'words'}`,
		seconds: (seconds: number) => `${seconds}s`,
		record: (speed: string) => `best ${speed} wpm`,
		customDescription: '1 to 100 words, 5 to 120 s. Free practice, off the leaderboard.',
		customRecord: (words: number, seconds: number, speed: string) =>
			`best ${speed} wpm · ${words} words in ${seconds}s`,
		customSummary: (words: number, seconds: number) => `${words} words in ${seconds}s`
	},
	home: {
		heading: 'Type fast. Then translate.',
		heroWord: { lead: 'he', mark: 'ar', tail: 't' },
		lead: 'Race the clock in English, or switch modes and translate Portuguese words into English. Capital letters never count against you.',
		demoWordLabel: 'Example word: heart',
		keyComboTilde: 'tilde plus a makes ã',
		keyComboAcute: 'acute accent plus a makes á',
		keyOwnCedilla: 'its own key',
		menuHeading: 'Pick a level',
		shortcutsHint: 'Shortcuts: 1 to 4 pick a level. In a round, Space or Enter submit.',
		rankingHeading: 'Leaderboard',
		rankingRefresh: 'Refresh leaderboard',
		faqHeading: 'Questions',
		faq: [
			{
				question: 'Do I need to install anything?',
				answer:
					'No. Typing Game runs in the browser for free, on desktop, tablet or phone, with a physical keyboard or touch.'
			},
			{
				question: 'How do the levels differ?',
				answer:
					'Beginner uses short common words, Amateur medium words at a faster pace, and Advanced long words with tricky spelling. Letter case never matters.'
			},
			{
				question: 'How does the Portuguese → English mode work?',
				answer:
					'You see a Portuguese word and type its English translation. Alternative translations count. A hint shows the first letter and length, but a hinted word scores half its characters on the leaderboard.'
			},
			{
				question: 'How does the leaderboard work?',
				answer:
					'Every mode and level has its own leaderboard keeping the best 1000 results. No account needed: add an optional nickname after the round. Custom rounds stay off the leaderboard; their best is kept in your browser.'
			}
		]
	},
	custom: {
		title: 'Custom mode',
		description:
			'Build your own round. It stays off the leaderboard; your best is kept in this browser.',
		words: 'Words',
		time: 'Time',
		mode: 'Word bank',
		invalid: 'Adjust the values to continue',
		start: 'Play custom'
	},
	settings: {
		title: 'Settings',
		description: 'Sound, effects and appearance. Everything is saved in your browser.',
		music: 'Music',
		musicHelp: 'Ambient track during a round.',
		effects: 'Key sounds',
		effectsHelp: 'Clicks, hits, misses and countdown.',
		reset: 'Restore defaults',
		resetDone: 'Preferences restored.'
	},
	game: {
		heading: (level: string, mode: string) => `Round: ${level} · ${mode}`,
		exit: 'Quit',
		pause: 'Pause',
		resume: 'Resume',
		getReady: 'Fingers ready',
		go: 'Go!',
		paused: 'Paused',
		pausedHelp: 'The clock is frozen.',
		backToField: 'Back to the field',
		inputLabel: 'Type the word',
		inputLabelTranslation: {
			'en-pt': 'Type the Portuguese translation',
			'pt-en': 'Type the English translation'
		},
		placeholder: 'Type here',
		inputHelp: 'Type the word; Space or Enter submit; Esc clears.',
		useDeviceKeyboard: 'Use device keyboard',
		useVirtualKeyboard: 'Use on-screen ABNT2 keyboard',
		statusPaused: 'Round paused. The clock is frozen.',
		statusResumed: 'Round resumed.',
		statusRunning: 'Round running. Type the word.',
		statusFinished: 'Round over. Check your result.',
		timerLabel: (seconds: number) => `Time left: ${seconds} seconds`,
		timeLeft: (seconds: number) => `${seconds} ${seconds === 1 ? 'second' : 'seconds'} left.`,
		wordsProgress: (done: number, total: number) => `${done}/${total} words`,
		wordsProgressLabel: 'Word progress',
		speedLabel: 'Speed',
		accuracyLabel: 'Accuracy',
		comboLabel: 'Combo',
		combo: (count: number) => `combo ×${count}`,
		currentWord: (word: string) => `Current word: ${word}`,
		currentPrompt: {
			'en-pt': (word: string) => `Translate into Portuguese: ${word}`,
			'pt-en': (word: string) => `Translate into English: ${word}`
		},
		translatePlaceholder: {
			'en-pt': 'In Portuguese',
			'pt-en': 'In English'
		},
		accentError: (expected: string, typed: string) =>
			`Wrong accent: use ${expected} instead of ${typed}.`,
		wrongWord: 'Not yet. Fix it with Backspace or clear with Esc.',
		typeHint: 'Type and submit with Space or Enter',
		hintButton: 'Hint',
		hintRule: 'A hint shows the first letter and length. A hinted word scores half.',
		hintReveal: (first: string, length: number) =>
			`Starts with “${first}” and has ${length} ${length === 1 ? 'letter' : 'letters'}.`,
		hintUsed: 'Hint used on this word',
		exitTitle: 'Quit this round?',
		exitDescription: 'Progress in this round will be lost.',
		exitBody: 'The clock stays frozen while you decide.',
		exitConfirm: 'Quit round',
		finished: 'Round over',
		viewResult: 'View result',
		invalidTitle: 'Invalid settings',
		invalidText: 'These round settings are not valid. Go back home and pick a level.'
	},
	keyboard: {
		group: 'On-screen ABNT2 keyboard',
		instructions:
			'Press Tab to enter the keyboard and use the arrows to move. Enter or Space presses the focused key.',
		accentPicker: 'Pick the accented character',
		closeAccents: 'Close accents',
		accentStrip: 'Accents and cedilla',
		accentStripTitle: 'Accents',
		actions: 'Typing actions',
		rows: {
			function: 'function keys',
			numbers: 'numbers',
			'top-letters': 'top letters',
			'home-letters': 'home letters',
			'bottom-letters': 'bottom letters',
			bottom: 'modifiers'
		},
		row: (name: string) => `Row of ${name}`,
		delete: 'Delete',
		space: 'Space',
		enter: 'Enter',
		keyLabels: {
			BracketLeft: 'Acute and grave accent key',
			Quote: 'Tilde and circumflex key',
			Semicolon: 'Ç key'
		}
	},
	results: {
		title: 'Round over',
		description: 'Your numbers for this round.',
		region: 'Round summary',
		record: 'New personal best',
		recordDelta: (delta: string) => `+${delta} wpm over your previous best`,
		firstRecord: 'First best on this level',
		speed: 'Speed',
		accuracy: 'Accuracy',
		words: 'Words',
		activeTime: 'Active time',
		bestCombo: 'Best combo',
		hints: 'Hints used',
		misses: 'Misses',
		hintsNote: (count: number) =>
			`${count} hinted ${count === 1 ? 'word' : 'words'} scored half the characters.`,
		rankingTitle: (level: string, mode: string) => `Join the leaderboard · ${mode} · ${level}`,
		nickname: 'Nickname',
		nicknamePlaceholder: 'Your nickname (optional)',
		nicknameHelp: 'Up to 20 characters: letters, numbers, space, apostrophe or hyphen.',
		save: 'Save to leaderboard',
		saving: 'Saving…',
		saved: 'Result saved.',
		rank: (position: number) => `You placed #${position}.`,
		outsideTop: 'Your result landed outside the top 1000 of this leaderboard.',
		customNotice: 'Custom rounds stay off the leaderboard. Your best is kept in this browser.',
		incompleteNotice: 'Finish at least one word to join the leaderboard.',
		errors: {
			network: 'The leaderboard did not answer. Check your connection and try again.',
			invalid: 'This result did not pass the leaderboard checks.',
			nickname: 'Invalid nickname. Use up to 20 letters, numbers, space, apostrophe or hyphen.',
			rateLimited: 'Too many submissions in a short time. Wait a minute.',
			unavailable: 'The leaderboard is unavailable right now. Your local best was kept.',
			response: 'Unexpected leaderboard response.'
		}
	},
	leaderboard: {
		title: (mode: string, level: string) => `Top 10 · ${mode} · ${level}`,
		modeGroup: 'Leaderboard mode',
		levelGroup: 'Leaderboard level',
		loading: 'Loading leaderboard',
		unavailable: 'Leaderboard unavailable right now.',
		unavailableHelp: 'The game still works. Check your connection and try again.',
		retry: 'Try again',
		empty: 'No results here yet.',
		emptyHelp: 'Play a round and open the board.',
		position: (position: number) => `#${position}`,
		anonymous: 'Anonymous'
	},
	errorPage: {
		notFoundTitle: 'Page not found',
		notFoundText: 'This address does not exist or has moved. Head home to start typing.',
		genericTitle: 'Something went wrong',
		genericText: 'Try reloading the page in a moment.',
		code: (status: number) => `Error ${status}`
	},
	footer: {
		copyright: (year: number) => `© ${year} ZionCodes All rights reserved`,
		tagline: 'Every key counts, every accent too.',
		developer: 'ZionCodes'
	}
};
