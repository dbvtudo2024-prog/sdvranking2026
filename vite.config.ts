import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          manifest: {
            name: 'Sentinelas da Verdade',
            short_name: 'Sentinelas',
            description: 'Sistema de Ranking e Gestão de Desbravadores',
            theme_color: '#1e293b',
            background_color: '#0f172a',
            display: 'standalone',
            icons: [
              {
                src: 'https://api.iconify.design/fluent-emoji:shield.svg',
                sizes: '192x192',
                type: 'image/svg+xml'
              },
              {
                src: 'https://api.iconify.design/fluent-emoji:shield.svg',
                sizes: '512x512',
                type: 'image/svg+xml'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/lhcobtexredrovjbxaew\.supabase\.co\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'supabase-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semana
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'dicebear-avatars',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
                  }
                }
              }
            ]
          }
        })
      ],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
        'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
