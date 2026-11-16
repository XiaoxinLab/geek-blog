<template>
  <div class="detail-page">
    <header class="detail-header">
      <div class="container">
        <button class="back-btn" type="button" @click="goBack">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span>{{ t('components.back') }}</span>
        </button>

        <div v-if="widget" class="title-row">
          <div class="title-meta">
            <span class="widget-num">{{ numLabel }}</span>
            <div>
              <h1 class="detail-title">{{ widget.title }}</h1>
              <p class="detail-desc">{{ widget.desc }}</p>
            </div>
          </div>
          <button class="copy-all-btn" type="button" @click="copyAll">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>{{ t('components.copyAll') }}</span>
          </button>
        </div>
      </div>
    </header>

    <section v-if="widget" class="detail-content">
      <div class="container">
        <div class="detail-grid">
          <div class="code-panel">
            <div class="code-tabs" role="tablist">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                role="tab"
                :aria-selected="currentTab === tab.id"
                :class="['code-tab', { active: currentTab === tab.id }]"
                @click="currentTab = tab.id"
              >{{ tab.label }}</button>
            </div>
            <pre class="code-block hljs"><code v-html="highlightedCode"></code></pre>
          </div>

          <div class="preview-panel">
            <div class="preview-label">{{ t('components.preview') }}</div>
            <div class="preview-stage">
              <component :is="widget.component" @toast="showToast" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-else class="empty">
      <div class="container">{{ t('components.notFound') }}</div>
    </div>

    <Transition name="toast">
      <div v-if="toast.visible" class="toast">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import hljs from "highlight.js/lib/core"
import htmlLang from "highlight.js/lib/languages/xml"
import cssLang from "highlight.js/lib/languages/css"
import jsLang from "highlight.js/lib/languages/javascript"
import { widgets as fallbackWidgets, attachRenderers } from "../data/widgets.js"
import { widgetService } from "../services/widgetService.js"
import { copyText } from "../utils/clipboard.js"

// 只注册我们用得到的语言,控制打包体积
hljs.registerLanguage("html", htmlLang)
hljs.registerLanguage("xml", htmlLang)
hljs.registerLanguage("css", cssLang)
hljs.registerLanguage("javascript", jsLang)
hljs.registerLanguage("js", jsLang)

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

/** 全部组件数据 */
const widgetList = ref([])
/** 当前路由对应的 widget 实体(找不到时为 null) */
const widget = computed(() => widgetList.value.find(w => w.id === route.params.id) || null)
/** 当前 widget 在列表中的索引(用于展示编号) */
const idx = computed(() => widgetList.value.findIndex(w => w.id === route.params.id))
/** 编号字符串,如 01 / 02 */
const numLabel = computed(() => String(idx.value + 1).padStart(2, "0"))

/**
 * 拉组件数据：优先用接口，失败就退回本地写死的那份
 * @returns {Promise<void>} 加载结束后结束
 */
async function loadWidget() {
  const fromApi = await widgetService.getWidget(route.params.id)
  if (fromApi) {
    const attached = attachRenderers([fromApi])
    widgetList.value = attached.length ? attached : fallbackWidgets
    return
  }

  console.warn('接口没拿到组件，使用本地数据')
  widgetList.value = fallbackWidgets
}

onMounted(loadWidget)

const currentTab = ref("html")
/** 当前 widget 可用的代码 tab(根据 code 字段动态生成) */
const tabs = computed(() => {
  if (!widget.value) return []
  const list = [{ id: "html", label: "HTML" }]
  if (widget.value.code.css) list.push({ id: "css", label: "CSS" })
  if (widget.value.code.js) list.push({ id: "js", label: "JS" })
  return list
})

/**
 * 把当前 tab 的代码片段交给 highlight.js 着色。
 * 失败时降级为 HTML 实体转义,保证页面仍可读。
 * @returns {string} 可直接通过 v-html 渲染的 HTML 字符串
 */
const highlightedCode = computed(() => {
  if (!widget.value) return ""
  const code = widget.value.code[currentTab.value] || ""
  if (!code) return ""
  try {
    return hljs.highlight(code, { language: currentTab.value, ignoreIllegals: true }).value
  } catch (err) {
    console.warn("[highlight] fallback to escape", err)
    return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }
})

/**
 * 把 widget 的 html/css/js 拼成可独立运行的完整 HTML 字符串。
 * @returns {string} 完整 HTML 字符串
 */
