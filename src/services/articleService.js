import api from '../utils/api.js'

// 文章相关 API
export const articleService = {
  // 获取文章列表（统一接口：支持分类筛选 + 关键字搜索）
  async getArticles(params = {}) {
    try {
      console.log('=== 前端调用 /article/ 统一接口 ===')
      console.log('请求参数:', params)
      
      const response = await api.get('/article/', { params })
      
      // 后端返回格式：{code: 0, message: "...", result: {list: [...], ...}}
      if (response.code === 0 && response.result?.list) {
        console.log('✅ 接口返回成功，文章数量:', response.result.list.length)
        return this.transformArticleList(response.result.list)
      }
      
      // 如果返回的是数组，直接处理
      if (Array.isArray(response)) {
        return this.transformArticleList(response)
      }
      
      // 其他情况尝试提取数据
      return []
    } catch (error) {
      console.error('获取文章列表失败:', error)
      throw error
    }
  },

  // 获取单个文章详情
  async getArticleById(id) {
    try {
      const response = await api.get(`/article/findOne/${id}`)
      
      // 后端可能返回 {code: 0, result: {...}} 或直接返回对象
      const articleData = response.result || response
      return this.transformArticle(articleData)
    } catch (error) {
      console.error('获取文章详情失败:', error)
      throw error
    }
  },

  // 按分类获取文章
  async getArticlesByCategory(category) {
    try {
      const response = await api.get(`/article/findByCategory/${category}`)
      
      if (response.code === 0 && response.result?.list) {
        return this.transformArticleList(response.result.list)
      }
      
      if (Array.isArray(response)) {
        return this.transformArticleList(response)
      }
      
      return []
    } catch (error) {
      console.error('按分类获取文章失败:', error)
      throw error
    }
  },

  // 模糊搜索文章（支持关键字 + 分类联合查询）
  async searchArticles(keyword, classification = '') {
    try {
      const params = {}
      if (classification) {
        params.article_classification = classification
      }
      
      console.log('=== 前端搜索请求 ===')
      console.log('关键字:', keyword)
      console.log('分类:', classification)
      console.log('请求参数:', params)
      
      const response = await api.get(`/article/fuzzyKeywords/${keyword}`, { params })
      
      // 搜索接口可能返回数组或对象
      if (response.code === 0 && response.result?.list) {
        console.log('搜索结果数量:', response.result.list.length)
        return this.transformArticleList(response.result.list)
      }
      
      if (Array.isArray(response)) {
        return this.transformArticleList(response)
      }
      
      // 如果 result 直接是数组
      if (Array.isArray(response.result)) {
        return this.transformArticleList(response.result)
      }
      
      return []
    } catch (error) {
      console.error('搜索文章失败:', error)
      throw error
    }
  },

  // 上传图片（需要认证）
  async uploadImage(formData) {
    try {
      const response = await api.post('/article/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response
    } catch (error) {
      console.error('上传图片失败:', error)
      throw error
    }
  },
  
  // 转换单个文章数据格式（后端字段 -> 前端字段）
  transformArticle(article) {
    return {
      id: article.id,
      title: article.article_title || article.title || '未命名文章',
      excerpt: article.content?.substring(0, 150) + '...' || 
               article.article_content?.substring(0, 150) + '...' ||
               '暂无摘要',
      category: article.article_classification || article.category || '未分类',
      date: article.createdAt || 
            article.created_at || 
            article.date || 
            new Date().toISOString().split('T')[0],
      author: article.article_author || article.author || '七岁',
      content: article.content || article.article_content || '',
      file_url: article.article_file_url || ''
    }
  },
  
  // 转换文章列表
  transformArticleList(list) {
    return list.map(article => this.transformArticle(article))
  },

  // 获取字典数据（分类列表）
  async getDictionaryByType(type) {
    try {
      const response = await api.get(`/dictionary/findByType/${type}`)
      
      if (response.code === 0 && response.result) {
        return response.result.map(item => ({
          key: item.dict_key,
          value: item.dict_key,
          label: item.dict_value,
          sortOrder: item.sort_order
        })).sort((a, b) => a.sortOrder - b.sortOrder)
      }
      
      return []
    } catch (error) {
      console.error('获取字典数据失败:', error)
      return this.getDefaultCategories()
    }
  },

  // 获取默认分类（作为后备方案）
  getDefaultCategories() {
    return [
      { key: 'all', value: 'all', label: '全部', sortOrder: 0 },
      { key: 'frontend', value: 'frontend', label: '前端开发', sortOrder: 1 },
      { key: 'backend', value: 'backend', label: '后端开发', sortOrder: 2 },
      { key: 'devops', value: 'devops', label: 'DevOps', sortOrder: 3 },
      { key: 'architecture', value: 'architecture', label: '架构设计', sortOrder: 4 },
      { key: 'rust', value: 'rust', label: 'Rust', sortOrder: 5 }
    ]
  }
}

// 用户相关 API
export const userService = {
  // 用户注册
  async register(userData) {
    try {
      const response = await api.post('/user/register', userData)
      return response
    } catch (error) {
      console.error('用户注册失败:', error)
      throw error
    }
  },

  // 用户登录
  async login(credentials) {
    try {
      const response = await api.post('/user/login', credentials)
      
      // 保存 token 到本地存储
      if (response.token) {
        localStorage.setItem('token', response.token)
      }
      
      return response
    } catch (error) {
      console.error('用户登录失败:', error)
      throw error
    }
  },

  // 手机号登录
  async loginWithPhone(phone) {
    try {
      const response = await api.post(`/user/login/phone/${phone}`)
      
      // 保存 token 到本地存储
      if (response.token) {
        localStorage.setItem('token', response.token)
      }
      
      return response
    } catch (error) {
      console.error('手机号登录失败:', error)
      throw error
    }
  },

  // 修改密码（需要认证）
  async changePassword(passwordData) {
    try {
      const response = await api.patch('/user/', passwordData)
      return response
    } catch (error) {
      console.error('修改密码失败:', error)
      throw error
    }
  },

  // 退出登录
  logout() {
    localStorage.removeItem('token')
  },

  // 检查是否已登录
  isLoggedIn() {
    return !!localStorage.getItem('token')
  }
}



// 访问量统计 API
export const visitService = {
  // 记录页面访问
  async recordVisit(pagePath, pageTitle) {
    try {
      const response = await api.post('/visit/record', {
        pagePath,
        pageTitle
      })
      return response
    } catch (error) {
      console.error('记录访问失败:', error)
      // 静默失败，不影响用户体验
      return null
    }
  },

  // 获取访问统计数据
  async getVisitStats(days = 7) {
    try {
      const response = await api.get(`/visit/stats?days=${days}`)
      return response.result || response
    } catch (error) {
      console.error('获取访问统计失败:', error)
      throw error
    }
  },

  // 获取总访问量
  async getTotalVisits() {
    try {
      const response = await api.get('/visit/total')
      return response.result?.totalVisits || 0
    } catch (error) {
      console.error('获取总访问量失败:', error)
      throw error
    }
  }
}


export default {
  articleService,
  userService,
  visitService
}