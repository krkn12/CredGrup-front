import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  
  // Configuração de resolução
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@api': path.resolve(__dirname, './src/api')
    }
  },

  // Configuração do servidor de desenvolvimento
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://credgrup.click',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      }
    },
    open: true
  },

  // Configurações de build
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendors: ['axios', 'formik', 'yup']
        }
      }
    }
  },

  // Configurações otimizadas para dependências
  optimizeDeps: {
    include: ['yup']  // Correção: movido para optimizeDeps
  },

  // Configurações de CSS
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  },

  // Variáveis de ambiente
  define: {
    'process.env': process.env
  }
});