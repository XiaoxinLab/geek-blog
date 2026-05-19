<template>
  <div class="projects-page">
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">
          <span class="title-prefix">//</span> {{ t('projects.title') }}
        </h1>
        <p class="page-desc">{{ t('projects.desc') }}</p>
      </div>
    </section>

    <section class="projects-content">
      <div class="container">
        <div class="projects-grid">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          <template v-else-if="projects.length > 0">
          <article
            v-for="(project, index) in projects"
            :key="project.id"
            class="project-card"
            :style="{ '--delay': `${index * 0.1}s` }"
          >
            <div class="project-image" :style="getImageStyle(project)">
              <div class="image-overlay"></div>
            </div>
            <div class="project-info">
              <div class="project-meta">
                <span class="project-type">{{ project.project_type }}</span>
                <span class="project-year">{{ project.project_year }}</span>
              </div>
              <h3 class="project-name">{{ project.project_name }}</h3>
              <p class="project-desc">{{ project.project_desc }}</p>

              <div v-if="project.guest_account" class="guest-account">
                <svg class="guest-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="guest-label">{{ project.guest_account.displayName || '游客' }}：</span>
                <code class="guest-code">{{ project.guest_account.username }} / {{ project.guest_account.password }}</code>
              </div>

              <div class="project-tech">
                <span v-for="tech in project.project_techs" :key="tech" class="tech-tag">{{ tech }}</span>
              </div>

              <div class="project-links">
                <a v-if="project.show_demo !== false && project.project_demo" :href="project.project_demo" target="_blank" rel="noopener noreferrer" class="link-btn demo">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  <span>{{ t('projects.demo') }}</span>
                  <svg class="link-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
                <a v-if="project.show_github !== false && project.project_github" :href="project.project_github" target="_blank" rel="noopener noreferrer" class="link-btn code">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                  <span>{{ t('projects.sourceCode') }}</span>
                  <svg class="link-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                </a>
              </div>
            </div>
          </article>
          </template>
          <div v-else class="empty-state">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <p>暂无项目</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()

const projects = ref([])
const loading = ref(true)

const getImageStyle = (project) => {
  if (project.project_image) {
    const imageUrl = project.project_image.startsWith('http')
      ? project.project_image
      : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:1011'}/${project.project_image}`
    return { backgroundImage: `url(${imageUrl})` }
  }
  return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
}

const fetchProjects = async () => {
  loading.value = true
  try {
    const res = await api.get('/project/public')
    if (res.code === 0) {
      projects.value = Array.isArray(res.result) ? res.result : []
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
    projects.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.projects-page {
  padding-top: 80px;
}

.page-header {
  padding: 4rem 0 2.5rem;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-family: var(--font-mono);
  font-size: clamp(1.75rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 0.6rem;
  animation: titleIn 0.7s ease-out;
}

@keyframes titleIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.title-prefix {
  color: var(--accent-cyan);
}

.page-desc {
  color: var(--text-secondary);
  font-size: 1rem;
  opacity: 0;
  animation: fadeIn 0.6s ease-out 0.2s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.projects-content {
  padding: 3rem 0 5rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.75rem;
  position: relative;
}

.loading-state,
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 212, 255, 0.1);
  border-top-color: var(--accent-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  width: 64px;
  height: 64px;
  opacity: 0.3;
  margin-bottom: 1rem;
}

.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  opacity: 0;
  transform: translateY(28px);
  animation: cardSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) var(--delay) forwards;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

@keyframes cardSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.project-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-glow), var(--shadow-card);
  transform: translateY(-6px);
}

.project-image {
  height: 130px;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-color: var(--bg-tertiary);
  flex-shrink: 0;
  contain: layout style paint;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, var(--bg-primary) 100%);
  opacity: 0.7;
  transition: all 0.35s ease;
  pointer-events: none;
}

.project-card:hover .image-overlay {
  background: linear-gradient(to bottom, rgba(0, 212, 255, 0.03) 30%, var(--bg-primary) 100%);
  opacity: 0.8;
}

.project-info {
  padding: 1.4rem 1.5rem 1.5rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
}

.project-type {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 0.2rem 0.65rem;
  background: rgba(168, 85, 247, 0.12);
  color: var(--accent-purple);
  border-radius: var(--radius-sm);
  letter-spacing: 0.02em;
}

