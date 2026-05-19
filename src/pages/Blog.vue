<template>
  <div class="blog-page">
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">
          <span class="title-prefix">//</span> {{ t('blog.title') }}
        </h1>
        <p class="page-desc">{{ t('blog.desc') }}</p>
      </div>
    </section>

    <section class="blog-content">
      <div class="container">
        <button class="mobile-filter-toggle" @click="sidebarOpen = !sidebarOpen" :class="{ active: sidebarOpen }">
          <svg class="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          <span>{{ t('blog.categoryFilter') }}</span>
          <svg class="chevron" :class="{ open: sidebarOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <div class="blog-layout" :class="{ 'sidebar-open': sidebarOpen }">
          <aside class="sidebar">
            <div class="search-section">
              <div class="search-input-wrapper">
                <input
                  v-model="searchKeyword"
                  @input="handleSearch"
                  type="text"
                  :placeholder="t('blog.searchPlaceholder')"
                  class="search-input"
                />
                <span class="search-icon">🔍</span>
              </div>
            </div>

            <div class="filter-section">
              <h3 class="filter-title">{{ t('blog.categoryFilter') }}</h3>
              <div class="filter-list">
                <button
                  v-for="(cat, idx) in categoryList"
                  :key="idx"
                  :class="['filter-btn', { active: activeCategory === cat.value }]"
                  @click="handleCategoryChange(cat.value)"
                >
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <div class="tags-section">
              <h3 class="filter-title">{{ t('blog.hotTags') }}</h3>
              <div class="tags-cloud">
                <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </aside>

          <div class="posts-list">
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>{{ t('blog.loading') }}</p>
            </div>

            <div v-else-if="error" class="error-state">
              <p>{{ error }}</p>
              <button @click="fetchPosts" class="retry-btn">{{ t('blog.retry') }}</button>
            </div>

            <template v-else>
              <article
                v-for="(post, index) in filteredPosts"
                :key="post.id"
                class="post-item"
                :style="{ '--delay': `${index * 0.08}s` }"
              >
                <div class="post-number">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="post-content">
                  <div class="post-header">
                    <span class="post-category">{{ categoryLabelMap[post.category] || post.category }}</span>
                    <time class="post-date">{{ formatDate(post.date) }}</time>
                  </div>
                  <h2 class="post-title">
                    <router-link :to="`/blog/${post.id}`">{{ post.title }}</router-link>
                  </h2>
                  <p class="post-excerpt">
                    <template v-if="post.content">{{ stripHtml(post.content) }}</template>
                    <template v-else-if="post.file_url">
                      <svg class="file-indicator-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Markdown 文件 · 点击查看详情
                    </template>
                  </p>
                  <router-link :to="`/blog/${post.id}`" class="post-link">
                    {{ t('blog.continueReading') }} →
                  </router-link>
                </div>
              </article>

              <div v-if="filteredPosts.length === 0" class="empty-state">
                <p>{{ t('blog.noArticles') }}</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { articleService } from '../services/articleService.js'

const { t, locale } = useI18n()

const activeCategory = ref('all')
const posts = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref(null)
const searchKeyword = ref('')
const sidebarOpen = ref(false)
let searchTimeout = null

const categoryList = computed(() => {
  if (categories.value.length === 0) {
    return [{ value: 'all', label: t('blog.categories.all') || '全部' }]
  }
  
  const allCategory = { value: 'all', label: '全部' }
  const dynamicCategories = categories.value.map(cat => ({
    value: cat.value,
    label: cat.label
  }))
  
  return [allCategory, ...dynamicCategories]
})

const categoryLabelMap = computed(() => {
  const map = {}
  categories.value.forEach(cat => {
    map[cat.key] = cat.label
  })
  return map
})

const tags = ['Vue', 'React', 'Node.js', 'TypeScript', 'Docker', 'Rust', 'GraphQL', 'WASM', 'CSS']

const stripHtml = (str) => {
  if (!str) return ''
  return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return dateStr
  }
}

const filteredPosts = computed(() => {
  if (activeCategory.value === 'all') return posts.value
  return posts.value.filter(p => p.category.toLowerCase() === activeCategory.value)
})

