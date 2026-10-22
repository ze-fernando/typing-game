import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_SITE_URL: {
		public: true,
		static: true,
		description: 'URL pública usada em canonical, hreflang, sitemap e Open Graph.',
		schema: (value: string | undefined) => {
			if (!value || value.trim() === '') return '';
			const candidate = value.trim();
			if (!URL.canParse(candidate))
				throw new Error('PUBLIC_SITE_URL precisa ser uma URL HTTP(S) válida.');
			const url = new URL(candidate);
			if (
				!['http:', 'https:'].includes(url.protocol) ||
				url.username ||
				url.password ||
				url.search ||
				url.hash ||
				url.pathname !== '/'
			) {
				throw new Error(
					'PUBLIC_SITE_URL precisa conter apenas a origem HTTP(S), sem credenciais ou caminho.'
				);
			}
			return url.origin;
		}
	},
	DATABASE_URL: {
		description:
			'Banco do ranking: postgresql://… usa Neon; sqlite:caminho usa SQLite local. Vazio em dev usa .data/leaderboard.sqlite; vazio em produção responde 503.',
		schema: (value: string | undefined) => {
			if (!value || value.trim() === '') return undefined;
			return value.trim();
		}
	}
});
