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

/**
 * Dev-server parity with the Vercel rewrite: serve view.html (neutral meta
 * tags) for the /tools/view route instead of the SPA's index.html.
 */
function viewHtmlRewritePlugin(base: string): Plugin {
  return {
    name: 'view-html-rewrite',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? '';
        const pathOnly = url.split('?')[0];
        // The Replit preview proxy may forward the path with or without the
        // artifact prefix, so match any path ending in /tools/view.
        if (pathOnly.endsWith('/tools/view')) {
          req.url = `${base.replace(/\/$/, '')}/view.html`;
        }
        next();
      });
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
    viewHtmlRewritePlugin(basePath),
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
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        view: path.resolve(import.meta.dirname, 'view.html'),
      },
    },
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
