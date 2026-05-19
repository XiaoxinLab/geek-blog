# Geek Blog

基于 **Vue 3 + Vite** 构建的现代化极客风格个人博客。

## 技术栈

- **Vue 3** (Composition API + `<script setup>`)
- **Vite 5** - 构建工具
- **Vue Router 4** - 路由管理
- **vue-i18n** - 国际化（中/英）
- **markdown-it + highlight.js** - Markdown 渲染与代码高亮
- **Axios** - HTTP 请求
- **@vueuse/core** - 组合式工具函数

## 功能特性

- 博客文章列表与详情展示
- 文章分类筛选与关键词搜索（防抖）
- Markdown 渲染 + 代码语法高亮
- 项目展示
- 中英文双语切换
- 深色/浅色主题切换
- 背景粒子动画
- 音乐播放器
- 响应式布局

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 构建开发版本
npm run build:dev
```

## 项目结构

```
geek-blog/
├── src/
│   ├── components/      # 可复用组件 (Navbar, Footer, MusicPlayer)
│   ├── composables/     # 组合式函数 (useTheme, usePageVisit)
│   ├── data/            # 静态数据
│   ├── locales/         # 国际化 (zh, en)
│   ├── pages/           # 页面组件
│   ├── router/          # 路由配置
│   ├── services/        # API 服务层
│   └── utils/           # 工具函数 (api, markdown)
├── public/              # 静态资源
└── vite.config.js
```

## 详细文档

更多技术细节请参阅 [PROJECT_README.md](./PROJECT_README.md)。