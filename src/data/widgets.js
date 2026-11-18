/**
 * 组件展示 - 共享数据源
 * Components.vue(列表)与 ComponentDetail.vue(详情)均从此处 import
 */
import { defineComponent, ref, reactive, computed, h, onMounted, onUnmounted } from "vue"

export const ButtonsGroup = () => h("div", { class: "demo-buttons" }, [
  h("button", { class: "btn-demo primary" }, "Primary"),
  h("button", { class: "btn-demo secondary" }, "Secondary"),
  h("button", { class: "btn-demo danger" }, "Danger"),
  h("button", { class: "btn-demo ghost" }, "Ghost"),
  h("button", { class: "btn-demo primary" }, [
    h("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", 'stroke-width': "2" }, [
      h("path", { d: "M5 12h14M12 5l7 7-7 7" })
    ]),
    "发送"
  ])
])

/* ======================================================
 * 2. 徽章
 * ====================================================== */

export const BadgesGroup = () => {
  const variants = [
    { cls: "default", label: "Default" },
    { cls: "success", label: "Success" },
    { cls: "warning", label: "Warning" },
    { cls: "danger", label: "Danger" },
    { cls: "info", label: "Info" }
  ]
  return h("div", { class: "demo-badges" }, [
    ...variants.map(v => h("span", { class: "badge-demo " + v.cls }, v.label)),
    h("span", { class: "badge-demo dot success" }, [h("span", { class: "dot" }), "在线"]),
    h("span", { class: "badge-demo dot danger" }, [h("span", { class: "dot" }), "离线"])
  ])
}

/* ======================================================
 * 3. 数字计数器(进入视口从 0 滚动到目标值)
 * ====================================================== */

export const CounterDemo = defineComponent({
  setup() {
  const counterRef = ref(null)
  const counterValue = ref(0)
  let started = false
  let raf = 0
  let observer = null

  function runCounter(target, duration = 1400) {
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      counterValue.value = Math.round(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }

  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      const e = entries[0]
      if (e.isIntersecting && !started) {
        started = true
        runCounter(12780)
        observer.disconnect()
      }
    }, { threshold: 0.4 })
    if (counterRef.value) observer.observe(counterRef.value)
  })
  onUnmounted(() => {
    if (raf) cancelAnimationFrame(raf)
    if (observer) observer.disconnect()
  })

  return () => h("div", { class: "demo-counter", ref: counterRef }, [
    h("div", { class: "counter-number" }, counterValue.value.toLocaleString()),
    h("div", { class: "counter-suffix" }, "行代码已提交")
  ])
  }
})
/* ======================================================
 * 4. 进度条
 * ====================================================== */

export const ProgressDemo = () => h("div", { class: "demo-progress" }, [
  { label: "Vue", value: 92, color: "cyan" },
  { label: "TypeScript", value: 78, color: "purple" },
  { label: "Node.js", value: 65, color: "green" },
  { label: "Rust", value: 24, color: "orange" }
].map((p, i) =>
  h("div", { class: "progress-row", key: i }, [
    h("div", { class: "progress-label" }, [
      h("span", null, p.label),
      h("span", { class: "progress-percent" }, p.value + "%")
    ]),
    h("div", { class: "progress-track" }, [
      h("div", {
        class: "progress-fill " + p.color,
        style: { width: p.value + "%" }
      })
    ])
  ])
))

/* ======================================================
 * 5. 打字机(逐字输入/删除 + 循环)
 * ====================================================== */

export const TypingDemo = defineComponent({
  setup() {
    const text = ref("")
    const idx = ref(0)
    const charIdx = ref(0)
    const deleting = ref(false)
    let timer = 0
    const phrases = ["Hello, World!", "前端工程师", "Vue 3 + Vite", "Code is poetry"]
    const tick = () => {
      const phrase = phrases[idx.value]
      if (!deleting.value) {
        charIdx.value++
        text.value = phrase.substring(0, charIdx.value)
        if (charIdx.value === phrase.length) {
          deleting.value = true
          timer = setTimeout(tick, 1500)
          return
        }
        timer = setTimeout(tick, 90)
      } else {
        charIdx.value--
        text.value = phrase.substring(0, charIdx.value)
        if (charIdx.value === 0) {
          deleting.value = false
          idx.value = (idx.value + 1) % phrases.length
          timer = setTimeout(tick, 400)
          return
        }
        timer = setTimeout(tick, 40)
      }
    }
    onMounted(() => { tick() })
    onUnmounted(() => clearTimeout(timer))
    return () => h("div", { class: "demo-typing" }, [
      h("span", { class: "typing-text" }, text.value),
      h("span", { class: "typing-cursor" }, "|")
    ])
  }
})

/* ======================================================
 * 6. 实时时钟
 * ====================================================== */

export const ClockDemo = defineComponent({
  setup() {
  const now = ref(new Date())
  let timer = 0
  onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 1000) })
  onUnmounted(() => clearInterval(timer))
  return () => {
    const d = now.value
    const pad = (n) => String(n).padStart(2, '0')
    const time = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())
    const date = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " 星期" + ["日","一","二","三","四","五","六"][d.getDay()]
    return h("div", { class: "demo-clock" }, [
      h("div", { class: "clock-time" }, time),
      h("div", { class: "clock-date" }, date)
    ])
  }
  }
})

/* ======================================================
 * 7. 调色板(主题色 + 点击复制 HEX)
 * ====================================================== */

export const PaletteDemo = (_, { emit }) => {
  const palette = [
    { name: "Cyan", var: "--accent-cyan" },
    { name: "Green", var: "--accent-green" },
    { name: "Purple", var: "--accent-purple" },
    { name: "Orange", var: "--accent-orange" },
    { name: "Pink", var: "--accent-pink" }
  ]
  function toHex(cssValue) {
    const v = cssValue.trim()
    if (!v) return v
    const m = v.match(/^rgba?\(([^)]+)\)$/i)
    if (m) {
      const parts = m[1].split(/,\s*/).map(Number)
      const [r, g, b] = parts
      const hex = (n) => n.toString(16).padStart(2, '0')
      return "#" + hex(r) + hex(g) + hex(b)
    }
    return v
  }
  const probe = document.createElement("div")
  probe.style.display = "none"
  document.body.appendChild(probe)
  const items = palette.map(p => {
    const css = getComputedStyle(probe).getPropertyValue(p.var).trim()
    return { ...p, hex: toHex(css) }
  })
  probe.remove()
  function copy(text) {
    navigator.clipboard?.writeText(text)
    emit("toast", "已复制 " + text)
  }
  return h("div", { class: "demo-palette" },
    items.map(p => h("button", {
      key: p.name,
      class: "palette-swatch",
      onClick: () => copy(p.hex)
    }, [
      h("span", { class: "swatch-color", style: { background: p.hex } }),
      h("span", { class: "swatch-meta" }, [
        h("span", { class: "swatch-name" }, p.name),
        h("span", { class: "swatch-hex" }, p.hex)
      ])
    ]))
  )
}