function buildFullHtml() {
  if (!widget.value) return ""
  const c = widget.value.code
  let s = "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n<meta charset=\"UTF-8\">\n<title>" + widget.value.title + "</title>\n<style>\n" + (c.css || "") + "\n</style>\n</head>\n<body>\n" + c.html
  if (c.js) s += "\n<script>\n" + c.js + "\n<\/script>"
  s += "\n</body>\n</html>"
  return s
}

/**
 * 复制完整 HTML 到剪贴板,使用 utils/clipboard 中带降级的实现。
 * @returns {Promise<void>}
 */
async function copyAll() {
  try {
    await copyText(buildFullHtml())
    showToast(t("components.copySuccess"))
  } catch (err) {
    console.error("[copyAll] failed", err)
    showToast(t("components.copyFailed"))
  }
}

/* ============ Toast ============ */
const toast = reactive({ visible: false, message: "" })
let toastTimer = null
/**
 * 显示一条 toast 提示。
 * @param {string} msg 提示文本
 * @returns {void}
 */
function showToast(msg) {
  toast.message = msg
  toast.visible = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.visible = false }, 1800)
}

/**
 * 返回组件列表页。
 * @returns {void}
 */
function goBack() {
  router.push("/components")
}
</script>

<style scoped>
/* ============ 页面骨架 ============ */
.detail-page { padding-top: 80px; }
.detail-header { padding: 2.5rem 0 2rem; border-bottom: 1px solid var(--border-color); }

.back-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 0.9rem; margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary); color: var(--text-secondary);
  font-family: var(--font-mono); font-size: 0.8rem;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.back-btn:hover { color: var(--accent-cyan); border-color: var(--accent-cyan); }

.title-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1.5rem; flex-wrap: wrap;
}
.title-meta { display: flex; align-items: center; gap: 1rem; }
.detail-title {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2.4rem);
  font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem;
  line-height: 1.2;
}
.detail-desc { color: var(--text-secondary); font-size: 0.95rem; }
.widget-num {
  font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700;
  color: var(--accent-cyan); line-height: 1; flex-shrink: 0;
}

.copy-all-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  border: 0;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-cyan-hover));
  color: var(--bg-primary);
  font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 212, 255, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.copy-all-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 212, 255, 0.3); }
.copy-all-btn:focus-visible { outline: 2px solid var(--accent-cyan); outline-offset: 2px; }

.detail-content { padding: 2.5rem 0 5rem; }
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: stretch;
}

/* ============ 代码面板 ============ */
.code-panel {
  display: flex; flex-direction: column;
  min-height: 480px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  overflow: hidden;
}
.code-tabs {
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}
.code-tab {
  padding: 0.65rem 1.1rem;
  border: 0;
  background: transparent;
  font-family: var(--font-mono); font-size: 0.78rem;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}
.code-tab:hover { color: var(--text-primary); }
.code-tab.active {
  color: var(--accent-cyan);
  border-bottom-color: var(--accent-cyan);
  background: var(--bg-tertiary);
}
.code-block {
  flex: 1;
  margin: 0;
  padding: 1.25rem 1.4rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-family: var(--font-mono); font-size: 0.8rem;
  line-height: 1.65;
  overflow: auto;
  white-space: pre;
  counter-reset: line;
}
.code-block code { display: block; }

/* ============ 预览面板 ============ */
.preview-panel {
  display: flex; flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  overflow: hidden;
}
.preview-label {
  padding: 0.65rem 1.1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  font-family: var(--font-mono); font-size: 0.78rem;
  color: var(--text-muted);
  letter-spacing: 0;
}
.preview-stage {
  flex: 1;
  padding: 1.75rem 1.5rem;
  background: var(--bg-tertiary);
  min-height: 380px;
  display: flex; align-items: center; justify-content: center;
}

.empty { padding: 6rem 0; text-align: center; color: var(--text-muted); }

/* ============ Toast ============ */
.toast {
  position: fixed; bottom: 30px; left: 50%;
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border: 1px solid var(--border-color); border-radius: var(--radius-md);
  background: var(--bg-card); color: var(--text-primary);
  box-shadow: var(--shadow-card), 0 0 24px rgba(0, 212, 255, 0.1);
  font-family: var(--font-mono); font-size: 0.85rem;
  z-index: 9999;
  transform: translateX(-50%);
}
.toast svg { color: var(--accent-green); flex-shrink: 0; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
.toast-enter-to, .toast-leave-from { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ============ 响应式 ============ */
@media (max-width: 900px) {
  .detail-grid { grid-template-columns: 1fr; }
  .code-panel { min-height: 360px; }
}
</style>