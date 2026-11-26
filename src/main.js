import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './locales/index.js'
// 本地字体，不走 Google Fonts CDN，国内访问不会被卡住
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/inter/900.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource/jetbrains-mono/700.css'
import '@fontsource-variable/space-grotesk'

import './style.css'
import './widget-demos.css'

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
