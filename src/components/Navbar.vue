<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container nav-container">
      <router-link to="/" class="logo">
        <span class="logo-bracket">&lt;</span>
        <span class="logo-text">QI</span>
        <span class="logo-dot">.</span>
        <span class="logo-text">SUI</span>
        <span class="logo-bracket">/&gt;</span>
      </router-link>

      <div class="nav-links" :class="{ active: mobileMenuOpen }">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-link"
          @click="mobileMenuOpen = false"
        >
          <span class="link-prefix">{{ link.prefix }}</span>
          {{ $t(link.labelKey) }}
        </router-link>
      </div>

      <div class="nav-actions">
        <button
          class="action-btn lang-btn"
          @click="toggleLang"
          :title="$t('locale.name')"
        >
          {{ localeLabel }}
        </button>
        <button
          class="action-btn theme-btn"
          @click="toggleTheme"
          :title="isDark ? 'Light Mode' : 'Dark Mode'"
        >
          <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
        </button>
      </div>

      <button
        class="mobile-toggle"
        @click="mobileMenuOpen = !mobileMenuOpen"
        aria-label="Toggle menu"
      >
        <span :class="{ open: mobileMenuOpen }"></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme.js'

const { locale } = useI18n()
const { isDark, toggleTheme } = useTheme()

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)

const localeLabel = computed(() => locale.value === 'zh' ? 'EN' : '中文')

function toggleLang() {
  const newLocale = locale.value === 'zh' ? 'en' : 'zh'
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}

const navLinks = [
  { path: '/', labelKey: 'nav.home', prefix: '01.' },
  { path: '/blog', labelKey: 'nav.blog', prefix: '02.' },
  // { path: '/music', labelKey:  'nav.music', prefix: '03.' },
  { path: '/projects', labelKey: 'nav.projects', prefix: '04.' },
  { path: '/about', labelKey: 'nav.about', prefix: '05.' }
]

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1.25rem 0;
  transition: all var(--transition-normal);
  background: transparent;
}

.navbar.scrolled {
  background: color-mix(in srgb, var(--bg-secondary) 85%, transparent);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  padding: 0.75rem 0;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: var(--transition-fast);
}

.logo:hover {
  filter: drop-shadow(0 0 12px rgba(0, 212, 255, 0.3));
}

.logo-bracket {
  color: var(--accent-cyan);
}

.logo-text {
  color: var(--text-primary);
}

.logo-dot {
  color: var(--accent-green);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.nav-link {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  position: relative;
  transition: var(--transition-fast);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green));
  transition: width var(--transition-normal);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text-primary);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.link-prefix {
  color: var(--accent-cyan);
  font-size: 0.75rem;
  opacity: 0.7;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  cursor: pointer;
  transition: var(--transition-fast);
}

.action-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  background: rgba(var(--accent-cyan-rgb), 0.06);
}

.mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.mobile-toggle span,
.mobile-toggle span::before,
.mobile-toggle span::after {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text-primary);
  transition: all var(--transition-normal);
}

.mobile-toggle span::before,
.mobile-toggle span::after {
  content: '';
}

.mobile-toggle span::before {
  transform: translateY(-8px);
}

.mobile-toggle span::after {
  transform: translateY(8px);
}

.mobile-toggle span.open {
  background: transparent;
}

.mobile-toggle span.open::before {
  transform: rotate(45deg) translate(5.5px, 5.5px);
}

.mobile-toggle span.open::after {
  transform: rotate(-45deg) translate(5.5px, -5.5px);
}

@media (max-width: 900px) {
  .nav-actions {
    gap: 0.4rem;
  }
}

@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    background: var(--bg-secondary);
    flex-direction: column;
    justify-content: center;
    gap: 2rem;
    padding: 2rem;
    transition: right var(--transition-slow);
    border-left: 1px solid var(--border-color);
  }

  .nav-links.active {
    right: 0;
  }

  .nav-link {
    font-size: 1rem;
  }
}
</style>
