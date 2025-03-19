import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/site-pagcontas.git/", // Substitua pelo nome do seu repositório
  plugins: [react()],
});