/* ======================================================
 * 8. 复制按钮
 * ====================================================== */

export const CopyButtonDemo = (_, { emit }) => {
  const text = ref("npm install geek-blog-components")
  function copy() {
    navigator.clipboard?.writeText(text.value)
    emit("toast", "命令已复制到剪贴板")
  }
  return h("div", { class: "demo-copy" }, [
    h("code", { class: "copy-text" }, text.value),
    h("button", { class: "copy-btn", onClick: copy }, [
      h("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", 'stroke-width': "2" }, [
        h("rect", { x: 9, y: 9, width: 13, height: 13, rx: 2, ry: 2 }),
        h("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
      ]),
      "复制"
    ])
  ])
}
/* ======================================================
 * 9. 涟漪按钮(点击触点向外扩散圆形涟漪)
 * ====================================================== */
/**
 * 涟漪按钮演示组件
 * @description 鼠标点击按钮时,在触点位置生成圆形涟漪并扩散淡出
 * @returns {Function} 返回渲染函数,生成 3 个不同色系的按钮
 */

export const RippleButtonDemo = defineComponent({
  setup() {
    /**
     * 处理按钮点击事件,在触点位置生成涟漪元素并触发扩散动画
     * @param {MouseEvent} e - 鼠标点击事件
     * @returns {void}
     */
    function ripple(e) {
      const btn = e.currentTarget
      const rect = btn.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const span = document.createElement('span')
      span.className = 'ripple'
      span.style.width = span.style.height = size + 'px'
      span.style.left = (e.clientX - rect.left - size / 2) + 'px'
      span.style.top = (e.clientY - rect.top - size / 2) + 'px'
      btn.appendChild(span)
      setTimeout(() => span.remove(), 650)
    }
    return () => h('div', { class: 'ripple-demo' }, [
      h('button', { class: 'ripple-btn primary', onClick: ripple }, '涟漪按钮'),
      h('button', { class: 'ripple-btn success', onClick: ripple }, '成功操作'),
      h('button', { class: 'ripple-btn danger', onClick: ripple }, '危险操作')
    ])
  }
})

/* ======================================================
 * 10. 磁性按钮(鼠标靠近时被吸附过去)
 * ====================================================== */
/**
 * 磁性按钮演示组件
 * @description 鼠标 hover 时,按钮朝鼠标方向偏移,产生磁性吸附效果
 * @returns {Function} 返回渲染函数,生成 2 个不同色系的磁性按钮
 */

