<template>
  <div class="article-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state-detail">
      <div class="loading-spinner"></div>
      <p>{{ t('blog.loading') }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state-detail container-narrow">
      <h2>{{ error }}</h2>
      <router-link to="/blog" class="back-btn">{{ t('blog.backToList') }}</router-link>
    </div>

    <!-- 文章内容 -->
    <article class="article" v-else-if="article">
      <header class="article-header">
        <div class="container-narrow">
          <router-link to="/blog" class="back-link">
            {{ t('blog.backToList') }}
          </router-link>
          <div class="article-meta">
            <span class="article-tag">{{ categoryLabelMap[article.category] || article.category }}</span>
            <time class="article-date">{{ article.date }}</time>
            <span v-if="article.author" class="article-author">{{ article.author }}</span>
          </div>
          <h1 class="article-title">{{ article.title }}</h1>
        </div>
      </header>

      <div class="article-body">
        <div class="container-narrow">
          <div class="markdown-body" v-html="renderedContent"></div>

          <div class="divider"></div>

          <footer class="article-footer">
            <div class="tags-row">
              <span class="label">{{ t('blog.article.tagsLabel') }}</span>
              <span class="tag" v-for="tag in articleTags" :key="tag">{{ tag }}</span>
            </div>
            <div class="share-row">
              <span class="label">{{ t('blog.article.shareLabel') }}</span>
              <a href="#" class="share-btn" @click.prevent>{{ t('blog.article.twitter') }}</a>
              <a href="#" class="share-btn" @click.prevent>{{ t('blog.article.weibo') }}</a>
              <a href="#" class="share-btn" @click.prevent="copyLink">{{ t('blog.article.copyLink') }}</a>
            </div>
          </footer>
        </div>
      </div>
    </article>

    <!-- 未找到文章 -->
    <div v-else class="not-found container">
      <h1>{{ t('common.notFound') }}</h1>
      <router-link to="/blog">{{ t('blog.backToList') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { articleService } from '../services/articleService.js'
import { renderMarkdown } from '../utils/markdown.js'

const { t } = useI18n()
const route = useRoute()

const article = ref(null)
const loading = ref(true)
const error = ref(null)
const categories = ref([])

const categoryLabelMap = computed(() => {
  const map = {}
  categories.value.forEach(cat => {
    map[cat.key] = cat.label
  })
  return map
})

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return renderMarkdown(article.value.content)
})

const articleTags = computed(() => {
  // 根据文章 ID 或标题动态生成标签
  const title = article.value?.title || ''
  const category = article.value?.category || ''
  
  const tagMap = {
    'Antdesign': ['Vue', 'Ant Design', 'Frontend'],
    '项目问题': ['Vue', 'Axios', 'JavaScript', 'Security'],
    '职业': ['Career', 'Growth'],
    '蚂蚁': ['mPaas', 'Weex', 'Mobile'],
    '动态': ['mPaas', 'Vue', 'Dynamic Card'],
    'Vuex': ['Vuex', 'State Management', 'Vue'],
    'uniapp': ['uniapp', 'WeChat Mini Program', 'Cross-platform'],
    '微信小程序': ['WeChat Mini Program', 'Deployment', 'Compliance'],
    'Vue': ['Vue', 'Element UI', 'Rich Text Editor']
  }
  
  for (const [key, tags] of Object.entries(tagMap)) {
    if (title.includes(key) || category.includes(key)) {
      return tags
    }
  }
  
  return [category || 'Frontend']
})

// 从后端 API 获取文章详情
const fetchArticle = async () => {
  try {
    loading.value = true
    error.value = null
    
    const id = route.params.id
    const response = await articleService.getArticleById(id)
    
    if (response && response.id) {
      article.value = response

      if (response.file_url && !response.content) {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1011'
        const fileUrl = `${apiBase}/${response.file_url}`
        try {
          const mdRes = await fetch(fileUrl)
          if (mdRes.ok) {
            article.value.content = await mdRes.text()
          }
        } catch (fileErr) {
          console.error('加载 Markdown 文件失败:', fileErr)
        }
      }
    } else {
      // 如果 API 没有返回数据，尝试从本地数据获取
      const { allPosts } = await import('../data/posts.js')
      article.value = allPosts.find(p => p.id === Number(id))
      
      if (!article.value) {
        error.value = '文章未找到'
      }
    }
  } catch (err) {
    console.error('获取文章详情失败:', err)
    error.value = '获取文章失败，请稍后重试'
    
    // 如果 API 失败，使用本地数据作为备用
    try {
      const { allPosts } = await import('../data/posts.js')
      article.value = allPosts.find(p => p.id === Number(route.params.id))
    } catch (localErr) {
      console.error('本地数据加载也失败:', localErr)
    }
  } finally {
    loading.value = false
  }
}

function copyLink() {
  navigator.clipboard?.writeText(window.location.href)
}

// 监听路由参数变化，重新获取数据
watch(() => route.params.id, () => {
  fetchArticle()
})

// 组件挂载时获取数据
onMounted(async () => {
  await fetchCategories()
  fetchArticle()
})

const fetchCategories = async () => {
  try {
    const data = await articleService.getDictionaryByType('article_category')
    categories.value = data || []
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}
</script>

<style>
@import 'highlight.js/styles/atom-one-dark.css';
</style>

<style scoped>

.article-page {
  padding-top: 80px;
}

.loading-state-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.loading-state-detail .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state-detail {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--error-color);
  font-family: var(--font-mono);
}

.error-state-detail h2 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.back-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--accent-cyan);
  color: var(--bg-primary);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  transition: var(--transition-fast);
}