.project-year {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
}

.project-name {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.55rem;
  line-height: 1.4;
  transition: color 0.25s ease;
}

.project-card:hover .project-name {
  color: var(--accent-cyan);
}

.project-desc {
  font-size: 0.87rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1.1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.guest-account {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 0.9rem;
  margin-bottom: 1.1rem;
  background: rgba(59, 130, 246, 0.07);
  border: 1px solid rgba(59, 130, 246, 0.16);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  transition: all 0.25s ease;
}

.guest-account:hover {
  background: rgba(59, 130, 246, 0.11);
  border-color: rgba(59, 130, 246, 0.26);
}

.guest-icon {
  width: 15px;
  height: 15px;
  color: var(--accent-cyan);
  flex-shrink: 0;
}

.guest-label {
  color: var(--text-secondary);
}

.guest-code {
  font-family: var(--font-mono);
  color: var(--accent-cyan);
  background: rgba(59, 130, 246, 0.12);
  padding: 0.12rem 0.45rem;
  border-radius: 4px;
  font-size: 0.76rem;
  font-weight: 600;
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: auto;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.link-btn svg:first-child {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.link-btn span {
  transition: transform 0.25s ease;
}

.link-btn .link-arrow {
  width: 12px;
  height: 12px;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.25s ease;
}

.link-btn.demo {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(0, 212, 255, 0.06));
  border: 1px solid rgba(0, 212, 255, 0.2);
  color: var(--accent-cyan);
}

.link-btn.demo:hover {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.22), rgba(0, 212, 255, 0.1));
  border-color: var(--accent-cyan);
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.18);
  transform: translateY(-2px);
}

.link-btn.code {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.link-btn.code:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
  background: rgba(0, 255, 136, 0.05);
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.08);
  transform: translateY(-2px);
}

.link-btn:hover .link-arrow {
  opacity: 1;
  transform: translateX(0);
}

.link-btn:hover svg:first-child {
  transform: scale(1.1);
}

.link-btn:hover span {
  letter-spacing: 0.02em;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 1.1rem;
}

.tech-tag {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 0.24rem 0.58rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.tech-tag:hover {
  color: var(--text-secondary);
  border-color: var(--border-color);
  background: var(--bg-tertiary);
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.15rem;
  }

  .page-header {
    padding: 2.5rem 0 1.75rem;
  }

  .projects-content {
    padding: 1.75rem 0 3.5rem;
  }

  .project-image {
    height: 100px;
  }

  .project-info {
    padding: 1.1rem 1.15rem 1.2rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .project-meta {
    margin-bottom: 0.55rem;
  }

  .project-type {
    font-size: 0.68rem;
    padding: 0.18rem 0.55rem;
  }

  .project-year {
    font-size: 0.74rem;
  }

  .project-name {
    font-size: 1rem;
    margin-bottom: 0.45rem;
  }

  .project-desc {
    -webkit-line-clamp: 2;
    font-size: 0.82rem;
    line-height: 1.6;
    margin-bottom: 0.9rem;
  }

  .guest-account {
    padding: 0.55rem 0.8rem;
    margin-bottom: 0.9rem;
    font-size: 0.78rem;
  }

  .project-links {
    gap: 0.6rem;
    margin-bottom: 1rem;
  }

  .link-btn {
    padding: 0.42rem 0.8rem;
    font-size: 0.76rem;
    gap: 5px;
  }

  .link-btn svg:first-child {
    width: 13px;
    height: 13px;
  }

  .link-btn .link-arrow {
    display: none;
  }

  .tech-tag {
    font-size: 0.66rem;
    padding: 0.2rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .project-card {
    border-radius: var(--radius-sm);
  }

  .project-image {
    height: 90px;
  }

  .project-info {
    padding: 1rem 1.1rem 1.15rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .project-links {
    flex-direction: column;
    gap: 0.55rem;
  }

  .link-btn {
    justify-content: center;
    padding: 0.45rem 1rem;
    font-size: 0.78rem;
    gap: 5px;
  }

  .link-btn svg:first-child {
    width: 13px;
    height: 13px;
  }

  .guest-account {
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
