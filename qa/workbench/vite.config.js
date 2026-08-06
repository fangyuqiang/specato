import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      buffer: 'buffer/',
      process: 'process/browser',
      url: 'url/',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'url'],
  },
  build: {
    outDir: '../output/workbench',
    emptyOutDir: true,
    // Scalar 操作查看器按需加载；此上限固定当前例外，后续增长会重新告警。
    chunkSizeWarningLimit: 2300,
  },
});
