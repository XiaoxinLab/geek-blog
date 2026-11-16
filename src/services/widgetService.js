import api from '../utils/api.js'

// 组件相关 API
export const widgetService = {
  /**
   * 获取全部启用的组件
   * @returns {Promise<object[]>} 组件数组，失败时返回空数组
   */
  async getWidgets() {
    try {
      const response = await api.get('/widget/public')

      if (response.code === 0 && Array.isArray(response.result)) {
        return response.result.map((item) => ({
          id: item.widget_key,
          title: item.title,
          desc: item.desc || '',
          category: item.category || 'visual',
          sortOrder: Number(item.sort_order ?? 0),
          code: {
            html: item.code_html || '',
            css: item.code_css || '',
            js: item.code_js || ''
          }
        }))
      }

      return []
    } catch (error) {
      console.error('获取组件列表失败:', error)
      return []
    }
  },

  /**
   * 获取单个组件详情
   * @param {string} key - 组件标识，例如 buttons
   * @returns {Promise<object|null>} 组件数据，取不到返回 null
   */
  async getWidget(key) {
    try {
      const response = await api.get(`/widget/public/findOne/${key}`)

      if (response.code === 0 && response.result) {
        const item = response.result
        return {
          id: item.widget_key,
          title: item.title,
          desc: item.desc || '',
          category: item.category || 'visual',
          sortOrder: Number(item.sort_order ?? 0),
          code: {
            html: item.code_html || '',
            css: item.code_css || '',
            js: item.code_js || ''
          }
        }
      }

      return null
    } catch (error) {
      console.error('获取组件详情失败:', error)
      return null
    }
  }
}

export default widgetService
