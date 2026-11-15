import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { build } from 'esbuild';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * Compiles the sandbox guest runtime (src/sandbox/runtime) into a single,
 * self-contained IIFE string. The host injects it inline into each
 * container's srcdoc, because a script-only sandboxed iframe has an opaque
 * origin and cannot load module scripts from the app's own server.
 */
function sandboxRuntime(): Plugin {
  const virtualId = 'virtual:phishlens-sandbox-runtime';
  const resolvedId = '\0' + virtualId;
  const entry = path.resolve(__dirname, 'src/sandbox/runtime/index.tsx');
  return {
    name: 'phishlens-sandbox-runtime',
    resolveId(id) {
      return id === virtualId ? resolvedId : null;
    },
    async load(id) {
      if (id !== resolvedId) return null;
      const result = await build({
        entryPoints: [entry],
        bundle: true,
        write: false,
        format: 'iife',
        platform: 'browser',
        target: 'es2020',
        minify: true,
        legalComments: 'none',
        jsx: 'automatic',
        loader: { '.css': 'text' },
        define: { 'process.env.NODE_ENV': '"production"' },
        metafile: true,
      });
      for (const input of Object.keys(result.metafile.inputs)) {
        if (!input.includes('node_modules')) this.addWatchFile(path.resolve(__dirname, input));
      }
      return `export default ${JSON.stringify(result.outputFiles[0].text)};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sandboxRuntime()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
