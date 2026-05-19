import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function buildInfoPlugin() {
  return {
    name: 'build-info',
    buildStart() {
      const buildId = [
        process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || '',
        Date.now().toString(36),
      ].filter(Boolean).join('-');

      writeFileSync(
        resolve(__dirname, 'public/build-info.json'),
        JSON.stringify({
          buildId,
          buildTime: new Date().toISOString(),
          commitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
          deployUrl: process.env.VERCEL_URL || null,
        }, null, 2)
      );
    }
  };
}

export default defineConfig({
  plugins: [react(), buildInfoPlugin()],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __COMMIT_SHA__: JSON.stringify(
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || 'local'
    ),
  },
  server: {
    // In dev, don't register SW (handled in pwa.js)
    headers: {
      'Service-Worker-Allowed': '/',
    }
  }
});
