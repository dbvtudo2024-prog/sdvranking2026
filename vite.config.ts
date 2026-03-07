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
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          manifest: {
            name: 'Sentinelas da Verdade',
            short_name: 'Sentinelas',
            description: 'App oficial para gestão do Clube de Desbravadores Sentinelas da Verdade',
            theme_color: '#0061f2',
            background_color: '#0061f2',
            display: 'standalone',
            orientation: 'portrait',
            start_url: '/',
            icons: [
              {
                src: 'https://drive.google.com/file/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx/view?usp=sharing',
                sizes: '192x192',
                type: 'image/png',
                
              },
              {
                src: 'https://lh3.googleusercontent.com/d/1RSopVlUN5znsyAR7bq1z2kvbOa0kh4ok',
                sizes: '512x512',
                type: 'image/png'
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
