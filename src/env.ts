import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Variáveis de ambiente do SvelteKit 3.
 * PUBLIC_SITE_URL é exposta ao cliente (public + static: inline no build);
 * DATABASE_URL é privada e lida em runtime pelo servidor do ranking.
 */
export const variables = defineEnvVars({
	PUBLIC_SITE_URL: {
		public: true,
		static: true,
		description: 'URL pública usada em canonical, sitemap e Open Graph.',
		schema: (value: string | undefined) => {
			const fallback = 'https://typing-game.netlify.app';
			if (!value || value.trim() === '') return fallback;
			return value.trim().replace(/\/+$/, '');
		}
	},
	DATABASE_URL: {
		description: 'Conexão Postgres (Neon) do ranking. Sem ela, a API responde 503.',
		schema: (value: string | undefined) => {
			if (!value || value.trim() === '') return undefined;
			return value.trim();
		}
	}
});
