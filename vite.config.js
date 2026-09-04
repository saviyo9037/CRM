import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          'vendor-export': ['xlsx', 'jspdf', 'jspdf-autotable'],
          'vendor-icons': ['lucide-react', 'react-icons', '@heroicons/react', '@fortawesome/react-fontawesome'],
        },
      },
    },
  },
})