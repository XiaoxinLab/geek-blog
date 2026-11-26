import { createRouter, createWebHistory } from 'vue-router'
import { setPageMeta } from '../utils/seo'

// 页面都改成按需加载：
// 说明：之前是把所有页面 import 进来，首屏要下载整个站点的代码（1.4MB）。
//       改成动态 import 之后，Vite 会给每个页面单独打包，
//       打开首页只下载首页用到的那部分。

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
    meta: {
      title: '首页',
      description: '七岁的技术博客，记录前端、后端与工程实践。'
    }
  },
  {
    path: '/blog',
    name: 'Blog',
    component: () => import('../pages/Blog.vue'),
    meta: {
      title: '博客',
      description: '全部文章列表，记录 Vue、React、TypeScript、Node.js 等技术栈的实践与踩坑。'
    }
  },
  {
    path: '/blog/:id',
    name: 'ArticleDetail',
    component: () => import('../pages/ArticleDetail.vue'),
    // 文章页的标题和封面要等文章数据回来才知道，在页面里单独更新
    meta: { title: '文章' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../pages/About.vue'),
    meta: {
      title: '关于',
      description: '关于七岁，以及这个博客是怎么来的。'
    }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../pages/Projects.vue'),
    meta: {
      title: '项目',
      description: '七岁做过的一些项目，涵盖前端、后端与运维。'
    }
  },
  {
    path: '/music',
    name: 'Music',
    component: () => import('../pages/Music.vue'),
    meta: {
      title: '音乐',
      description: '听点东西。'
    }
  },
  {
    path: '/music/play',
    name: 'MusicPlay',
    component: () => import('../pages/MusicPlay.vue'),
    meta: { title: '播放' }
  },
  {
    path: '/components',
    name: 'Components',
    component: () => import('../pages/Components.vue'),
    meta: {
      title: '组件',
      description: '现成的功能组件集合，点击卡片查看代码与完整预览。'
    }
  },
  {
    path: '/components/:id',
    name: 'ComponentDetail',
    component: () => import('../pages/ComponentDetail.vue'),
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