export const MagneticButtonDemo = defineComponent({
  setup() {
    const btnRefs = [ref(null), ref(null)]
    /**
     * 计算鼠标相对按钮中心的偏移,并按系数平移按钮
     * @param {number} idx - 按钮索引
     * @returns {Function} 鼠标移动事件处理函数
     */
    function onMove(idx) {
      return (e) => {
        const el = btnRefs[idx].value
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`
      }
    }
    /**
     * 鼠标离开按钮时重置 transform,让按钮平滑回到原位
     * @param {number} idx - 按钮索引
     * @returns {Function} 鼠标离开事件处理函数
     */
    function onLeave(idx) {
      return () => {
        const el = btnRefs[idx].value
        if (el) el.style.transform = ''
      }
    }
    return () => h('div', { class: 'magnetic-demo' }, [
      h('button', {
        class: 'magnetic-btn',
        ref: btnRefs[0],
        onMousemove: onMove(0),
        onMouseleave: onLeave(0)
      }, '鼠标吸过来'),
      h('button', {
        class: 'magnetic-btn accent',
        ref: btnRefs[1],
        onMousemove: onMove(1),
        onMouseleave: onLeave(1)
      }, 'Hi, I am sticky')
    ])
  }
})

/* ======================================================
 * 11. 霓虹文字(多层辉光 + 抖动闪烁)
 * ====================================================== */
/**
 * 霓虹文字演示组件
 * @description 通过两层伪元素错位 + 多层 text-shadow 实现霓虹辉光效果,带闪烁动画
 * @returns {Function} 返回渲染函数,生成主标题和副标题
 */

export const NeonTextDemo = defineComponent({
  setup() {
    return () => h('div', { class: 'neon-demo' }, [
      h('h2', { class: 'neon-title', 'data-text': 'NEON GLOW' }, 'NEON GLOW'),
      h('p', { class: 'neon-sub' }, 'FUTURE · 多层辉光')
    ])
  }
})

/* ======================================================
 * 12. 撒花粒子(点击爆发彩色纸屑并物理下落)
 * ====================================================== */
/**
 * 撒花粒子演示组件
 * @description 点击按钮时,从触点向外辐射 36 片随机颜色纸屑,带物理动画下落并旋转
 * @returns {Function} 返回渲染函数,生成触发按钮和粒子舞台容器
 */

export const ConfettiDemo = defineComponent({
  setup() {
    const stageRef = ref(null)
    const colors = ['#00d4ff', '#00ff88', '#a855f7', '#ff6b35', '#ff3366', '#fbbf24']
    /**
     * 在触点位置爆发 36 片随机方向、随机颜色、随机旋转的纸屑
     * @param {MouseEvent} e - 鼠标点击事件
     * @returns {void}
     */
    function fire(e) {
      const stage = stageRef.value
      if (!stage) return
      const rect = stage.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      for (let i = 0; i < 36; i++) {
        const c = document.createElement('span')
        c.className = 'confetti'
        c.style.background = colors[i % colors.length]
        c.style.left = cx + 'px'
        c.style.top = cy + 'px'
        const angle = Math.random() * Math.PI * 2
        const speed = 80 + Math.random() * 160
        c.style.setProperty('--dx', Math.cos(angle) * speed + 'px')
        c.style.setProperty('--dy', Math.sin(angle) * speed + 'px')
        c.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg')
        stage.appendChild(c)
        setTimeout(() => c.remove(), 1400)
      }
    }
    return () => h('div', { class: 'confetti-demo', ref: stageRef }, [
      h('button', { class: 'confetti-btn', onClick: fire }, '点击撒花'),
      h('span', { class: 'confetti-hint' }, '点击按钮触发粒子爆发')
    ])
  }
})

/* ======================================================
 * 13. 3D 倾斜卡(鼠标移动时跟随倾斜 + 高光跟随)
 * ====================================================== */
/**
 * 3D 倾斜卡演示组件
 * @description 鼠标 hover 时,卡片根据鼠标位置做 3D rotateX/Y 倾斜,并在卡片表面渲染跟随鼠标的高光
 * @returns {Function} 返回渲染函数,生成一张倾斜演示卡
 */

export const TiltCardDemo = defineComponent({
  setup() {
    const cardRef = ref(null)
    /**
     * 根据鼠标在卡片内的归一化坐标,设置 3D 倾斜和径向高光位置
     * @param {MouseEvent} e - 鼠标移动事件
     * @returns {void}
     */
    function onMove(e) {
      const el = cardRef.value
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`
      el.style.setProperty('--glow-x', (50 + x * 50) + '%')
      el.style.setProperty('--glow-y', (50 + y * 50) + '%')
    }
    /**
     * 鼠标离开时清空 transform,让卡片回到平面状态
     * @returns {void}
     */
    function onLeave() {
      const el = cardRef.value
      if (el) el.style.transform = ''
    }
    return () => h('div', { class: 'tilt-demo' }, [
      h('div', {
        class: 'tilt-card',
        ref: cardRef,
        onMousemove: onMove,
        onMouseleave: onLeave
      }, [
        h('div', { class: 'tilt-content' }, [
          h('span', { class: 'tilt-icon' }, '◆'),
          h('h3', null, '3D Tilt Card'),
          h('p', null, '鼠标移动 · 卡片随动倾斜'),
          h('span', { class: 'tilt-tag' }, '#depth #parallax #glow')
        ])
      ])
    ])
  }
})

/* ======================================================
 * 14. 液态变形(不停流动变形 + 渐变色彩)
 * ====================================================== */
/**
 * 液态变形演示组件
 * @description 渐变彩色圆形,border-radius 多关键帧动画不断变形,背景渐变同时滑动
 * @returns {Function} 返回渲染函数,生成一个 blob 和 loading 文案
 */

export const LiquidLoaderDemo = defineComponent({
  setup() {
    return () => h('div', { class: 'liquid-demo' }, [
      h('div', { class: 'liquid-blob' }),
      h('p', { class: 'liquid-text' }, 'LOADING')
    ])
  }
})
/* ======================================================
 * 21. 极光背景(多层径向渐变 + 漂移 + 混合)
 * ====================================================== */
/**
 * 极光背景演示组件
 * @description 三层大尺寸径向渐变互相叠加,filter: blur + mix-blend-mode 形成极光质感
 * @returns {Function} 返回渲染函数,生成三层极光 + 标题
 */

export const AuroraDemo = defineComponent({
  setup() {
    return () => h('div', { class: 'aurora-demo' }, [
      h('div', { class: 'aurora-layer aurora-1' }),
      h('div', { class: 'aurora-layer aurora-2' }),
      h('div', { class: 'aurora-layer aurora-3' }),
      h('div', { class: 'aurora-content' }, [
        h('span', { class: 'aurora-title' }, 'AURORA'),
        h('span', { class: 'aurora-sub' }, '\u6781\u5149')
      ])
    ])
  }
})

/* ======================================================
 * 22. 渐变文字(background-clip:text + 动画位移)
 * ====================================================== */
/**
 * 渐变文字演示组件
 * @description background-clip:text + 大尺寸渐变背景 + keyframes 移动背景实现色彩流动
 * @returns {Function} 返回渲染函数,生成三组不同色系的渐变标题
 */

export const GradientTextDemo = defineComponent({
  setup() {
    return () => h('div', { class: 'gradient-text-demo' }, [
      h('h2', { class: 'gradient-text gradient-rainbow' }, 'Rainbow Flow'),
      h('h2', { class: 'gradient-text gradient-sunset' }, 'Sunset Glow'),
      h('h2', { class: 'gradient-text gradient-ocean' }, 'Ocean Depth')
    ])
  }
})

/* ======================================================
 * 23. 磁力线(鼠标位置让水平线左右偏移)
 * ====================================================== */
/**
 * 磁力线演示组件
 * @description 鼠标 X 位置对每条线施加不同强度的水平位移,越靠近中间位移越大
 * @returns {Function} 返回渲染函数,生成 12 条磁力线 + 鼠标监听
 */

export const MagnetLinesDemo = defineComponent({
  setup() {
    const boxRef = ref(null)
    const lineCount = 12
    function onMove(e) {
      if (!boxRef.value) return
      const rect = boxRef.value.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      const lines = boxRef.value.querySelectorAll('.magnet-line')
      lines.forEach((el, i) => {
        const dist = Math.abs(i - (lineCount - 1) / 2) / ((lineCount - 1) / 2)
        const dx = (ratio - 0.5) * 70 * (1 - dist)
        el.style.transform = 'translateX(' + dx + 'px)'
      })
    }
    function onLeave() {
      if (!boxRef.value) return
      boxRef.value.querySelectorAll('.magnet-line').forEach(el => { el.style.transform = '' })
    }
    return () => h('div', {
      class: 'magnet-lines-demo',
      ref: boxRef,
      onMousemove: onMove,
      onMouseleave: onLeave
    }, Array.from({ length: lineCount }, (_, i) =>
      h('div', { class: 'magnet-line', key: i })
    ))
  }
})

/* ======================================================
 * 24. 点击火花(辐射状粒子爆发)
 * ====================================================== */
/**
 * 点击火花演示组件
 * @description 点击坐标为中心,8 个方向同时发射线状粒子,带随机长度抖动
 * @returns {Function} 返回渲染函数,生成舞台 + 提示文字 + 全屏监听 click
 */

export const ClickSparkDemo = defineComponent({
  setup() {
    const stageRef = ref(null)
    function spark(e) {
      if (!stageRef.value) return
      const rect = stageRef.value.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.3
        const len = 40 + Math.random() * 70
        const dx = Math.cos(a) * len
        const dy = Math.sin(a) * len
        const p = document.createElement('span')
        p.className = 'click-spark-particle'
        p.style.left = cx + 'px'
        p.style.top = cy + 'px'
        p.style.setProperty('--dx', dx + 'px')
        p.style.setProperty('--dy', dy + 'px')
        stageRef.value.appendChild(p)
        setTimeout(() => p.remove(), 650)
      }
    }
    return () => h('div', {
      class: 'click-spark-demo',
      ref: stageRef,
      onClick: spark
    }, [
      h('span', { class: 'click-spark-hint' }, 'CLICK ANYWHERE')
    ])
  }
})

/* ======================================================
 * 25. 故障文字(RGB 分离 + 字符解密 + clip 抖切)
 * ====================================================== */
/**
 * 故障文字演示组件
 * @description 双伪元素叠加青/紫 RGB 偏移 + 定时字符解密动画 + clip-path 抖切
 * @returns {Function} 返回渲染函数,生成一个会周期性故障的标题
 */

