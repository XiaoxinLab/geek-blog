import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { visitService } from '../services/articleService'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1011'

// 路由路径到中文标题的映射
const PAGE_TITLE_MAP = {
  '/': '首页',
  '/blog': '博客列表',
  '/about': '关于我',
  '/projects': '项目展示'
}

// 根据路由生成中文标题
function getPageTitle(route) {
  const path = route.path

  // 检查是否是文章详情页 /blog/:id
  if (path.startsWith('/blog/') && path !== '/blog') {
    return '文章详情'
  }

  // 返回映射的中文标题
  return PAGE_TITLE_MAP[path] || route.name || document.title || '未知页面'
}

export function usePageVisitTracking() {
  const route = useRoute()

  const recordPageVisit = () => {
    const pagePath = route.fullPath || route.path
    const pageTitle = getPageTitle(route)

    visitService.recordVisit(pagePath, pageTitle)
  }

  watch(
    () => route.path,
    (newPath, oldPath) => {
      if (newPath && newPath !== oldPath) {
        setTimeout(recordPageVisit, 100)
      }
    },
    { immediate: true }
  )

  return {
    recordPageVisit
  }
}
