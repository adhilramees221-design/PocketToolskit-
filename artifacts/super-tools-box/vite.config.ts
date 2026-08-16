import path from 'path';
import { readFileSync } from 'fs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

/**
 * Reads src/data/tools.ts and counts the number of tool entries by matching
 * leading `id:` property lines inside the toolsData array.  The result is
 * injected into index.html in place of the %TOOL_COUNT% placeholder so the
 * meta-tag copy is always in sync with the real registry.
 */
function toolCountPlugin(): Plugin {
  return {
    name: 'tool-count',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const toolsFile = readFileSync(
          path.resolve(import.meta.dirname, 'src/data/tools.ts'),
          'utf-8',
        );
        // Count tool entries by matching `    id:` lines (4-space indent inside array objects).
        // The interface definition uses 2-space indent, so it won't be matched.
        const count = (toolsFile.match(/^\s{4}id:/gm) ?? []).length;
        return html.replace(/%TOOL_COUNT%/g, String(count));
      },
    },
  };
}

// PORT — required on Replit, not needed for Vercel builds
const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

// BASE_PATH — Replit uses a sub-path; Vercel serves from root "/"
const basePath = process.env.BASE_PATH ?? '/';

const isReplit = Boolean(process.env.REPL_ID);

export default defineConfig(async () => ({
  base: basePath,
  plugins: [
    toolCountPlugin(),
    react(),
    tailwindcss(),
    ...(isReplit
      ? [
          (await import('@replit/vite-plugin-runtime-error-modal')).default(),
          ...(process.env.NODE_ENV !== 'production'
            ? [
                await import('@replit/vite-plugin-cartographer').then((m) =>
                  m.cartographer({
                    root: path.resolve(import.meta.dirname, '..'),
                  }),
                ),
                await import('@replit/vite-plugin-dev-banner').then((m) =>
                  m.devBanner(),
                ),
              ]
            : []),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
}));