export const GlitchTextDemo = defineComponent({
  setup() {
    const display = ref('GLITCH')
    const target = 'GLITCH'
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/'
    let timer = 0
    function scramble() {
      let n = 0
      const iv = setInterval(() => {
        let s = ''
        for (let i = 0; i < target.length; i++) {
          s += i < n ? target[i] : chars[Math.floor(Math.random() * chars.length)]
        }
        display.value = s
        n++
        if (n > target.length) {
          clearInterval(iv)
          display.value = target
        }
      }, 45)
    }
    onMounted(() => {
      setTimeout(scramble, 600)
      timer = window.setInterval(scramble, 3000)
    })
    onUnmounted(() => clearInterval(timer))
    return () => h('div', { class: 'glitch-text-demo' }, [
      h('h2', {
        class: 'glitch-text',
        'data-text': display.value
      }, display.value),
      h('p', { class: 'glitch-hint' }, 'auto-glitch every 3s')
    ])
  }
})

/* ======================================================
 * 26. macOS Dock(按鼠标距离缩放 + 弹簧)
 * ====================================================== */
const dockItems = [
  { name: 'Finder', glyph: 'F', color: '#1d8cf8' },
  { name: 'Safari', glyph: 'S', color: '#00d4ff' },
  { name: 'Chat', glyph: 'C', color: '#00ff88' },
  { name: 'Maps', glyph: 'M', color: '#a855f7' },
  { name: 'Music', glyph: 'U', color: '#ff3366' },
  { name: 'Photo', glyph: 'P', color: '#ff6b35' },
  { name: 'Mail', glyph: 'E', color: '#fbbf24' }
]
/**
 * macOS Dock 演示组件
 * @description 鼠标 X 距离决定每个图标缩放比例,最大 1.6,过渡用弹簧曲线
 * @returns {Function} 返回渲染函数,生成一排可放大图标
 */

export const DockDemo = defineComponent({
  setup() {
    const dockRef = ref(null)
    function onMove(e) {
      if (!dockRef.value) return
      const items = dockRef.value.querySelectorAll('.dock-item')
      const mx = e.clientX
      items.forEach(item => {
        const r = item.getBoundingClientRect()
        const center = r.left + r.width / 2
        const dist = Math.abs(mx - center)
        const scale = Math.max(1, 1.7 - dist / 110)
        item.style.setProperty('--scale', scale)
      })
    }
    function onLeave() {
      if (!dockRef.value) return
      dockRef.value.querySelectorAll('.dock-item').forEach(it => it.style.removeProperty('--scale'))
    }
    return () => h('div', {
      class: 'dock-demo',
      ref: dockRef,
      onMousemove: onMove,
      onMouseleave: onLeave
    }, dockItems.map(it =>
      h('div', { class: 'dock-item', key: it.name, title: it.name }, [
        h('div', {
          class: 'dock-icon',
          style: { background: 'linear-gradient(135deg, ' + it.color + ', ' + it.color + '99)' }
        }, it.glyph),
        h('span', { class: 'dock-tooltip' }, it.name)
      ])
    ))
  }
})

/* ======================================================
 * 15. 五星评分(支持半星 + 悬浮预览 + 标签同步)
 * ====================================================== */
/**
 * 五星评分演示组件
 * @description 每星支持半星精度;悬浮实时显示将评分数;右侧根据当前分数切换语义标签
 * @returns {Function} 返回渲染函数,生成五星 + 数值 + 标签
 */

export const StarRatingDemo = defineComponent({
  setup() {
    const rating = ref(4.5)
    const hover = ref(0)
    const labels = ['极差', '失望', '一般', '推荐', '必看']
    /** 根据鼠标在星内的水平比例决定本次落点(整星/半星) */
    function pickRating(e, idx) {
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      return ratio < 0.5 ? idx - 0.5 : idx
    }
    function onMove(e, idx) { hover.value = pickRating(e, idx) }
    function onClick(e, idx) { rating.value = pickRating(e, idx) }
    function onLeave() { hover.value = 0 }
    return () => h('div', { class: 'star-demo' }, [
      h('div', { class: 'star-row', onMouseleave: onLeave },
        Array.from({ length: 5 }, (_, i) => {
          const idx = i + 1
          const fill = hover.value || rating.value
          const ratio = Math.max(0, Math.min(1, fill - i))
          return h('div', {
            class: 'star-cell',
            onMousemove: (e) => onMove(e, idx),
            onClick: (e) => onClick(e, idx)
          }, [
            h('span', { class: 'star-bg' }, '\u2606'),
            h('span', { class: 'star-fg', style: { width: (ratio * 100) + '%' } }, '\u2605')
          ])
        })
      ),
      h('div', { class: 'star-info' }, [
        h('span', { class: 'star-value' }, (hover.value || rating.value).toFixed(1)),
        h('span', { class: 'star-label' }, labels[Math.max(0, Math.ceil((hover.value || rating.value)) - 1)] || '-')
      ])
    ])
  }
})

/* ======================================================
 * 16. 双滑块区间(支持范围约束 + 跟随 tooltip)
 * ====================================================== */
/**
 * 双滑块区间演示组件
 * @description 两个把手拖动会受彼此约束(最小 5 单位间隔);实时显示当前区间数值
 * @returns {Function} 返回渲染函数,生成带 tooltip 的双滑块
 */

export const RangeSliderDemo = defineComponent({
  setup() {
    const lo = ref(20)
    const hi = ref(70)
    const trackRef = ref(null)
    const dragging = ref(null)
    function pctFromEvent(e) {
      if (!trackRef.value) return 0
      const rect = trackRef.value.getBoundingClientRect()
      return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    }
    function apply(target) {
      if (dragging.value === 'lo') lo.value = Math.min(target, hi.value - 5)
      else hi.value = Math.max(target, lo.value + 5)
    }
    function onDown(which, e) { dragging.value = which; apply(Math.round(pctFromEvent(e) * 100)) }
    function onMove(e) { if (dragging.value) apply(Math.round(pctFromEvent(e) * 100)) }
    function onUp() { dragging.value = null }
    onMounted(() => {
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    })
    onUnmounted(() => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    })
    return () => h('div', { class: 'range-demo' }, [
      h('div', { class: 'range-values' }, [
        h('span', null, String(lo.value).padStart(2, '0')),
        h('span', { class: 'range-sep' }, '-'),
        h('span', null, String(hi.value).padStart(2, '0'))
      ]),
      h('div', { class: 'range-track', ref: trackRef }, [
        h('div', {
          class: 'range-fill',
          style: { left: lo.value + '%', width: (hi.value - lo.value) + '%' }
        }),
        h('div', {
          class: 'range-handle',
          style: { left: lo.value + '%' },
          onMousedown: (e) => onDown('lo', e)
        }, [h('div', { class: 'range-tooltip' }, lo.value)]),
        h('div', {
          class: 'range-handle',
          style: { left: hi.value + '%' },
          onMousedown: (e) => onDown('hi', e)
        }, [h('div', { class: 'range-tooltip' }, hi.value)])
      ])
    ])
  }
})

