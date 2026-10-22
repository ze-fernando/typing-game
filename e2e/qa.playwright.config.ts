import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config';

export default defineConfig({
	...baseConfig,
	testDir: '.',
	webServer: undefined,
	use: { ...baseConfig.use, baseURL: 'http://localhost:4273' }
});
