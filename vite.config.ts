/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:*",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function offlineCspPlugin(): Plugin {
  let isBuild = false;
  return {
    name: 'passweave-offline-csp',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    transformIndexHtml(html) {
      const policy = isBuild ? PROD_CSP : DEV_CSP;
      return html.replace('__PASSWEAVE_CSP__', policy);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), offlineCspPlugin()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
