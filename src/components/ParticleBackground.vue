<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const canvasRef = ref(null)
let ctx
let particles = []
let animationId
const isDark = ref(document.documentElement.getAttribute('data-theme') !== 'light')

class Particle {
  constructor(canvas, darkMode) {
    this.canvas = canvas
    this.darkMode = darkMode
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height
    this.size = Math.random() * 2 + 0.5
    this.speedX = (Math.random() - 0.5) * 0.5
    this.speedY = (Math.random() - 0.5) * 0.5
    this.opacity = Math.random() * 0.5 + 0.2

    if (this.darkMode) {
      const colors = ['#00f0ff', '#ff00e5', '#b000ff', '#00ff9f']
      this.color = colors[Math.floor(Math.random() * colors.length)]
    } else {
      const colors = ['#0891b2', '#7c3aed', '#059669', '#0891b2']
      this.color = colors[Math.floor(Math.random() * colors.length)]
    }
  }

  updateMode(darkMode) {
    this.darkMode = darkMode
    if (darkMode) {
      const colors = ['#00f0ff', '#ff00e5', '#b000ff', '#00ff9f']
      this.color = colors[Math.floor(Math.random() * colors.length)]
    } else {
      const colors = ['#0891b2', '#7c3aed', '#059669', '#0891b2']
      this.color = colors[Math.floor(Math.random() * colors.length)]
    }
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY

    if (this.x > this.canvas.width) this.x = 0
    if (this.x < 0) this.x = this.canvas.width
    if (this.y > this.canvas.height) this.y = 0
    if (this.y < 0) this.y = this.canvas.height
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.globalAlpha = this.opacity
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

function getTrailColor() {
  return isDark.value ? 'rgba(10, 10, 15, 0.1)' : 'rgba(245, 247, 250, 0.2)'
}

function getLinkAlpha(distance) {
  return (120 - distance) / 120 * (isDark.value ? 0.15 : 0.08)
}

function initCanvas() {
  const canvas = canvasRef.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx = canvas.getContext('2d')

  particles = []
  const particleCount = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 15000))

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvas, isDark.value))
  }
}

function onThemeChange() {
  const dark = document.documentElement.getAttribute('data-theme') !== 'light'
  if (isDark.value !== dark) {
    isDark.value = dark
    particles.forEach(p => p.updateMode(dark))
  }
}

function animate() {
  ctx.fillStyle = getTrailColor()
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  particles.forEach((p, i) => {
    p.update()
    p.draw(ctx)

    for (let j = i + 1; j < particles.length; j++) {
      const dx = p.x - particles[j].x
      const dy = p.y - particles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 120) {
        ctx.beginPath()
        ctx.strokeStyle = p.color
        ctx.globalAlpha = getLinkAlpha(distance)
        ctx.lineWidth = 0.5
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }
  })

  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  initCanvas()
  animate()

  const themeObserver = new MutationObserver(onThemeChange)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationId)
    initCanvas()
  })
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
