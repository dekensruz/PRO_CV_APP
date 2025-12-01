import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Définit process.env pour éviter les crashs dans le navigateur
    define: {
      'process.env': {
        // Expose API_KEY si elle est définie dans les variables système (Vercel)
        API_KEY: JSON.stringify(env.API_KEY || process.env.API_KEY),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production')
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});