import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    // Specifica il nome del tuo repository per far caricare i file correttamente
    base: '/Test/', 
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        // Usa path.resolve per mappare la chiocciola alla root del progetto
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Mantiene la compatibilità con l'ambiente AI Studio
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      // Assicura che la cartella di output sia 'dist' (standard per GitHub Actions)
      outDir: 'dist',
    }
  };
});