// 从后端 API 获取文章列表（统一使用 /article/ 接口）
const fetchPosts = async (classification = '') => {
  try {
    loading.value = true
    error.value = null
    
    console.log('=== 获取文章列表 ===')
    console.log('当前分类:', classification || '全部')
    
    // 构建请求参数
    const params = {}
    if (classification) {
      params.article_classification = classification
    }
    
    // 统一调用 /article/ 接口（不传 keyword 参数即为查询全部）
    const response = await articleService.getArticles(params)
    
    console.log('=== 后端返回数据 ===')
    console.log('返回文章数量:', response.length)
    
    // 转换后端数据格式为前端需要的格式
    posts.value = response.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      date: article.date,
      author: article.author,
      content: article.content,
      img: article.img,
      file_url: article.file_url
    }))
    
    console.log('转换后的文章列表:', posts.value.length)
  } catch (err) {
    console.error('获取文章列表失败:', err)
    error.value = '获取文章列表失败，请检查网络连接或稍后重试'
    
    // 如果 API 失败，使用本地数据作为备用
    const { allPosts } = await import('../data/posts.js')
    posts.value = allPosts
  } finally {
    loading.value = false
  }
}

// 搜索文章（统一使用 /article/ 接口 + key 参数）
const searchArticles = async (keyword) => {
  if (!keyword.trim()) {
    // 如果清空搜索框，回到当前分类的列表
    await fetchPosts(activeCategory.value === 'all' ? '' : activeCategory.value)
    return
  }
  
  try {
    loading.value = true
    error.value = null
    
    console.log('=== 搜索文章 ===')
    console.log('搜索关键字:', keyword)
    console.log('当前分类:', activeCategory.value)
    
    // 构建请求参数：key + 分类（可选）
    const params = { key: keyword }  // ← 使用 key 而不是 keyword
    if (activeCategory.value && activeCategory.value !== 'all') {
      params.article_classification = activeCategory.value
    }
    
    console.log('搜索请求参数:', params)
    
    // 统一调用 /article/ 接口（传递 key 参数）
    const response = await articleService.getArticles(params)
    
    console.log('=== 搜索结果 ===')
    console.log('返回文章数量:', response.length)
    
    // 转换搜索结果格式
    posts.value = response.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      date: article.date,
      author: article.author,
      content: article.content,
      img: article.img,
      file_url: article.file_url
    }))
    
    console.log('转换后的文章列表:', posts.value.length)
  } catch (err) {
    console.error('搜索文章失败:', err)
    error.value = '搜索失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 处理搜索输入
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchArticles(searchKeyword.value)
  }, 500)
}

// 处理分类切换
const handleCategoryChange = (category) => {
  activeCategory.value = category
  console.log('=== 切换分类 ===')
  console.log('新分类:', category)
  
  // 如果正在搜索，保持搜索关键字并重新搜索（在当前分类下）
  if (searchKeyword.value.trim()) {
    console.log('当前有搜索关键字:', searchKeyword.value)
    console.log('在新分类下重新搜索:', category)
    // 在新分类下继续搜索
    const classification = category === 'all' ? '' : category
    searchArticles(searchKeyword.value)  // searchArticles 内部会自动使用 activeCategory
  } else {
    // 没有搜索时，直接加载该分类的文章列表
    console.log('无搜索关键字，加载分类列表')
    if (category === 'all') {
      fetchPosts('')
    } else {
      fetchPosts(category)
    }
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchCategories()
  fetchPosts()
})

// 获取分类列表（从数据字典API）
const fetchCategories = async () => {
  try {
    const data = await articleService.getDictionaryByType('article_category')
    categories.value = data.filter(cat => cat.key !== 'all')
  } catch (error) {
    console.error('获取分类失败:', error)
    // 使用默认分类作为后备方案
    categories.value = articleService.getDefaultCategories().filter(cat => cat.key !== 'all')
  }
}
</script>

