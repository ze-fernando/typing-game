import { defineConfig } from '@playwright/test';

export const E2E_SITE_URL = 'https://typing-game.netlify.app';

export default defineConfig({
	webServer: {
		command:
			"node -e \"require('node:fs').rmSync('.data/e2e',{recursive:true,force:true})\" && npm run build && npm run preview",
		port: 4173,
		reuseExistingServer: false,
		timeout: 180_000,
		env: {
			PUBLIC_SITE_URL: E2E_SITE_URL,
			DATABASE_URL: 'sqlite:.data/e2e/leaderboard.sqlite'
		}
	},
	testMatch: '**/*.e2e.{ts,js}',
	timeout: 60_000,
	workers: process.env.CI ? 2 : undefined,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry'
	}
});
