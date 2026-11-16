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

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog
  },
  {
    path: '/blog/:id',
    name: 'ArticleDetail',
    component: ArticleDetail
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects
  },
  {
    path: '/music',
    name: 'Music',
    component: Music
  },
  {
    path: '/music/play',
    name: 'MusicPlay',
    component: MusicPlay
  },
  {
    path: '/components',
    name: 'Components',
    component: Components
  },
  {
    path: '/components/:id',
    name: 'ComponentDetail',
    component: ComponentDetail
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

export default router
