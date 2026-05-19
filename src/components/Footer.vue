<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand-logo">
            <span>&lt;</span>QI<span class="dot">.</span>SUI<span>/&gt;</span>
          </div>
          <p class="brand-desc">{{ t('footer.brandDesc') }}</p>
        </div>

        <div class="footer-section">
          <h4>{{ t('footer.navigation') }}</h4>
          <router-link to="/">{{ t('nav.home') }}</router-link>
          <router-link to="/blog">{{ t('nav.blog') }}</router-link>
          <router-link to="/projects">{{ t('nav.projects') }}</router-link>
          <router-link to="/about">{{ t('nav.about') }}</router-link>
        </div>

        <div class="footer-section">
          <h4>{{ t('footer.social') }}</h4>
          <a href="https://github.com/xiaoxinL1" target="_blank" rel="noopener noreferrer">{{ t('footer.github') }}</a>
          <a href="mailto:mlluxiaoxin@163.com">{{ t('footer.email') }}</a>

          <WeChatPopover qr-code-url="/images/wechat-qrcode.jpg">
            <span class="wechat-link">{{ t('footer.wechat') }}</span>
          </WeChatPopover>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">
          &copy; {{ currentYear }} {{ t('footer.copyright', { year: currentYear }) }}
        </p>
        <p class="terminal-text">
          <span class="prompt">$</span> {{ t('footer.terminal') }}
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import WeChatPopover from './WeChatPopover.vue'

const { t } = useI18n()
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  margin-top: auto;
  background: transparent;
  border-top: 1px solid var(--border-color);
  padding: 4rem 0 2rem;
  position: relative;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-cyan), transparent);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.brand-logo {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.brand-logo .dot {
  color: var(--accent-green);
}

.brand-desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  max-width: 280px;
}

.footer-section h4 {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--accent-cyan);
  margin-bottom: 1.25rem;
}

.footer-section a {
  display: block;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 0.5rem 1rem 0.5rem 2rem;
  margin: 0.15rem -1rem;
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  position: relative;
}

.footer-section a:hover {
  color: var(--accent-cyan);
  background: rgba(var(--accent-cyan-rgb), 0.08);
  transform: translateX(4px);
}

.footer-section a::before {
  content: '>';
  position: absolute;
  left: 1rem;
  opacity: 0;
  transform: translateX(-4px);
  transition: var(--transition-fast);
  font-family: var(--font-mono);
  color: var(--accent-cyan);
  font-weight: 600;
  font-size: 0.85rem;
}

.footer-section a:hover::before {
  opacity: 1;
  transform: translateX(0);
}

.wechat-link {
  display: block;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 0.5rem 1rem 0.5rem 2rem;
  margin: 0.15rem -1rem;
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  position: relative;
  cursor: pointer;
}

.wechat-link:hover {
  color: var(--accent-cyan);
  background: rgba(var(--accent-cyan-rgb), 0.08);
  transform: translateX(4px);
}

.wechat-link::before {
  content: '>';
  position: absolute;
  left: 1rem;
  opacity: 0;
  transform: translateX(-4px);
  transition: var(--transition-fast);
  font-family: var(--font-mono);
  color: var(--accent-cyan);
  font-weight: 600;
  font-size: 0.85rem;
}

.wechat-link:hover::before {
  opacity: 1;
  transform: translateX(0);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.copyright {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.terminal-text {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--accent-green);
}

.prompt {
  color: var(--accent-cyan);
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
