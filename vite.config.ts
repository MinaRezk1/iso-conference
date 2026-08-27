import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: '/iso-conference/', // مهم: لازم يتساوي مع اسم الريبو بتاعك على GitHub بالظبط
    define: {
      // يتولد تلقائياً وقت كل بناء (build) - بيضمن إن أي متصفح فتح الموقع قبل
      // كده يكتشف فيه نسخة جديدة ويجيبها، من غير ما حد يحتاج يفتكر يبدّل رقم
      // النسخة يدوياً في كل مرة.
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['reflect-logo.png', 'reflect-logo-trans.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'مؤتمر ISO 2026',
          short_name: 'ISO',
          description: 'الموقع الرسمي لمؤتمر ISO 2026 لتسجيل البرنامج، الترانيم، الشروحات، سكور الفرق، وتوزيع الغرف.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          display_override: ['standalone', 'minimal-ui'],
          theme_color: '#0f0f15',
          background_color: '#0f0f15',
          icons: [
            {
              src: '/reflect-logo.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/reflect-logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/reflect-logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
