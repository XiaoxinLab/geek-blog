import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'

const isDark = useStorage('theme-dark', true)

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function setTheme(dark) {
    isDark.value = dark
  }

  watch(isDark, (val) => {
    document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light')
  }, { immediate: true })

  return {
    isDark,
    toggleTheme,
    setTheme
  }
}
