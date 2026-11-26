import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Blog from '../pages/Blog.vue'
import ArticleDetail from '../pages/ArticleDetail.vue'
import About from '../pages/About.vue'
import Projects from '../pages/Projects.vue'
import Music from '../pages/Music.vue'
import MusicPlay from '../pages/MusicPlay.vue'
import Components from '../pages/Components.vue'
import ComponentDetail from '../pages/ComponentDetail.vue'
import { setPageMeta } from '../utils/seo'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      description: '七岁的技术博客，记录前端、后端与工程实践。'
    }
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog,
    meta: {
      title: '博客',
      description: '全部文章列表，记录 Vue、React、TypeScript、Node.js 等技术栈的实践与踩坑。'
    }
  },
  {
    path: '/blog/:id',
    name: 'ArticleDetail',
    component: ArticleDetail,
    // 文章页的标题和封面要等文章数据回来才知道，在页面里单独更新
    meta: { title: '文章' }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: '关于',
      description: '关于七岁，以及这个博客是怎么来的。'
    }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
    meta: {
      title: '项目',
      description: '七岁做过的一些项目，涵盖前端、后端与运维。'
    }
  },
  {
    path: '/music',
    name: 'Music',
    component: Music,
    meta: {
      title: '音乐',
      description: '听点东西。'
    }
  },
  {
    path: '/music/play',
    name: 'MusicPlay',
    component: MusicPlay,
    meta: { title: '播放' }
  },
  {
    path: '/components',
    name: 'Components',
    component: Components,
    meta: {
      title: '组件',
      description: '现成的功能组件集合，点击卡片查看代码与完整预览。'
    }
  },
  {
    path: '/components/:id',
    name: 'ComponentDetail',
    component: ComponentDetail,
    // 组件页的标题等拿到组件数据再更新
    meta: { title: '组件' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})

// 路由切到哪一页，就把标题和分享标签换成那一页的
router.afterEach((to) => {
  const meta = to.meta || {}
  setPageMeta({
    title: meta.title || '',
    description: meta.description || '',
    url: location.origin + to.path
  })
})

export default router