/* ======================================================
 * 17. 多级联动菜单(三层级联 + 横向面板)
 * ====================================================== */
const cascadeData = [
  {
    label: 'frontend',
    children: [
      { label: 'Vue', children: [{ label: 'Vue 3' }, { label: 'Pinia' }, { label: 'Vite' }] },
      { label: 'React', children: [{ label: 'Hooks' }, { label: 'Next.js' }] },
      { label: 'CSS', children: [{ label: 'Grid' }, { label: 'Houdini' }] }
    ]
},
  {
    label: 'backend',
    children: [
      { label: 'Node', children: [{ label: 'Express' }, { label: 'NestJS' }] },
      { label: 'Python', children: [{ label: 'FastAPI' }, { label: 'Django' }] }
    ]
  },
  {
    label: 'devops',
    children: [
      { label: 'Docker', children: [{ label: 'Compose' }] },
      { label: 'K8s', children: [{ label: 'Helm' }] }
    ]
  }
]
/**
 * 多级联动菜单演示组件
 * @description 三层级联;点击或悬浮触发下一级面板;选中路径回显到触发器
 * @returns {Function} 返回渲染函数,生成联动面板
 */

export const CascaderMenuDemo = defineComponent({
  setup() {
    const open = ref(false)
    const path = ref([])
    function pick(item, depth) {
      const next = path.value.slice(0, depth)
      next.push(item)
      path.value = next
      if (!item.children) open.value = false
    }
    function renderPanel() {
      if (!open.value) return null
      const panels = []
      let items = cascadeData
      for (let depth = 0; depth <= path.value.length; depth++) {
        if (!items) break
        const sel = path.value[depth]
        panels.push(h('ul', { class: 'cascade-level' },
          items.map(it => h('li', {
            class: ['cascade-item', sel && sel.label === it.label ? 'active' : ''],
            onMouseenter: () => pick(it, depth),
            onClick: () => pick(it, depth)
          }, [
            h('span', null, it.label),
            it.children ? h('span', { class: 'cascade-arrow' }, '\u203a') : null
          ]))
        ))
        if (!sel || !sel.children) break
        items = sel.children
      }
      return h('div', { class: 'cascade-panels' }, panels)
    }
    return () => h('div', { class: 'cascade-demo' }, [
      h('button', {
        class: 'cascade-trigger',
        onClick: () => { open.value = !open.value; if (open.value && path.value.length === 0) path.value = [{ label: cascadeData[0].label, children: cascadeData[0].children }] }
      }, [
        h('span', {
          class: path.value.length ? 'cascade-label' : 'cascade-placeholder'
        }, path.value.length ? path.value.map(p => p.label).join(' / ') : 'select stack...'),
        h('span', { class: ['cascade-icon', open.value ? 'open' : ''] }, '\u25be')
      ]),
      renderPanel()
    ])
  }
})

/* ======================================================
 * 18. 跑马灯(无缝循环 + 两侧渐隐 + 悬浮暂停)
 * ====================================================== */
const marqueeItems = [
  'Vue 3', 'React 19', 'TypeScript', 'Vite 6', 'Rust', 'WebAssembly',
  'CSS Houdini', 'Container Queries', 'View Transitions', 'AI Assisted Coding'
]
/**
 * 跑马灯演示组件
 * @description 拼接双份 items 实现无缝循环;CSS keyframes 横向滚动;hover 暂停;两侧 mask-image 渐隐
 * @returns {Function} 返回渲染函数,生成横向滚动条
 */

export const MarqueeDemo = defineComponent({
  setup() {
    return () => h('div', { class: 'marquee-demo' }, [
      h('div', { class: 'marquee-track' },
        [...marqueeItems, ...marqueeItems].map(item =>
          h('span', { class: 'marquee-chip' }, [
            h('span', { class: 'marquee-dot' }),
            item
          ])
        )
      )
    ])
  }
})

/* ======================================================
 * 19. 头像组(默认堆叠 + 悬浮展开 + 超出显示 +N)
 * ====================================================== */
const avatarData = [
  { name: 'Q', color: '#00d4ff' },
  { name: 'E', color: '#a855f7' },
  { name: 'R', color: '#ff3366' },
  { name: 'M', color: '#00ff88' },
  { name: 'A', color: '#ff6b35' },
  { name: 'K', color: '#fbbf24' }
]
/**
 * 头像组演示组件
 * @description 默认 -8px 堆叠;hover 时所有头像散开;超过 4 个尾部合并为 +N
 * @returns {Function} 返回渲染函数,生成头像堆叠
 */

export const AvatarGroupDemo = defineComponent({
  setup() {
    const expanded = ref(false)
    return () => h('div', {
      class: ['avatar-group-demo', expanded.value ? 'expanded' : ''],
      onMouseenter: () => { expanded.value = true },
      onMouseleave: () => { expanded.value = false }
    }, [
      ...avatarData.slice(0, 4).map(a =>
        h('div', {
          class: 'avatar-item',
          style: { background: a.color }
        }, a.name)
      ),
      avatarData.length > 4 ? h('div', {
        class: 'avatar-item avatar-more',
        style: { background: 'var(--bg-tertiary)' }
      }, '+' + (avatarData.length - 4)) : null
    ])
  }
})

/* ======================================================
 * 20. 数字滚动动画(三次缓动 + 自动循环 + 手动重置)
 * ====================================================== */
/**
 * 数字滚动动画演示组件
 * @description requestAnimationFrame 配合 cubic-out 缓动插值;每 3 秒随机一个目标值;手动按钮立即重置
 * @returns {Function} 返回渲染函数,生成滚动数字 + 重置按钮
 */

