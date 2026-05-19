<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">{{ t('home.badge') }}</div>
          <h1 class="hero-title">
            {{ t('home.titlePrefix') }}<span class="highlight">{{ t('home.titleHighlight') }}</span>
            <br />
            <span class="typing-text">{{ typedText }}<span class="cursor">|</span></span>
          </h1>
          <p class="hero-desc">
            {{ t('home.desc1') }}<br />
            {{ t('home.desc2') }}
          </p>
          <div class="hero-actions">
            <router-link to="/blog" class="btn btn-primary">
              <span>{{ t('home.readBlog') }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </router-link>
            <router-link to="/about" class="btn btn-secondary">{{ t('home.learnMore') }}</router-link>
          </div>

          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number">47+</span>
              <span class="stat-label">{{ t('home.articles') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-number">12K+</span>
              <span class="stat-label">{{ t('home.codeLines') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-number">99%</span>
              <span class="stat-label">{{ t('home.passion') }}</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="code-window">
            <div class="window-header">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
              <span class="window-title">about.js</span>
            </div>
            <pre class="code-content"><code><span class="keyword">const</span> <span class="variable">developer</span> = {
  <span class="property">name</span>: <span class="string">'七岁 (Qisui)'</span>,
  <span class="property">role</span>: <span class="string">'Frontend Engineer'</span>,
  <span class="property">skills</span>: [
    <span class="string">'Vue'</span>, <span class="string">'Uniapp'</span>,
    <span class="string">'TypeScript'</span>, <span class="string">'CSS'</span>
  ],
  <span class="property">passion</span>: <span class="string">'Building elegant UIs'</span>,
  <span class="method">sayHello</span>() {
    <span class="keyword">return</span> <span class="string">'Welcome to my blog!'</span>;
  }
};</code></pre>
          </div>
        </div>
      </div>
    </section>


  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { latestPosts } from '../data/posts.js'

const { t } = useI18n()

const typedText = ref('')
const titles = computed(() => [
  t('home.typing1', '前端工程师'),
  t('home.typing2', '技术探索者'),
  t('home.typing3', 'UI/UX 爱好者')
])
let titleIndex = 0
let charIndex = 0
let isDeleting = false
let timer = null

function typeEffect() {
  const currentTitle = titles.value[titleIndex]

  if (!isDeleting && charIndex <= currentTitle.length) {
    typedText.value = currentTitle.substring(0, charIndex)
    charIndex++
    timer = setTimeout(typeEffect, 100)
  } else if (isDeleting && charIndex >= 0) {
    typedText.value = currentTitle.substring(0, charIndex)
    charIndex--
    timer = setTimeout(typeEffect, 50)
  } else {
    isDeleting = !isDeleting
    if (!isDeleting) {
      titleIndex = (titleIndex + 1) % titles.value.length
    }
    timer = setTimeout(typeEffect, isDeleting ? 50 : 2000)
  }
}

onMounted(() => typeEffect())
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.home {
  padding-top: 80px;
}

.hero {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  padding: 4rem 0;
}

.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-badge {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--accent-cyan);
  margin-bottom: 1.5rem;
  letter-spacing: 0.1em;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.5rem;
}

.highlight {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.typing-text {
  color: var(--text-secondary);
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

.hero-desc {
  font-size: 1.15rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 500;
  transition: var(--transition-normal);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-cyan-hover));
  color: var(--bg-primary);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(var(--accent-cyan-rgb), 0.3);
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-secondary:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

.code-window {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-glow), var(--shadow-card);
}

.window-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.875rem 1rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red {
  background: #ff5f57;
}

.dot.yellow {
  background: #febc2e;
}

.dot.green {
  background: #28c840;
}

.window-title {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-left: auto;
}

.code-content {
  padding: 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.8;
  overflow-x: auto;
  color: var(--text-secondary);
}

.code-content code {
  white-space: pre;
}

.keyword {
  color: var(--accent-purple);
}

.variable {
  color: var(--accent-orange);
}

.property {
  color: var(--accent-cyan);
}

.string {
  color: var(--accent-green);
}

.method {
  color: var(--accent-pink);
}

.latest-posts {
  padding: 5rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  color: var(--text-primary);
  letter-spacing: 0.05em;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--accent-cyan);
  transition: var(--transition-fast);
}

.view-all:hover {
  gap: 0.75rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.post-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  transition: var(--transition-normal);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-4px);
  box-shadow: var(--shadow-glow);
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.post-tag {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: rgba(var(--accent-cyan-rgb), 0.1);
  color: var(--accent-cyan);
  border-radius: var(--radius-sm);
}

.post-date {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.post-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.post-excerpt {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1.25rem;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--accent-cyan);
  transition: var(--transition-fast);
}

.read-more:hover {
  gap: 0.65rem;
}

@media (max-width: 900px) {
  .container {
    grid-template-columns: 1fr;
  }

  .hero-visual {
    order: -1;
  }

  .hero {
    text-align: center;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
