import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import svgLoader from 'vite-svg-loader'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { extractBrandColours } from '../shared/brandColours.mjs'

import brandHtml from './brandHtml.js'

const tokensPath = fileURLToPath(
  new URL('./src/brand/tokens.css', import.meta.url),
)
const coloursPath = fileURLToPath(
  new URL('../shared/brandColours.mjs', import.meta.url),
)

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    brandHtml,
    {
      name: 'brand-colour-exclusions',
      transform(source, id) {
        if (id !== coloursPath) return
        this.addWatchFile(tokensPath)
        const colours = extractBrandColours(readFileSync(tokensPath, 'utf8'))
        return {
          code: `export const brandColours = ${JSON.stringify(colours)}`,
          map: null,
        }
      },
      handleHotUpdate({ file, modules, server }) {
        if (file !== tokensPath) return
        const coloursModule = server.moduleGraph.getModuleById(coloursPath)
        return coloursModule ? [...modules, coloursModule] : modules
      },
    },
    vue(),
    tailwindcss(),
    svgLoader(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
})
