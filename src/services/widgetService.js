import api from '../utils/api.js'

// 组件相关 API
export const widgetService = {
  /**
   * 获取全部启用的组件
   * 说明：请求成功就返回数组（可能是空的，说明后台一个都没开放），
   *       请求失败会把错误抛出去，交给调用方决定要不要用本地数据兜底。
   *       这两种情况必须分开，不然后台全禁用时前台会回退到本地数据，
   *       把关掉的组件又显示出来。
   * @returns {Promise<object[]>} 组件数组
   * @throws {Error} 接口调不通时抛错
   */
  async getWidgets() {
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

    throw new Error(response.message || '获取组件列表失败')
  },

  /**
   * 获取已启用的组件数量
   * 说明：跟 getWidgets 用同一个接口，返回数组多长就是多少个。
   * @returns {Promise<number|null>} 组件数量，接口失败返回 null
   */
  async getWidgetCount() {
    try {
      const response = await api.get('/widget/public')

      if (response.code === 0 && Array.isArray(response.result)) {
        return response.result.length
      }

      return null
    } catch (error) {
      console.error('获取组件数量失败:', error)
      return null
    }
  },

  /**
   * 获取单个组件详情
   * 说明：跟 getWidgets 一样，成功返回数据、失败抛错。
   *       组件被后台禁用时接口会返回「没有这个组件」，属于正常情况。
   * @param {string} key - 组件标识，例如 buttons
   * @returns {Promise<object>} 组件数据
   * @throws {Error} 接口调不通，或组件不存在时抛错
   */
  async getWidget(key) {
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

    // 说明：组件被后台禁用时接口会返回「没有这个组件」，
    //       这不是接口故障，标记一下，调用方不要拿本地数据兜底。
    const error = new Error(response.message || '没有找到这个组件')
    error.notFound = true
    throw error
  }
}

export default widgetService