export const AnimatedNumberDemo = defineComponent({
  setup() {
    const display = ref(0)
    const target = ref(2024)
    let raf = 0
    let timer = 0
    function animate(to) {
      const from = display.value
      const start = performance.now()
      const dur = 1100
      function tick(now) {
        const p = Math.min(1, (now - start) / dur)
        const eased = 1 - Math.pow(1 - p, 3)
        display.value = Math.round(from + (to - from) * eased)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    function reroll() {
      const next = Math.floor(Math.random() * 9000) + 1000
      target.value = next
      animate(next)
    }
    onMounted(() => {
      animate(target.value)
      timer = window.setInterval(reroll, 3000)
    })
    onUnmounted(() => {
      cancelAnimationFrame(raf)
      if (timer) clearInterval(timer)
    })
    return () => h('div', { class: 'anim-num-demo' }, [
      h('span', { class: 'anim-num' }, String(display.value).padStart(4, '0')),
      h('button', { class: 'anim-num-btn', onClick: reroll }, 'reset')
    ])
  }
})


/* ======================================================
 * 组件清单(每个 widget 含可独立运行的 HTML/CSS/JS 代码片段)
 * code 字段全部使用模板字符串(反引号),避免多行字符串的转义噪音
 * ====================================================== */

/* ======================================================
 * widgets 数据数组
 * 已移除 magnet-lines / click-spark / dock 三个组件
 * ====================================================== */
export const widgets = [
  {
    id: "buttons",
    title: "按钮组 Buttons",
    desc: "主次、危险、幽灵、图标按钮",
    category: "basics",
    component: ButtonsGroup,
    code: {
      html: "<!-- 按钮组 Buttons 预览由 Vue 组件渲染 -->",
      css: "/* 按钮组 Buttons 样式见 widget-demos.css */",
      js: "// 按钮组 Buttons 交互由 Vue 组件内置"
    }
  },
  {
    id: "badges",
    title: "徽章 Badges",
    desc: "状态标签、点状徽章",
    category: "basics",
    component: BadgesGroup,
    code: {
      html: "<!-- 徽章 Badges 预览由 Vue 组件渲染 -->",
      css: "/* 徽章 Badges 样式见 widget-demos.css */",
      js: "// 徽章 Badges 交互由 Vue 组件内置"
    }
  },
  {
    id: "counter",
    title: "计数器 Counter",
    desc: "点击 +/- 步进",
    category: "data",
    component: CounterDemo,
    code: {
      html: "<!-- 计数器 Counter 预览由 Vue 组件渲染 -->",
      css: "/* 计数器 Counter 样式见 widget-demos.css */",
      js: "// 计数器 Counter 交互由 Vue 组件内置"
    }
  },
  {
    id: "progress",
    title: "进度条 Progress",
    desc: "线性 + 圆形",
    category: "data",
    component: ProgressDemo,
    code: {
      html: "<!-- 进度条 Progress 预览由 Vue 组件渲染 -->",
      css: "/* 进度条 Progress 样式见 widget-demos.css */",
      js: "// 进度条 Progress 交互由 Vue 组件内置"
    }
  },
  {
    id: "typing",
    title: "打字机 Typing",
    desc: "逐字打印 + 光标闪烁",
    category: "data",
    component: TypingDemo,
    code: {
      html: "<!-- 打字机 Typing 预览由 Vue 组件渲染 -->",
      css: "/* 打字机 Typing 样式见 widget-demos.css */",
      js: "// 打字机 Typing 交互由 Vue 组件内置"
    }
  },
  {
    id: "clock",
    title: "实时时钟 Clock",
    desc: "时分秒 + 圆点秒针",
    category: "data",
    component: ClockDemo,
    code: {
      html: "<!-- 实时时钟 Clock 预览由 Vue 组件渲染 -->",
      css: "/* 实时时钟 Clock 样式见 widget-demos.css */",
      js: "// 实时时钟 Clock 交互由 Vue 组件内置"
    }
  },
  {
    id: "palette",
    title: "色板 Palette",
    desc: "可复制 HEX",
    category: "visual",
    component: PaletteDemo,
    code: {
      html: "<!-- 色板 Palette 预览由 Vue 组件渲染 -->",
      css: "/* 色板 Palette 样式见 widget-demos.css */",
      js: "// 色板 Palette 交互由 Vue 组件内置"
    }
  },
  {
    id: "copy",
    title: "复制按钮 Copy",
    desc: "点击复制并提示",
    category: "interactive",
    component: CopyButtonDemo,
    code: {
      html: "<!-- 复制按钮 Copy 预览由 Vue 组件渲染 -->",
      css: "/* 复制按钮 Copy 样式见 widget-demos.css */",
      js: "// 复制按钮 Copy 交互由 Vue 组件内置"
    }
  },
  {
    id: "ripple",
    title: "波纹按钮 Ripple",
    desc: "点击水波扩散",
    category: "interactive",
    component: RippleButtonDemo,
    code: {
      html: "<!-- 波纹按钮 Ripple 预览由 Vue 组件渲染 -->",
      css: "/* 波纹按钮 Ripple 样式见 widget-demos.css */",
      js: "// 波纹按钮 Ripple 交互由 Vue 组件内置"
    }
  },
  {
    id: "magnetic",
    title: "磁吸按钮 Magnetic",
    desc: "跟随光标吸附",
    category: "interactive",
    component: MagneticButtonDemo,
    code: {
      html: "<!-- 磁吸按钮 Magnetic 预览由 Vue 组件渲染 -->",
      css: "/* 磁吸按钮 Magnetic 样式见 widget-demos.css */",
      js: "// 磁吸按钮 Magnetic 交互由 Vue 组件内置"
    }
  },
  {
    id: "neon",
    title: "霓虹文字 Neon",
    desc: "辉光 + 闪烁",
    category: "visual",
    component: NeonTextDemo,
    code: {
      html: "<!-- 霓虹文字 Neon 预览由 Vue 组件渲染 -->",
      css: "/* 霓虹文字 Neon 样式见 widget-demos.css */",
      js: "// 霓虹文字 Neon 交互由 Vue 组件内置"
    }
  },
  {
    id: "confetti",
    title: "礼花 Confetti",
    desc: "点击撒花粒子",
    category: "visual",
    component: ConfettiDemo,
    code: {
      html: "<!-- 礼花 Confetti 预览由 Vue 组件渲染 -->",
      css: "/* 礼花 Confetti 样式见 widget-demos.css */",
      js: "// 礼花 Confetti 交互由 Vue 组件内置"
    }
  },
  {
    id: "tilt",
    title: "3D 倾斜卡片 Tilt",
    desc: "光标控制透视",
    category: "visual",
    component: TiltCardDemo,
    code: {
      html: "<!-- 3D 倾斜卡片 Tilt 预览由 Vue 组件渲染 -->",
      css: "/* 3D 倾斜卡片 Tilt 样式见 widget-demos.css */",
      js: "// 3D 倾斜卡片 Tilt 交互由 Vue 组件内置"
    }
  },
  {
    id: "liquid",
    title: "液态加载 Liquid",
    desc: "波浪动画",
    category: "visual",
    component: LiquidLoaderDemo,
    code: {
      html: "<!-- 液态加载 Liquid 预览由 Vue 组件渲染 -->",
      css: "/* 液态加载 Liquid 样式见 widget-demos.css */",
      js: "// 液态加载 Liquid 交互由 Vue 组件内置"
    }
  },
  {
    id: "star",
    title: "5 星评分 Star",
    desc: "半星精度 + 语义标签",
    category: "interactive",
    component: StarRatingDemo,
    code: {
      html: "<!-- 5 星评分 Star 预览由 Vue 组件渲染 -->",
      css: "/* 5 星评分 Star 样式见 widget-demos.css */",
      js: "// 5 星评分 Star 交互由 Vue 组件内置"
    }
  },
  {
    id: "range",
    title: "双滑块区间 Range",
    desc: "左右联动 + 数字输入",
    category: "interactive",
    component: RangeSliderDemo,
    code: {
      html: "<!-- 双滑块区间 Range 预览由 Vue 组件渲染 -->",
      css: "/* 双滑块区间 Range 样式见 widget-demos.css */",
      js: "// 双滑块区间 Range 交互由 Vue 组件内置"
    }
  },
  {
    id: "cascader",
    title: "多级联动 Cascader",
    desc: "省市区级联选择",
    category: "interactive",
    component: CascaderMenuDemo,
    code: {
      html: "<!-- 多级联动 Cascader 预览由 Vue 组件渲染 -->",
      css: "/* 多级联动 Cascader 样式见 widget-demos.css */",
      js: "// 多级联动 Cascader 交互由 Vue 组件内置"
    }
  },
  {
    id: "marquee",
    title: "跑马灯 Marquee",
    desc: "无缝无限滚动",
    category: "visual",
    component: MarqueeDemo,
    code: {
      html: "<!-- 跑马灯 Marquee 预览由 Vue 组件渲染 -->",
      css: "/* 跑马灯 Marquee 样式见 widget-demos.css */",
      js: "// 跑马灯 Marquee 交互由 Vue 组件内置"
    }
  },
  {
    id: "avatar",
    title: "头像组 Avatar",
    desc: "重叠 + 展开更多",
    category: "basics",
    component: AvatarGroupDemo,
    code: {
      html: "<!-- 头像组 Avatar 预览由 Vue 组件渲染 -->",
      css: "/* 头像组 Avatar 样式见 widget-demos.css */",
      js: "// 头像组 Avatar 交互由 Vue 组件内置"
    }
  },
  {
    id: "anim-num",
    title: "动画数字 AnimNum",
    desc: "缓动递增到目标值",
    category: "data",
    component: AnimatedNumberDemo,
    code: {
      html: "<!-- 动画数字 AnimNum 预览由 Vue 组件渲染 -->",
      css: "/* 动画数字 AnimNum 样式见 widget-demos.css */",
      js: "// 动画数字 AnimNum 交互由 Vue 组件内置"
    }
  },
  {
    id: "gradient-text",
    title: "渐变文字 Gradient",
    desc: "background-clip:text + 动画渐变",
    category: "visual",
    component: GradientTextDemo,
    code: {
      html: "<!-- 渐变文字 Gradient 预览由 Vue 组件渲染 -->",
      css: "/* 渐变文字 Gradient 样式见 widget-demos.css */",
      js: "// 渐变文字 Gradient 交互由 Vue 组件内置"
    }
  },
  {
    id: "glitch-text",
    title: "故障文字 Glitch",
    desc: "RGB 分离 + 字符解密 + clip 抖切",
    category: "visual",
    component: GlitchTextDemo,
    code: {
      html: "<!-- 故障文字 Glitch 预览由 Vue 组件渲染 -->",
      css: "/* 故障文字 Glitch 样式见 widget-demos.css */",
      js: "// 故障文字 Glitch 交互由 Vue 组件内置"
    }
  }
]

/* ======================================================
   渲染器映射表
   ----------------------------------------------------------
   组件的「文字和代码」放在后端数据库里（通过 /widget/public 拿），
   但「怎么把它画出来」是前端的事，只能留在代码里。
   这张表就是按 widget_key 找到对应渲染组件用的。
   ====================================================== */

/* ======================================================
   新增的四个组件（渲染器）
   ====================================================== */

/**
 * 命令面板：点触发按钮打开，上下键选择，回车执行
 */
export const CommandPaletteDemo = defineComponent({
  setup() {
    // 预览时默认展开，访客一眼就能看到面板长什么样
    const open = ref(true)
    const query = ref('')
    const active = ref(0)

    const COMMANDS = [
      { label: '新建文章', hint: 'N' },
      { label: '打开设置', hint: 'S' },
      { label: '切换主题', hint: 'T' },
      { label: '搜索文章', hint: '/' },
      { label: '查看访问统计', hint: 'V' },
      { label: '退出登录', hint: 'Q' }
    ]

    const filtered = computed(() => {
      const q = query.value.trim().toLowerCase()
      return q ? COMMANDS.filter((c) => c.label.toLowerCase().includes(q)) : COMMANDS
    })

    function toggle() {
      open.value = !open.value
      query.value = ''
      active.value = 0
    }

    function onKey(e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); active.value = (active.value + 1) % filtered.value.length }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active.value = (active.value - 1 + filtered.value.length) % filtered.value.length }
      else if (e.key === 'Escape') { open.value = false }
    }

    const icon = (d) => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d })])

    return () => h('div', { class: 'cmdk' }, [
      h('button', { class: 'cmdk-trigger', type: 'button', onClick: toggle }, [
        icon('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5'),
        h('span', null, '搜索命令…'),
        h('kbd', { class: 'cmdk-kbd' }, 'Ctrl'),
        h('kbd', { class: 'cmdk-kbd' }, 'K')
      ]),
      open.value
        ? h('div', { class: 'cmdk-overlay', onClick: (e) => { if (e.target === e.currentTarget) open.value = false } }, [
            h('div', { class: 'cmdk-panel', role: 'dialog', 'aria-modal': 'true' }, [
              h('div', { class: 'cmdk-search' }, [
                icon('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5'),
                h('input', {
                  class: 'cmdk-input',
                  type: 'text',
                  placeholder: '输入命令，回车执行',
                  value: query.value,
                  onInput: (e) => { query.value = e.target.value; active.value = 0 },
                  onKeydown: onKey
                }),
                h('kbd', { class: 'cmdk-kbd' }, 'ESC')
              ]),
              h('ul', { class: 'cmdk-list', role: 'listbox' }, filtered.value.map((c, i) =>
                h('li', {
                  class: 'cmdk-item',
                  role: 'option',
                  'aria-selected': i === active.value ? 'true' : 'false',
                  'data-active': i === active.value ? 'true' : 'false',
                  onClick: () => { open.value = false }
                }, [
                  h('span', { class: 'cmdk-item-icon' }, [icon('M12 5v14M5 12h14')]),
                  h('span', { class: 'cmdk-item-label' }, c.label),
                  h('span', { class: 'cmdk-item-hint' }, c.hint)
                ])
              )),
              h('div', { class: 'cmdk-foot' }, [
                h('span', null, '↑↓ 选择'),
                h('span', null, '↵ 执行'),
                h('span', null, 'esc 关闭')
              ])
            ])
          ])
        : null
    ])
  }
})

