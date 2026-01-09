import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: false, // Mantemos desligado para usar o nosso manual
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'], // Adicionei webmanifest aqui
        cleanupOutdatedCaches: true
      }
    })
  ]
})
