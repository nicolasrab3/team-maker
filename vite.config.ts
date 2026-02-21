import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change BASE to your GitHub repo name, e.g. "/futbol-equipos/"
const BASE = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  plugins: [react()],
  base: BASE,
})