/**
 * 终端窗口：逐行打出内容
 */
export const TerminalWindowDemo = defineComponent({
  setup() {
    const LINES = [
      { text: '$ npm run build', cls: 'term-cmd' },
      { text: 'vite v5.4.2 building for production...', cls: 'term-dim' },
      { text: '✓ 22 modules transformed', cls: 'term-ok' },
      { text: 'dist/assets/     412.08 kB', cls: 'term-dim' },
      { text: '✓ built in 2.4s', cls: 'term-ok' },
      { text: '$ ', cls: 'term-cmd' }
    ]

    const shown = ref(1)
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let timer = null

    onMounted(() => {
      if (reduce) {
        shown.value = LINES.length
        return
      }
      timer = setInterval(() => {
        shown.value += 1
        if (shown.value >= LINES.length) clearInterval(timer)
      }, 340)
    })

    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })

    return () => h('div', { class: 'term' }, [
      h('div', { class: 'term-bar' }, [
        h('span', { class: 'term-dot term-dot-r' }),
        h('span', { class: 'term-dot term-dot-y' }),
        h('span', { class: 'term-dot term-dot-g' }),
        h('span', { class: 'term-title' }, '~/projects/blog — zsh')
      ]),
      h('pre', { class: 'term-body' }, [
        ...LINES.slice(0, shown.value).map((l) => h('span', { class: l.cls }, l.text + '\n')),
        shown.value >= LINES.length ? h('span', { class: 'term-cursor' }) : null
      ])
    ])
  }
})

