import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages julkaisee sivun osoitteeseen /<repon nimi>/
  base: '/nimigeneraattori/',
  plugins: [react()],
})
