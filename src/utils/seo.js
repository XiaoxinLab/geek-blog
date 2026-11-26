//
// 页面标题和分享标签（OG / Twitter）的统一处理
//
// 说明：index.html 里有一份静态的默认值兜底，
//       路由切换时再按当前页面更新，这样分享出去的链接才有标题和摘要。
//

const SITE_NAME = 'QiSui.BLOG'
const SITE_URL = 'https://qisui.asia'
const DEFAULT_DESCRIPTION =
  '七岁的前端技术笔记，记录 Vue、React、TypeScript、Node.js 等技术栈的实践与踩坑。'
const DEFAULT_IMAGE = SITE_URL + '/images/image.png'

/**
 * 找到或者创建一个 meta 标签
 * @param {string} key - 属性名，name 用 name，og 用 property
 * @param {string} value - 属性值
 * @returns {void}
 */
function setMeta(key, value) {
  const attr = key.startsWith('og:') ? 'property' : 'name'
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', value)
}

/**
 * 把图片地址补成完整网址
 * 说明：接口返回的封面图只是文件名，比如 abc.png，
 *       分享卡片需要能直接访问的完整地址。
 * @param {string} src - 图片地址
 * @returns {string} 完整网址
 */
function absoluteImage(src) {
  if (!src) return DEFAULT_IMAGE
  if (/^https?:\/\//.test(src)) return src
  if (src.startsWith('/')) return SITE_URL + src
  return SITE_URL + '/upload/' + src
}

/**
 * 更新页面标题
 * @param {string} title - 页面标题，不带站点名
 * @returns {void}
 */
function setTitle(title) {
  document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME
}

/**
 * 更新分享标签
 * @param {object} options - 标题、摘要、图片、网址
 * @param {string} [options.title] - 页面标题
 * @param {string} [options.description] - 页面摘要
 * @param {string} [options.image] - 分享封面图
 * @param {string} [options.url] - 页面地址
 * @param {string} [options.type] - og:type，文章页用 article
 * @returns {void}
 */
export function setPageMeta(options = {}) {
  const title = options.title || ''
  const description = options.description || DEFAULT_DESCRIPTION
  const image = absoluteImage(options.image)
  const url = options.url || location.href.split('#')[0]
  const type = options.type || 'website'

  setTitle(title)

  setMeta('description', description)
  setMeta('og:type', type)
  setMeta('og:title', title ? `${title} · ${SITE_NAME}` : SITE_NAME)
  setMeta('og:description', description)
  setMeta('og:url', url)
  setMeta('og:image', image)
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', title ? `${title} · ${SITE_NAME}` : SITE_NAME)
  setMeta('twitter:description', description)
  setMeta('twitter:image', image)

  // canonical 告诉搜索引擎哪个地址是正版
  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', url)
  canonical.setAttribute('data-page', url)
}

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, DEFAULT_IMAGE }
