import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './locales/index.js'
// 本地字体，不走 Google Fonts CDN，国内访问不会被卡住
// 本地字体，不走 Google Fonts CDN，国内访问不会被卡住
// 说明：这里只引 latin 子集（英文和数字）。
//       完整版每个字重都带 5 个子集（拉丁/拉丁扩展/希腊/越南/西里尔），
//       全引进来 CSS 直接膨胀到 100 多 KB，这里用不到的那些全砍掉。
import '@fontsource/inter/latin-300.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/inter/latin-800.css'
import '@fontsource/inter/latin-900.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-600.css'
import '@fontsource/jetbrains-mono/latin-700.css'
import './styles/fonts.css'

import './style.css'
import './widget-demos.css'

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
