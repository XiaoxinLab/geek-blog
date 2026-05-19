<template>
  <div class="wechat-popover-wrapper" @mouseenter="showPopover = true" @mouseleave="handleMouseLeave">
    <slot></slot>

    <Transition name="popover">
      <div v-if="showPopover" class="wechat-popover">
        <img :src="qrCodeUrl" alt="微信二维码" class="qr-image" />
        <div class="popover-arrow"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  qrCodeUrl: {
    type: String,
    required: true,
    default: '/images/wechat-qrcode.png'
  }
})

const showPopover = ref(false)
let hideTimer = null

function handleMouseLeave() {
  hideTimer = setTimeout(() => {
    showPopover.value = false
  }, 200)
}

defineExpose({
  show: () => { showPopover.value = true },
  hide: () => { showPopover.value = false }
})
</script>

<style scoped>
.wechat-popover-wrapper {
  position: relative;
  display: inline-block;
}

.wechat-popover {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.qr-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
}

.popover-arrow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #fff;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.05));
}

.popover-enter-active,
.popover-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.popover-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.95);
}

.popover-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.95);
}

@media (max-width: 480px) {
  .wechat-popover {
    width: 220px;
  }
}
</style>
