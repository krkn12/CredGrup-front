import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Já está correto pra Vercel
  build: {
    outDir: 'dist', // Padrão, mas explicitando pra garantir
    sourcemap: false, // Desativa sourcemaps em produção pra reduzir tamanho
  },
});