<style scoped>
.blog-page {
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

.blog-content {
  padding: 2rem 0 4rem;
}

.mobile-filter-toggle {
  display: none;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.mobile-filter-toggle:hover,
.mobile-filter-toggle.active {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  box-shadow: 0 0 20px rgba(var(--accent-cyan-rgb), 0.08);
}

.mobile-filter-toggle .filter-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.mobile-filter-toggle .chevron {
  margin-left: auto;
  transition: transform 0.3s ease;
  width: 18px;
  height: 18px;
}

.mobile-filter-toggle .chevron.open {
  transform: rotate(180deg);
}

.blog-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2.5rem;
}

.sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.search-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.search-input-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.7rem 2.5rem 0.7rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.88rem;
  transition: all 0.25s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 3px rgba(var(--accent-cyan-rgb), 0.08);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-icon {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.85rem;
}

.filter-section,
.tags-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.filter-title {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-btn {
  background: none;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.84rem;
  color: var(--text-secondary);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.filter-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--accent-cyan);
  border-radius: 0 2px 2px 0;
  transition: height 0.2s ease;
}

.filter-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.filter-btn.active {
  background: rgba(var(--accent-cyan-rgb), 0.08);
  color: var(--accent-cyan);
}

.filter-btn.active::before {
  height: 60%;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tag {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 0.3rem 0.7rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.tag:hover {
  background: rgba(var(--accent-purple-rgb), 0.12);
  color: var(--accent-purple);
  border-color: rgba(var(--accent-purple-rgb), 0.15);
  transform: scale(1.04);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.post-item {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem 1.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px);
  animation: postSlideIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) var(--delay) forwards;
}

@keyframes postSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-item:hover {
  border-color: var(--border-hover);
  transform: translateX(8px);
  box-shadow: -4px 0 24px rgba(0, 212, 255, 0.06);
}

.post-number {
  font-family: var(--font-mono);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--bg-tertiary);
  min-width: 44px;
  line-height: 1;
  transition: color 0.3s ease;
}

.post-item:hover .post-number {
  color: var(--accent-cyan);
  text-shadow: 0 0 12px rgba(var(--accent-cyan-rgb), 0.3);
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 0.65rem;
  flex-wrap: wrap;
}

.post-category {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 0.2rem 0.65rem;
  background: rgba(var(--accent-cyan-rgb), 0.1);
  color: var(--accent-cyan);
  border-radius: var(--radius-sm);
  letter-spacing: 0.02em;
}

.post-date {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
}

.post-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
  line-height: 1.4;
}

.post-title a {
  color: var(--text-primary);
  transition: all 0.25s ease;
  display: inline-block;
}

.post-title a:hover {
  color: var(--accent-cyan);
  transform: translateX(4px);
}

.post-excerpt {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.file-indicator-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: -3px;
  margin-right: 4px;
  color: var(--accent-cyan);
  flex-shrink: 0;
}

.post-link {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--accent-cyan);
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.post-link:hover {
  letter-spacing: 0.06em;
  text-shadow: 0 0 8px rgba(var(--accent-cyan-rgb), 0.3);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--error-color);
  font-family: var(--font-mono);
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: var(--accent-cyan);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.retry-btn:hover {
  filter: brightness(1.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(var(--accent-cyan-rgb), 0.25);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

@media (max-width: 900px) {
  .blog-layout {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .sidebar {
    position: static;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  .blog-layout.sidebar-open .sidebar {
    max-height: 800px;
    opacity: 1;
    pointer-events: auto;
    margin-bottom: 1.5rem;
  }

  .mobile-filter-toggle {
    display: flex;
  }

  .filter-list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 0.4rem 0.85rem;
    font-size: 0.8rem;
  }

  .filter-btn::before {
    display: none;
  }
}

@media (max-width: 600px) {
  .page-header {
    padding: 2.5rem 0 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .post-item {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.15rem;
  }

  .post-number {
    font-size: 1.3rem;
    min-width: auto;
  }

  .post-title {
    font-size: 1rem;
  }

  .post-excerpt {
    -webkit-line-clamp: 2;
    font-size: 0.84rem;
  }

  .mobile-filter-toggle {
    padding: 11px 14px;
    font-size: 0.82rem;
  }

  .mobile-filter-toggle .filter-icon {
    width: 15px;
    height: 15px;
  }
}
</style>
