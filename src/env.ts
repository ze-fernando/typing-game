import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Variáveis de ambiente do SvelteKit 3.
 * Apenas PUBLIC_SITE_URL é exposta ao cliente (public + static: inline no build).
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
	}
});
