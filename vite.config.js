import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    // 把第三方大依赖单独拆成几个包。
    // 目的：首页不用下 markdown 高亮、axios 这些东西，
    //      打开首页只加载自己真正要用的那几个文件，首屏就快了。
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/]node_modules[\\/]highlight\.js[\\/]/.test(id)) return 'vendor-highlight'
          if (/[\\/]node_modules[\\/]markdown-it[\\/]/.test(id)) return 'vendor-markdown'
          if (/[\\/]node_modules[\\/]axios[\\/]/.test(id)) return 'vendor-axios'
          if (/[\\/]node_modules[\\/](vue|vue-router|vue-i18n|@vueuse)[\\/]/.test(id)) return 'vendor-vue'
          return undefined
        }
      }
    }
  }
})