.back-btn:hover {
  background: var(--accent-cyan-hover);
  transform: translateY(-2px);
}

.article-header {
  padding: 4rem 0 3rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(180deg, var(--bg-secondary), transparent);
}

.container-narrow {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.back-link {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-muted);
  display: inline-block;
  margin-bottom: 2rem;
  transition: var(--transition-fast);
}

.back-link:hover {
  color: var(--accent-cyan);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.article-tag {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.3rem 0.85rem;
  background: rgba(var(--accent-cyan-rgb), 0.12);
  color: var(--accent-cyan);
  border-radius: var(--radius-sm);
}

.article-date,
.article-author {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-muted);
}

.article-author::before {
  content: '@ ';
  color: var(--accent-purple);
}

.article-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 800;
  line-height: 1.25;
}

.article-body {
  padding: 4rem 0;
}

.markdown-body {
  font-size: 1.05rem;
  line-height: 1.9;
  color: var(--text-secondary);
}

.markdown-body :deep(h1) {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 2.5rem 0 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--accent-cyan);
}

.markdown-body :deep(h2) {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 2.5rem 0 1.25rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--border-color);
}

.markdown-body :deep(h3) {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 2rem 0 1rem;
}

.markdown-body :deep(h4) {
  font-family: var(--font-mono);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--accent-cyan);
  margin: 1.5rem 0 0.75rem;
}

.markdown-body :deep(p) {
  margin-bottom: 1.25rem;
}

.markdown-body :deep(strong) {
  color: var(--text-primary);
  font-weight: 700;
}

.markdown-body :deep(a) {
  color: var(--accent-cyan);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: var(--transition-fast);
}

.markdown-body :deep(a:hover) {
  border-bottom-color: var(--accent-cyan);
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5rem;
  margin: 1.25rem 0;
}

.markdown-body :deep(li) {
  margin-bottom: 0.5rem;
  position: relative;
}

.markdown-body :deep(ul li::marker) {
  color: var(--accent-cyan);
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--accent-cyan);
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  background: rgba(var(--accent-cyan-rgb), 0.04);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--text-secondary);
}