/**
 * 通知条：点按钮弹出三种状态
 */
export const ToastNotifyDemo = defineComponent({
  setup() {
    const toast = reactive({ visible: false, type: 'success' })
    let timer = null

    const PRESET = {
      success: { title: '保存成功', desc: '文章已经发布到前台', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6' },
      warning: { title: '还有草稿没写完', desc: '上次编辑是 3 小时前', icon: 'M12 3l9 16H3zM12 9v4M12 17h.01' },
      error: { title: '上传失败', desc: '图片超过了 2MB，请压缩后再试', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6' }
    }

    function show(type) {
      toast.type = type
      toast.visible = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => { toast.visible = false }, 3200)
    }

    onUnmounted(() => { if (timer) clearTimeout(timer) })

    const icon = (d) => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d })])

    return () => {
      const preset = PRESET[toast.type]
      return h('div', { class: 'toast-demo' }, [
        h('button', { class: 'toast-trigger toast-trigger-ok', type: 'button', onClick: () => show('success') }, [
          icon('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6'), '成功提示'
        ]),
        h('button', { class: 'toast-trigger toast-trigger-warn', type: 'button', onClick: () => show('warning') }, [
          icon('M12 3l9 16H3zM12 9v4M12 17h.01'), '警告提示'
        ]),
        h('button', { class: 'toast-trigger toast-trigger-err', type: 'button', onClick: () => show('error') }, [
          icon('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6'), '错误提示'
        ]),
        toast.visible
          ? h('div', { class: 'toast-stack' }, [
              h('div', { class: 'toast-item toast-item-' + toast.type, role: 'status' }, [
                h('span', { class: 'toast-icon' }, [icon(preset.icon)]),
                h('span', { class: 'toast-body' }, [
                  h('span', { class: 'toast-title' }, preset.title),
                  h('span', { class: 'toast-desc' }, preset.desc)
                ]),
                h('button', { class: 'toast-close', type: 'button', 'aria-label': '关闭', onClick: () => { toast.visible = false } }, '×')
              ])
            ])
          : null
      ])
    }
  }
})

/**
 * 步骤条：点一下往后推
 */
export const StepsDemo = defineComponent({
  setup() {
    const current = ref(1)

    const STEPS = [
      { title: '填写内容', desc: '标题和正文都写好了' },
      { title: '上传封面', desc: '正在处理 2.4 MB 的图片' },
      { title: '选择分类', desc: '从字典里挑一个' },
      { title: '发布', desc: '上线后前台就能看到' }
    ]

    function advance() {
      current.value = (current.value + 1) % (STEPS.length + 1)
    }

    return () => h('div', { class: 'steps-demo' }, [
      h('ol', { class: 'steps' }, STEPS.map((s, i) =>
        h('li', {
          class: 'step' + (i < current.value ? ' is-done' : '') + (i === current.value ? ' is-current' : ''),
          onClick: advance
        }, [
          h('span', { class: 'step-mark' }, i < current.value
            ? h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4 }, [h('path', { d: 'M5 13l4 4L19 7' })])
            : String(i + 1)),
          h('div', { class: 'step-body' }, [
            h('div', { class: 'step-title' }, s.title),
            h('div', { class: 'step-desc' }, s.desc)
          ])
        ])
      ))
    ])
  }
})

export const widgetRenderers = {
  buttons: ButtonsGroup,
  badges: BadgesGroup,
  avatar: AvatarGroupDemo,
  counter: CounterDemo,
  progress: ProgressDemo,
  typing: TypingDemo,
  clock: ClockDemo,
  "anim-num": AnimatedNumberDemo,
  palette: PaletteDemo,
  copy: CopyButtonDemo,
  ripple: RippleButtonDemo,
  magnetic: MagneticButtonDemo,
  neon: NeonTextDemo,
  confetti: ConfettiDemo,
  tilt: TiltCardDemo,
  liquid: LiquidLoaderDemo,
  marquee: MarqueeDemo,
  "gradient-text": GradientTextDemo,
  "glitch-text": GlitchTextDemo,
  star: StarRatingDemo,
  range: RangeSliderDemo,
  cascader: CascaderMenuDemo,
  cmdk: CommandPaletteDemo,
  terminal: TerminalWindowDemo,
  toast: ToastNotifyDemo,
  steps: StepsDemo
}

/**
 * 把后端返回的组件数据和渲染器拼在一起
 * @param {object[]} list - 后端返回的组件数组
 * @returns {object[]} 带 component 的组件数组
 */
export function attachRenderers(list) {
  return (list || [])
    .map((item) => {
      const renderer = widgetRenderers[item.id]
      // 后端有这条记录、但前端没有对应渲染器时，跳过
      if (!renderer) return null
      return { ...item, component: renderer }
    })
    .filter(Boolean)
}
