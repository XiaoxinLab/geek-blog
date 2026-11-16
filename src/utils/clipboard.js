/**
 * 将文本写入系统剪贴板，并在 Clipboard API 不可用时回退到传统复制方案。
 * @param {string} text - 需要复制的文本内容。
 * @returns {Promise<void>} 复制完成时解决的 Promise。
 * @throws {Error} 当浏览器拒绝复制或传统复制方案执行失败时抛出异常。
 */
export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    const copied = document.execCommand('copy')
    if (!copied) throw new Error('浏览器未完成复制操作')
  } finally {
    textarea.remove()
  }
}
