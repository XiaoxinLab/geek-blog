import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="code-block"><code class="hljs language-' +
          lang + '">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
      } catch (_) {}
    }
    return '<pre class="code-block"><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

export function renderMarkdown(content) {
  if (!content) return ''
  return md.render(content)
}

export default md
