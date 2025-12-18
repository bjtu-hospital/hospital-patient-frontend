import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// Custom plugin to inject <ai-bot /> into every page
const injectAiBotPlugin = () => {
  return {
    name: 'vite-plugin-inject-ai-bot',
    enforce: 'pre',
    transform(code, id) {
      // Normalize path and check if it's a page in src/pages
      const path = id.replace(/\\/g, '/');
      if (path.includes('/src/pages/') && path.endsWith('.vue')) {
        // Regex to find the closing template tag of the root template
        // Matches </template> followed by optional whitespace and then <script, <style, or EOF
        const regex = /(<\/template>)(\s*)(<script|<style|$)/;
        if (regex.test(code)) {
          return code.replace(regex, '<ai-bot />$1$2$3');
        }
      }
      return code;
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    injectAiBotPlugin(),
    uni(),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
})
