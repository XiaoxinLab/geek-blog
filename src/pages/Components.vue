<template>
  <div class="components-page">
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">
          <span class="title-prefix">//</span> {{ t("components.title") }}
        </h1>
        <p class="page-desc">{{ t("components.desc") }}</p>
      </div>
    </section>

    <section class="components-content">
      <div class="container">
        <!-- 一个组件都没有的时候，给个说明，别显示一堆空分类 -->
        <div v-if="!hasAnyWidget" class="components-empty">
          {{ t("components.empty") }}
        </div>

        <div
          v-for="(group, key) in groupedWidgets"
          :key="key"
          class="category-section"
        >
          <h2 class="category-title">
            <span class="cat-prefix">//</span>
            <span>{{ categoryName(group) }}</span>
            <span class="cat-count">{{ group.items.length }}</span>
          </h2>
          <div class="components-grid">
            <article
              v-for="(widget, idx) in group.items"
              :key="widget.id"
              class="widget-card"
              :style="{ '--delay': idx * 0.06 + 's' }"
            >
              <div class="widget-demo">
                <component :is="widget.component" @toast="showToast" />
              </div>
              <button type="button" class="widget-footer" @click="goDetail(widget.id)">
                <div class="widget-meta">
                  <span class="widget-num">{{ String(idx + 1).padStart(2, '0') }}</span>
                  <h3 class="widget-title">{{ widget.title }}</h3>
                </div>
                <span class="widget-arrow" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </button>
            </article>
          </div>
        </div>
      </div>
    </section>

    <Transition name="toast">
      <div v-if="toast.visible" class="toast">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>
<script setup>
import { reactive, computed, ref, onMounted } from "vue"
import { widgets as fallbackWidgets, attachRenderers } from "../data/widgets.js"
import { widgetService } from "../services/widgetService.js"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

const { t } = useI18n()
const router = useRouter()

/* ========== Toast 反馈 ========== */
const toast = reactive({ visible: false, message: "" })
let toastTimer = null
/**
 * 显示一条 toast 提示
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
 * 跳转到组件详情页
 * @param {string} id 组件 id
 * @returns {void}
 */
function goDetail(id) {
  router.push("/components/" + id)
}

/* ========== 组件列表 ========== */
/** 接口拿到的组件（带渲染器），拿不到时用本地数据兜底 */
const widgetList = ref([])
/** 是否正在加载 */
const loading = ref(true)

/**
 * 拉组件列表
 * 说明：接口能通就用接口的数据，哪怕一条都没有（说明后台全禁用了）；
 *       只有接口调不通时才退回本地写死的那份，别让关掉的组件又冒出来。
 * @returns {Promise<void>} 加载结束后结束
 */
async function loadWidgets() {
  loading.value = true
  try {
    const fromApi = await widgetService.getWidgets()
    widgetList.value = attachRenderers(fromApi)
  } catch (error) {
    console.error('获取组件失败，使用本地数据:', error)
    widgetList.value = fallbackWidgets
  } finally {
    loading.value = false
  }
}

/* ========== 按分类分组 ========== */
// 预设的分类顺序，只影响展示先后
const categoryOrder = ["basics", "interactive", "data", "visual"]

/**
 * 按分类把组件分组
 * 说明：只保留有组件的分类，没内容的分类整段不显示，
 *      这样后台关掉几个组件，前台就少几个分类，跟数据保持一致。
 * @returns {object} key 为分类 id, value 为该分类下的组件数组
 */
const groupedWidgets = computed(() => {
  const groups = {}
  for (const w of widgetList.value) {
    const cat = w.category || "visual"
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(w)
  }

  // 预设分类按顺序排在前头，后台新加的分类按字母排在后面
  const known = categoryOrder.filter((cat) => groups[cat])
  const extra = Object.keys(groups)
    .filter((cat) => !categoryOrder.includes(cat))
    .sort()

  const result = {}
  for (const cat of [...known, ...extra]) {
    result[cat] = { items: groups[cat], labelKey: "cat" + cat.charAt(0).toUpperCase() + cat.slice(1) }
  }
  return result
})

/**
 * 有没有组件可显示
 * @returns {boolean} 至少有一个组件返回 true
 */
const hasAnyWidget = computed(() => widgetList.value.length > 0)

/**
 * 分类的中文名
 * 说明：优先用多语言里的翻译，翻译没有就用分类原文
 * @param {object} group - 分类信息
 * @returns {string} 分类显示名
 */
function categoryName(group) {
  return t("components." + group.labelKey, group.labelKey.replace(/^cat/, ""))
}

onMounted(loadWidgets)
</script>

<style scoped>
/* ============ 页面骨架 ============ */
.components-page { padding-top: 80px; }
.page-header { padding: 4rem 0 2.5rem; border-bottom: 1px solid var(--border-color); }
.page-title {
  font-family: var(--font-mono);
  font-size: clamp(1.75rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 0.6rem;
  animation: titleIn 0.7s ease-out;
}
@keyframes titleIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.title-prefix { color: var(--accent-cyan); }
.page-desc {
  color: var(--text-secondary);
  font-size: 1rem;
  opacity: 0;
  animation: fadeIn 0.6s ease-out 0.2s forwards;
}
@keyframes fadeIn { to { opacity: 1; } }
.components-content { padding: 2.5rem 0 5rem; }

/* ============ 卡片网格(预览为主) ============ */
/* ============ 空状态 ============ */
.components-empty {
  padding: 4rem 0;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-muted);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
}

/* ============ 分类小标题 ============ */
.category-section { margin-bottom: 3rem; }
.category-section:last-child { margin-bottom: 0; }
.category-title {
  display: flex; align-items: baseline; gap: .8rem;
  font-family: var(--font-mono); font-size: 1.05rem; font-weight: 700;
  color: var(--text-primary); margin: 0 0 1.2rem;
  padding-bottom: .6rem;
  border-bottom: 1px dashed var(--border-color);
}
.cat-prefix { color: var(--accent-cyan); font-weight: 400; }
.cat-count {
  margin-left: auto;
  font: 500 .72rem/1 ui-monospace, monospace;
  color: var(--text-muted);
  background: var(--bg-tertiary); border: 1px solid var(--border-color);
  padding: .25rem .55rem; border-radius: 999px;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
.widget-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(20px);
  animation: cardIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0s) forwards;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}
@keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
.widget-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-glow);
  transform: translateY(-4px);
}
.widget-demo {
  padding: 1.5rem 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  flex: 0 0 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}
.widget-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.25rem;
  margin-top: auto;
  background: transparent;
  border: none;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
  border-radius: 6px;
  width: 100%;
  transition: background-color 0.2s ease;
}
.widget-footer:hover { background-color: rgba(0, 212, 255, 0.06); }
.widget-footer:focus { outline: none; }
.widget-footer:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}
.widget-meta { display: flex; align-items: center; gap: 0.8rem; min-width: 0; }
.widget-num {
  font-family: var(--font-mono);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent-cyan);
  line-height: 1;
  flex-shrink: 0;
}
.widget-title {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.widget-arrow {
  color: var(--text-muted);
  display: inline-flex;
  transition: color 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;
}
.widget-card:hover .widget-arrow { color: var(--accent-cyan); transform: translateX(4px); }
/* ============ Toast ============ */
.toast {
  position: fixed; bottom: 30px; left: 50%;
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: var(--bg-card); color: var(--text-primary);
  border: 1px solid var(--border-color); border-radius: var(--radius-md);
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
  .components-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
}
@media (max-width: 480px) {
  .widget-card { padding: 1rem; }
}
</style>