.markdown-body :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(pre.code-block) {
  background: var(--code-bg) !important;
  border: 1px solid var(--code-border, rgba(255,255,255,0.08));
  border-radius: var(--radius-md);
  padding: 1.25rem 1.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  position: relative;
  
  /* 细化横向滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 212, 255, 0.4) transparent;
}

/* Webkit 浏览器滚动条样式 */
.markdown-body :deep(pre.code-block::-webkit-scrollbar) {
  height: 6px;
}

.markdown-body :deep(pre.code-block::-webkit-scrollbar-track) {
  background: transparent;
  border-radius: 3px;
}

.markdown-body :deep(pre.code-block::-webkit-scrollbar-thumb) {
  background: rgba(0, 212, 255, 0.35);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.markdown-body :deep(pre.code-block::-webkit-scrollbar-thumb:hover) {
  background: rgba(0, 212, 255, 0.6);
}

.markdown-body :deep(pre.code-block::before) {
  content: attr(data-lang);
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.2rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  border-radius: 0 var(--radius-sm) 0 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.markdown-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.88rem;
}

.markdown-body :deep(:not(pre) > code) {
  background: var(--bg-tertiary);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-size: 0.88em;
  color: var(--accent-orange);
}

.markdown-body :deep(.hljs) {
  background: transparent !important;
  padding: 0 !important;
}

/* 代码高亮颜色增强 */
.markdown-body :deep(.hljs-keyword),
.markdown-body :deep(.hljs-selector-tag),
.markdown-body :deep(.hljs-built_in) {
  color: #c678dd !important;
}

.markdown-body :deep(.hljs-string),
.markdown-body :deep(.hljs-attr) {
  color: #98c379 !important;
}

.markdown-body :deep(.hljs-number),
.markdown-body :deep(.hljs-literal) {
  color: #d19a66 !important;
}

.markdown-body :deep(.hljs-comment),
.markdown-body :deep(.hljs-quote) {
  color: #5c6370 !important;
  font-style: italic;
}

.markdown-body :deep(.hljs-function .hljs-title),
.markdown-body :deep(.hljs-title.function_) {
  color: #61afef !important;
}

.markdown-body :deep(.hljs-variable),
.markdown-body :deep(.hljs-template-variable) {
  color: #e06c75 !important;
}

.markdown-body :deep(.hljs-type),
.markdown-body :deep(.hljs-class .hljs-title) {
  color: #e5c07b !important;
}

.markdown-body :deep(.hljs-regexp),
.markdown-body :deep(.hljs-link) {
  color: #56b6c2 !important;
}

.markdown-body :deep(.hljs-symbol),
.markdown-body :deep(.hljs-bullet) {
  color: #61afef !important;
}

.markdown-body :deep(.hljs-meta) {
  color: #61afef !important;
}

.markdown-body :deep(.hljs-deletion) {
  background: rgba(224, 108, 117, 0.15) !important;
  color: #e06c75 !important;
}

.markdown-body :deep(.hljs-addition) {
  background: rgba(152, 195, 121, 0.15) !important;
  color: #98c379 !important;
}

.markdown-body :deep(.hljs-emphasis) {
  font-style: italic;
}

.markdown-body :deep(.hljs-strong) {
  font-weight: bold;
}

.markdown-body :deep(hr) {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  margin: 2.5rem 0;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  text-align: left;
  font-size: 0.9rem;
}

.markdown-body :deep(th) {
  background: var(--bg-tertiary);
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-body :deep(tr:nth-child(even)) {
  background: rgba(var(--accent-cyan-rgb), 0.02);
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  margin: 3rem 0 2rem;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-top: 1.5rem;
}

.tags-row,
.share-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.label {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.tag {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  padding: 0.3rem 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: var(--transition-fast);
}

.tag:hover {
  color: var(--accent-cyan);
  background: rgba(var(--accent-cyan-rgb), 0.08);
}

.share-btn {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--accent-cyan);
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.share-btn:hover {
  border-color: var(--accent-cyan);
  background: rgba(var(--accent-cyan-rgb), 0.08);
}

.not-found {
  text-align: center;
  padding: 6rem 2rem;
}

.not-found h1 {
  font-family: var(--font-display);
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--accent-orange);
}

@media (max-width: 600px) {
  .container-narrow {
    padding: 0 1.25rem;
  }

  .article-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .markdown-body :deep(pre.code-block) {
    padding: 1rem;
    border-radius: var(--radius-sm);
    
    /* 移动端更细的滚动条 */
    scrollbar-width: thin;
  }

  .markdown-body :deep(pre.code-block::-webkit-scrollbar) {
    height: 4px;
  }

  .markdown-body :deep(code) {
    font-size: 0.82rem;
  }
}
</style>
