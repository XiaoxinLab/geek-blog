# 🚀 Geek Blog - 现代化极客博客系统

## 📋 项目概述

**Geek Blog** 是一个基于 **Vue 3 + Vite** 构建的现代化个人博客平台，采用前后端分离架构，具备完整的文章管理、搜索筛选、国际化支持等功能。项目展示了前端工程化实践、API 集成能力以及用户体验优化技巧。

**在线演示**: [https://local-upload-1777731673021-h79w6meeje.edgeone.cool](https://local-upload-1777731673021-h79w6meeje.edgeone.cool)

---

## 🛠 技术栈

### 核心框架
- **Vue 3** (Composition API + `<script setup>`)
- **Vite 5** - 新一代构建工具
- **Vue Router 4** - 路由管理
- **Pinia/Vuex** - 状态管理（可选）

### UI & 样式
- **CSS Variables** - 主题变量系统
- **Scoped CSS** - 组件样式隔离
- **响应式设计** - 移动端适配
- **深色/浅色主题** - 动态主题切换

### 功能库
- **vue-i18n** - 国际化（中英文）
- **markdown-it** - Markdown 渲染
- **highlight.js** - 代码语法高亮
- **@vueuse/core** - 组合式工具函数

### HTTP & API
- **Axios** - HTTP 请求封装
- **Koa.js 后端** - Node.js API 服务
- **Sequelize ORM** - 数据库操作
- **JWT 认证** - 用户鉴权

### 部署 & DevOps
- **EdgeOne Pages** - CDN 加速部署
- **Nodemon** - 开发热重载
- **ESLint/Prettier** - 代码规范（可配置）

---

## ✨ 核心功能与实现

### 1️⃣ 文章管理系统
```javascript
// 动态数据获取与状态管理
const fetchPosts = async () => {
  const response = await articleService.getArticles()
  posts.value = response.map(article => transformArticleData(article))
}
```

**技术亮点**:
- ✅ **API 数据驱动**: 从静态 JSON 迁移到 RESTful API
- ✅ **智能降级机制**: API 失败时自动回退本地数据
- ✅ **数据格式转换**: 统一后端字段映射到前端模型
- ✅ **加载状态管理**: Loading/Error/Empty 三态处理

### 2️⃣ 高级搜索功能
```javascript
// 防抖搜索优化 (500ms)
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchArticles(searchKeyword.value)
  }, 500)
}
```

**性能优化**:
- ⚡ **防抖处理**: 避免频繁请求
- ⚡ **实时过滤**: 分类 + 关键词联动
- ⚡ **缓存策略**: 相同搜索结果复用

### 3️⃣ Markdown 渲染引擎
```javascript
// 自定义 Markdown 渲染配置
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    // 代码高亮集成
    return hljs.highlight(str, { language: lang }).value
  }
})
```

**渲染特性**:
- 🎨 **语法高亮**: One Dark Pro 配色方案
- 📱 **代码块优化**: 细滚动条 (6px)、语言标识
- 🔗 **智能链接**: 自动识别 URL 和邮箱
- 📊 **表格/引用**: 完整 Markdown 支持

### 4️⃣ 国际化 (i18n)
```json
// zh.json / en.json 双语支持
{
  "blog": {
    "title": "博客文章",
    "searchPlaceholder": "搜索文章...",
    "loading": "正在加载文章..."
  }
}
```

**多语言支持**:
- 🌏 中英文无缝切换
- 🔄 动态文本插值
- 📝 组件级语言包管理

### 5️⃣ Axios 封装层
```javascript
// 请求/响应拦截器
api.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response.data, // 自动解包
  error => handleError(error) // 统一错误处理
)
```

**HTTP 层设计**:
- 🔐 Token 自动注入
- 📦 响应数据解包
- ❌ 错误码分类处理 (401/403/404/500)
- ⏱ 超时控制 (10s)

---

## 🎨 UI/UX 设计亮点

### 视觉设计
- **赛博朋克风格**: 深色背景 + 霓虹色调
- **渐变光效**: CSS radial-gradient 背景
- **微交互**: hover 动画、过渡效果
- **字体系统**: JetBrains Mono (代码) + Space Grotesk (标题)

### 响应式布局
```css
/* 移动优先的断点设计 */
.blog-layout {
  grid-template-columns: 260px 1fr; /* 桌面端 */
}

@media (max-width: 900px) {
  .blog-layout { grid-template-columns: 1fr } /* 移动端 */
}
```

**适配范围**:
- 🖥️ Desktop (>1200px): 双栏布局
- 💻 Tablet (768-1199px): 自适应调整
- 📱 Mobile (<768px): 单栏堆叠

### 性能优化
- **代码分割**: 路由懒加载
- **资源压缩**: Gzip/Brotli
- **图片优化**: WebP 格式支持
- **CSS 优化**: Scoped 减少样式冲突

---

## 📁 项目结构

```
geek-blog/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Navbar.vue       # 导航栏
│   │   └── Footer.vue       # 页脚
│   ├── pages/               # 页面组件
│   │   ├── Home.vue         # 首页
│   │   ├── Blog.vue         # 博客列表 (API 集成)
│   │   ├── ArticleDetail.vue # 文章详情 (Markdown 渲染)
│   │   ├── Projects.vue     # 项目展示
│   │   └── About.vue        # 关于页
│   ├── services/            # API 服务层
│   │   └── articleService.js # 文章接口封装
│   ├── utils/               # 工具函数
│   │   ├── api.js           # Axios 实例配置
│   │   └── markdown.js      # MD 渲染器
│   ├── locales/             # 国际化
│   │   ├── zh.js            # 中文
│   │   └── en.js            # 英文
│   ├── composables/         # 组合式函数
│   │   └── useTheme.js      # 主题切换
│   ├── router/              # 路由配置
│   └── style.css            # 全局样式 + CSS 变量
├── dist/                    # 构建产物 (部署到 EdgeOne)
└── vite.config.js           # Vite 配置
```

---

## 🚀 部署架构

```
┌─────────────────────────────────────┐
│        用户浏览器 (Client)           │
└─────────────┬───────────────────────┘
              │ HTTPS
              ▼
┌─────────────────────────────────────┐
│     EdgeOne Pages (CDN 边缘节点)     │
│  • 全球加速                         │
│  • SSL/TLS 自动证书                  │
│  • 静态资源缓存                      │
└─────────────┬───────────────────────┘
              │ API 请求
              ▼
┌─────────────────────────────────────┐
│     Koa.js Backend (:1011)          │
│  • RESTful API                      │
│  • MySQL 数据库                     │
│  • JWT 认证                        │
└─────────────────────────────────────┘
```

**部署流程**:
1. `npm run build` → Vite 生产构建
2. `dist/` 目录上传至 EdgeOne COS
3. CDN 自动分发到全球边缘节点
4. DNS 解析到 EdgeOne 域名

---

## 💼 项目价值与收获

### 技术成长点

#### 1. **工程化思维**
- 学会了从零搭建完整的前后端项目
- 掌握了 Vite 构建优化和插件配置
- 理解了模块化设计和代码分层

#### 2. **API 集成经验**
- 设计了健壮的错误处理机制
- 实现了数据格式转换和兼容性处理
- 掌握了 Token 管理和认证流程

#### 3. **性能优化实践**
- 代码分割减少首屏加载时间
- 防抖搜索避免请求风暴
- CSS 作用域隔离提升渲染效率

#### 4. **用户体验打磨**
- 加载状态的三态设计 (Loading/Error/Empty)
- 响应式布局的多设备适配
- 无障碍访问 (ARIA) 的初步考虑

#### 5. **DevOps 能力**
- 使用 EdgeOne Pages 实现 CI/CD
- 环境变量管理 (.env)
- 生产构建 vs 开发环境的差异处理

---

## 🎯 核心竞争力展示

| 能力维度 | 具体体现 | 技术关键词 |
|---------|---------|-----------|
| **框架掌握** | Vue 3 全家桶熟练使用 | Composition API, Router, i18n |
| **工程规范** | 清晰的目录结构和命名约定 | MVC 分层, Service 层抽象 |
| **问题解决** | API 兼容性和错误降级 | try-catch, fallback 机制 |
| **性能意识** | 防抖、懒加载、代码分割 | Debounce, Lazy-loading |
| **视觉审美** | 赛博朋克风格 UI 设计 | CSS Variables, Gradient |
| **部署运维** | EdgeOne Pages 一键部署 | CDN, SSL, CI/CD |

---

## 🔮 未来迭代方向

- [ ] **PWA 支持**: Service Worker 离线缓存
- [ ] **SSR 渲染**: Nuxt 3 服务端渲染提升 SEO
- [ ] **评论系统**: 集成 Gitalk 或 Valine
- [ ] **RSS 订阅**: 自动生成 Feed
- [ ] **全文检索**: Elasticsearch 或 Algolia
- [ ] **自动化测试**: Vitest + Cypress E2E
- [ ] **监控告警**: Sentry 错误追踪
- [ ] **性能分析**: Lighthouse CI 集成

---

## 📞 联系方式

- **GitHub**: [你的 GitHub 地址]
- **邮箱**: [你的邮箱]
- **个人网站**: [部署地址]

---

## 📄 许可证

MIT License © 2024 [你的名字]

---

> 💡 **提示**: 此项目可作为前端工程师求职的作品集展示项目，建议在面试中重点讲解：
> 1. **API 集成的难点和解决方案**
> 2. **性能优化的具体措施和效果**
> 3. **组件设计的复用性和扩展性**
> 4. **从需求分析到上线的完整流程**

**祝你在技术道路上越走越远！🚀**
