<template>
  <div class="music-play-page">
    <div class="ambient-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="play-container">
      <button class="back-nav" @click="$router.push('/music')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        返回音乐
      </button>

      <Transition name="toast-fade">
        <div v-if="toastMsg" class="skip-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {{ toastMsg }}
        </div>
      </Transition>

      <div v-if="!currentTrack" class="empty-play">
        <div class="vinyl-placeholder">
          <div class="vinyl-grooves"></div>
          <div class="vinyl-center"></div>
        </div>
        <p class="empty-text">从音乐搜索页面选择歌曲开始播放</p>
        <router-link to="/music" class="goto-music">🎵 探索音乐</router-link>
      </div>

      <template v-else>
        <div class="hero-section">
          <div class="vinyl-container" :class="{ spinning: isPlaying }">
            <div class="vinyl-disc">
              <div class="vinyl-groove" v-for="i in 6" :key="i" :style="{ '--gr': i }"></div>
              <div class="vinyl-label" :style="{ backgroundImage: `url(${getAlbumImage(currentTrack.albummid)})` }"></div>
              <div class="vinyl-hole"></div>
            </div>
            <div class="vinyl-highlight"></div>
          </div>

          <div class="track-hero-info">
            <div class="now-badge">
              <span class="badge-dot"></span>
              NOW PLAYING
            </div>
            <h1 class="hero-title">{{ currentTrack.songname }}</h1>
            <p class="hero-artist">{{ formatArtists(currentTrack.singer) }}</p>
            <span class="hero-album" v-if="currentTrack.albumname">{{ currentTrack.albumname }}</span>

            <div class="waveform-bars">
              <div class="wave-bar" v-for="i in 32" :key="i" :class="{ active: isPlaying }" :style="{ '--i': i, '--h': Math.random() * 0.8 + 0.2 }"></div>
            </div>
          </div>
        </div>

        <div class="control-section">
          <div class="progress-wrap">
            <span class="prog-time">{{ formatTime(currentTime) }}</span>
            <div class="prog-bar" ref="progRef" @click="seekProgress">
              <div class="prog-track">
                <div class="prog-fill" :style="{ width: progressPercent + '%' }">
                  <div class="prog-glow"></div>
                </div>
                <div class="prog-thumb" :style="{ left: progressPercent + '%' }"></div>
              </div>
            </div>
            <span class="prog-time">{{ formatTime(duration) }}</span>
          </div>

          <div class="main-controls">
            <button class="mc-btn" @click="cyclePlayMode" :title="modeTitle">
              <svg v-if="playModeState === 'list'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h12"/></svg>
              <svg v-else-if="playModeState === 'single'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h12"/><text x="20" y="21" font-size="9" fill="var(--accent-cyan)">1</text></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3L21 7 17 11M21 7H9a4 4 0 000 8h12"/></svg>
            </button>
            <button class="mc-btn" @click="prevTrack">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
            </button>
            <button class="mc-btn play-main" @click="togglePlay">
              <svg v-if="!isPlaying" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <button class="mc-btn" @click="nextTrack">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
            <button class="mc-btn vol-wrap" @click="toggleMute">
              <svg v-if="isMuted || volumeLevel === 0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
            </button>
            <div class="vol-slider-wrap">
              <input type="range" min="0" max="100" :value="isMuted ? 0 : volumeLevel * 100" @input="setVolume" class="vol-slider" />
            </div>
          </div>
        </div>

        <div class="bottom-section">
          <div class="lyric-panel" v-if="showLyrics">
            <h3 class="section-label">歌词</h3>
            <div v-if="lyricLoading" class="lyric-loading">加载中...</div>
            <div v-else class="lyric-text">
              <p v-for="(line, i) in parsedLyrics" :key="i" class="l-line">{{ line }}</p>
              <p v-if="parsedLyrics.length === 0" class="l-empty">暂无歌词</p>
            </div>
          </div>

          <div class="queue-panel">
            <div class="queue-header" @click="showQueue = !showQueue">
              <h3 class="section-label">播放队列 ({{ queue.length }})</h3>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ transform: showQueue ? 'rotate(180deg)' : 'none' }"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div v-if="showQueue" class="queue-list-full">
              <div
                v-for="(track, idx) in queue"
                :key="track.songmid"
                class="queue-row"
                :class="{ active: idx === currentTrackIndexState }"
                @click="playTrackAt(idx)"
              >
                <span class="q-num" :class="{ playing: idx === currentTrackIndexState && isPlaying }">
                  <template v-if="idx === currentTrackIndexState && isPlaying">
                    <span class="eq-mini"><i></i><i></i><i></i></span>
                  </template>
                  <template v-else>{{ idx + 1 }}</template>
                </span>
                <div class="q-cover-mini" :style="{ backgroundImage: `url(${getAlbumImage(track.albummid)})` }"></div>
                <div class="q-meta">
                  <span class="q-title">{{ track.songname }}</span>
                  <span class="q-artist">{{ formatArtists(track.singer) }}</span>
                </div>
                <span class="q-time">{{ formatTime(track.interval || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <audio
      ref="audioRef"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoaded"
      @ended="onEnded"
      @error="onError"
      @play="onPlay"
      @pause="isPlaying = false"
      @loadstart="onLoadStart"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import musicService from '../services/musicService.js'

const router = useRouter()

const playbackQueue = inject('playbackQueue', ref([]))
const currentTrackIndex = inject('currentTrackIndex', ref(-1))
const playMode = inject('playMode', ref('list'))

const audioRef = ref(null)
const progRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volumeLevel = ref(0.7)
const isMuted = ref(false)
const playUrl = ref('')
const isSkipping = ref(false)
const toastMsg = ref('')
const playFailTimer = ref(null)
const skipTimer = ref(null)
const failedSongmids = ref(new Set())
const showQueue = ref(true)
const showLyrics = ref(false)
const lyricText = ref('')
const lyricLoading = ref(false)

const parsedLyrics = computed(() => parseLyricRaw(lyricText.value))

function parseLyricRaw(raw) {
  if (!raw) return []
  let text = raw
  if (typeof text === 'object') text = text.lyric || text.data?.lyric || JSON.stringify(text)
  if (typeof text !== 'string') return []
  text = text.replace(/\\n/g, '\n').replace(/\n{3,}/g, '\n\n')
  const lines = text.split('\n')
  const timeTagRe = /^\[\d{2}:\d{2}(\.\d{2,3})?\]/
  const metaTagRe = /^\[(ti|ar|al|by|offset|com|version|language|krc_mode|hash|reqlanguage)\s*[:：]/
  return lines
    .map(l => l.trim())
    .filter(line => {
      if (!line) return false
      if (metaTagRe.test(line)) return false
      return true
    })
    .map(line => line.replace(timeTagRe, '').trim())
    .filter(line => line.length > 0)
}

const queue = computed(() => playbackQueue.value || [])
const currentTrackIndexState = computed(() => currentTrackIndex.value)
const playModeState = computed(() => playMode.value)
const currentTrack = computed(() => {
  const idx = currentTrackIndexState.value
  if (idx >= 0 && idx < queue.value.length) return queue.value[idx]
  return null
})

const progressPercent = computed(() => {
  if (duration.value <= 0) return 0
  return (currentTime.value / duration.value) * 100
})

const modeTitle = computed(() => {
  if (playModeState.value === 'single') return '单曲循环'
  if (playModeState.value === 'random') return '随机播放'
  return '列表循环'
})

function getAlbumImage(albummid) {
  if (!albummid) return 'https://y.gtimg.cn/mediastyle/global/img/cover_200.png'
  return `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albummid}.jpg`
}

function formatArtists(singers) {
  if (!singers) return ''
  if (Array.isArray(singers)) return singers.map(s => s.name || s).join(' / ')
  return String(singers)
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '00:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

async function fetchPlayUrl(songmid) {
  try {
    const res = await musicService.getMusicPlay(songmid, 128)
    if (res) {
      const url = res.data?.playUrl || res.playUrl || res.url || ''
      playUrl.value = url
      if (!url) {
        handleSkipUnavailable()
      }
    } else {
      handleSkipUnavailable()
    }
  } catch (e) {
    console.error('获取播放链接失败:', e)
    playUrl.value = ''
    handleSkipUnavailable()
  }
}

function clearPlayFailTimer() {
  if (playFailTimer.value) {
    clearTimeout(playFailTimer.value)
    playFailTimer.value = null
  }
}

function startPlayFailTimer() {
  clearPlayFailTimer()
  playFailTimer.value = setTimeout(() => {
    playFailTimer.value = null
    if (!isPlaying.value) {
      handleSkipUnavailable()
    }
  }, 8000)
}

function onPlay() {
  isPlaying.value = true
  clearPlayFailTimer()
  if (skipTimer.value) {
    clearTimeout(skipTimer.value)
    skipTimer.value = null
  }
  isSkipping.value = false
}

function onLoadStart() {
  startPlayFailTimer()
}

function handleSkipUnavailable() {
  clearPlayFailTimer()
  if (skipTimer.value) {
    clearTimeout(skipTimer.value)
    skipTimer.value = null
  }
  const track = currentTrack.value
  const trackName = track?.songname || '当前歌曲'
  if (track?.songmid) {
    failedSongmids.value.add(track.songmid)
  }
  toastMsg.value = `"${trackName}" 无法播放，自动播放下一首`
  isSkipping.value = true
  setTimeout(() => {
    toastMsg.value = ''
  }, 3000)
  skipTimer.value = setTimeout(() => {
    skipTimer.value = null
    nextTrack()
  }, 3500)
}

function play() {
  const track = currentTrack.value
  if (!track) return
  const audio = audioRef.value
  if (!audio) return
  if (playUrl.value) {
    audio.src = playUrl.value
    audio.play().then(() => {
      isSkipping.value = false
    }).catch(() => {
      handleSkipUnavailable()
    })
  } else {
    fetchPlayUrl(track.songmid).then(() => {
      if (playUrl.value) {
        audio.src = playUrl.value
        audio.play().then(() => {
          isSkipping.value = false
        }).catch(() => {
          handleSkipUnavailable()
        })
      } else {
        handleSkipUnavailable()
      }
    })
  }
}

function togglePlay() {
  const audio = audioRef.value
  if (!audio) return
  if (isPlaying.value) {
    audio.pause()
  } else {
    if (!audio.src || audio.src === window.location.href) {
      play()
    } else {
      audio.play().catch(e => console.error('播放失败:', e))
    }
  }
}

function prevTrack() {
  if (queue.value.length === 0) return
  if (playModeState.value === 'random') {
    const prev = currentTrackIndexState.value
    let newIdx
    do { newIdx = Math.floor(Math.random() * queue.value.length) } while (newIdx === prev && queue.value.length > 1)
    currentTrackIndex.value = newIdx
  } else {
    currentTrackIndex.value = currentTrackIndexState.value <= 0 ? queue.value.length - 1 : currentTrackIndexState.value - 1
  }
}

function nextTrack() {
  if (queue.value.length === 0) return
  if (playModeState.value === 'random') {
    const available = queue.value.filter((_, i) => !failedSongmids.value.has(queue.value[i].songmid))
    if (available.length === 0) {
      failedSongmids.value.clear()
      isSkipping.value = false
    }
    const prev = currentTrackIndexState.value
    let newIdx
    do {
      newIdx = Math.floor(Math.random() * queue.value.length)
    } while (newIdx === prev && queue.value.length > 1)
    currentTrackIndex.value = newIdx
  } else {
    let nextIdx = currentTrackIndexState.value
    let attempts = 0
    do {
      nextIdx = (nextIdx + 1) % queue.value.length
      attempts++
    } while (isSkipping.value && failedSongmids.value.has(queue.value[nextIdx]?.songmid) && attempts < queue.value.length)

    if (attempts >= queue.value.length) {
      failedSongmids.value.clear()
      isSkipping.value = false
    }
    currentTrackIndex.value = nextIdx
  }
}

function playTrackAt(idx) {
  if (idx >= 0 && idx < queue.value.length) {
    if (skipTimer.value) {
      clearTimeout(skipTimer.value)
      skipTimer.value = null
    }
    isSkipping.value = false
    failedSongmids.value.clear()
    currentTrackIndex.value = idx
  }
}

function cyclePlayMode() {
  const modes = ['list', 'single', 'random']
  const idx = modes.indexOf(playModeState.value)
  playMode.value = modes[(idx + 1) % modes.length]
}

function toggleMute() {
  const audio = audioRef.value
  if (!audio) return
  isMuted.value = !isMuted.value
  audio.muted = isMuted.value
}

function setVolume(e) {
  const v = Number(e.target.value) / 100
  volumeLevel.value = v
  if (audioRef.value) {
    audioRef.value.volume = v
    isMuted.value = v === 0
    audioRef.value.muted = v === 0
  }
}

function seekProgress(e) {
  const bar = progRef.value
  if (!bar || !audioRef.value || duration.value <= 0) return
  const rect = bar.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  audioRef.value.currentTime = ratio * duration.value
}

function onTimeUpdate() {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime
}

function onLoaded() {
  if (audioRef.value) duration.value = audioRef.value.duration
  isSkipping.value = false
}

function onEnded() {
  if (isSkipping.value) return
  if (playModeState.value === 'single') {
    if (audioRef.value) { audioRef.value.currentTime = 0; audioRef.value.play().catch(() => {}) }
  } else {
    nextTrack()
  }
}

function onError() {
  console.error('音频加载失败')
  isPlaying.value = false
  handleSkipUnavailable()
}

watch(currentTrackIndex, (newVal, oldVal) => {
  if (newVal !== oldVal && newVal >= 0) {
    playUrl.value = ''
    nextTick(() => { play() })
  }
})

watch(volumeLevel, (v) => {
  if (audioRef.value) audioRef.value.volume = v
})

if (currentTrackIndexState.value >= 0) {
  play()
}
</script>

<style scoped>
.music-play-page {
  min-height: 100vh;
  padding-top: 80px;
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 0%, var(--bg-secondary) 0%, var(--bg-primary) 60%, var(--bg-primary) 100%);
}

.ambient-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.12;
  animation: orbFloat 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--accent-cyan), transparent 70%);
  top: -200px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--accent-purple), transparent 70%);
  bottom: -150px;
  right: -100px;
  animation-delay: -7s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--accent-pink), transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(40px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(-30px, -10px) scale(1.02); }
}

.play-container {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.back-nav {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-bottom: 2rem;
}

.back-nav:hover {
  color: var(--accent-cyan);
  border-color: rgba(0, 212, 255, 0.3);
  background: rgba(0, 212, 255, 0.06);
}

.empty-play {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.vinyl-placeholder {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 3px solid var(--border-color);
  position: relative;
  margin-bottom: 2rem;
}

.vinyl-grooves {
  position: absolute;
  inset: 15px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  background: var(--bg-primary);
  border-radius: 50%;
  border: 3px solid var(--border-color);
  transform: translate(-50%, -50%);
}

.empty-text {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.goto-music {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.7rem 1.8rem;
  background: rgba(0, 212, 255, 0.08);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  color: var(--accent-cyan);
  text-decoration: none;
  transition: all 0.25s ease;
}

.goto-music:hover {
  background: rgba(0, 212, 255, 0.15);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.15);
}

.hero-section {
  display: flex;
  align-items: center;
  gap: 3rem;
  margin-bottom: 2.5rem;
  animation: heroIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes heroIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.vinyl-container {
  flex-shrink: 0;
  width: 240px;
  height: 240px;
  position: relative;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--bg-tertiary);
  position: relative;
  box-shadow:
    0 0 0 4px var(--border-color),
    0 0 0 8px var(--bg-card),
    0 0 0 12px var(--border-color),
    var(--shadow-card);
  animation: rotateVinyl 4s linear infinite;
  animation-play-state: paused;
}

.vinyl-container.spinning .vinyl-disc {
  animation-play-state: running;
}

@keyframes rotateVinyl {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-groove {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  top: calc(var(--gr) * 8px);
  left: calc(var(--gr) * 8px);
  right: calc(var(--gr) * 8px);
  bottom: calc(var(--gr) * 8px);
}

.vinyl-label {
   position: absolute;
   top: 50%;
   left: 50%;
   width: 100px;
   height: 100px;
   border-radius: 50%;
   transform: translate(-50%, -50%);
   background-size: cover;
   background-position: center;
   box-shadow: 0 0 0 3px var(--border-color);
   z-index: 2;
 }

.vinyl-hole {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 14px;
  background: var(--bg-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
}

.vinyl-highlight {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, rgba(0, 212, 255, 0.08), transparent, rgba(168, 85, 247, 0.06), transparent);
  animation: rotateVinyl 6s linear infinite;
  opacity: 0.6;
  pointer-events: none;
}

.track-hero-info {
  flex: 1;
  min-width: 0;
}

.now-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--accent-cyan);
  padding: 0.25rem 0.7rem;
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-cyan);
  border-radius: 50%;
  animation: dotPulse 1.5s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--accent-cyan); }
  50% { opacity: 0.4; box-shadow: 0 0 2px var(--accent-cyan); }
}

.hero-title {
  font-family: 'Georgia', 'Noto Serif SC', serif;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.hero-artist {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--text-secondary);
  margin-bottom: 0.35rem;
}

.hero-album {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  padding: 0.15rem 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-top: 0.3rem;
}

.waveform-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 40px;
  margin-top: 1.25rem;
  opacity: 0.5;
}

.wave-bar {
  width: 3px;
  background: linear-gradient(to top, var(--accent-cyan), var(--accent-purple));
  border-radius: 2px;
  height: 8px;
  transition: height 0.15s ease;
}

.wave-bar.active {
  animation: waveJump 0.6s ease-in-out calc(var(--i) * 0.05s) infinite alternate;
}

@keyframes waveJump {
  from { height: calc(8px + var(--h, 0.5) * 20px); }
  to { height: calc(8px + var(--h, 0.5) * 32px); }
}

.control-section {
  margin-bottom: 2.5rem;
}

.progress-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}

.prog-time {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  min-width: 40px;
}

.prog-bar {
  flex: 1;
  cursor: pointer;
  padding: 8px 0;
}

.prog-track {
  height: 3px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  position: relative;
  overflow: visible;
}

.prog-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green));
  border-radius: 2px;
  position: relative;
  transition: width 0.15s linear;
}

.prog-glow {
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background: var(--accent-cyan);
  border-radius: 50%;
  filter: blur(4px);
  opacity: 0.6;
}

.prog-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: var(--accent-cyan);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.5);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.prog-bar:hover .prog-thumb {
  opacity: 1;
}

.main-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.mc-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mc-btn:hover {
  color: var(--text-primary);
  border-color: var(--accent-cyan);
  background: var(--bg-card);
}

.play-main {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-cyan-hover));
  color: var(--bg-primary);
  border: none;
  box-shadow: 0 4px 30px rgba(0, 212, 255, 0.25);
}

.play-main:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 40px rgba(0, 212, 255, 0.4);
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-cyan-hover));
  color: var(--bg-primary);
  border: none;
}

.vol-wrap {
  margin-left: 0.5rem;
}

.vol-slider-wrap {
  margin-left: 0.25rem;
}

.vol-slider {
  width: 80px;
  height: 3px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg-tertiary);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.vol-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: var(--accent-cyan);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
}

.vol-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: var(--accent-cyan);
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.lyric-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  max-height: 300px;
  overflow-y: auto;
}

.lyric-text {
  font-family: var(--font-sans);
}

.l-line {
  margin: 0;
  padding: 0.25rem 0;
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.l-line:hover {
  color: var(--text-primary);
}

.l-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.82rem;
  padding: 1.5rem 0;
}

.lyric-loading {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.queue-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
}

.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.section-label {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.queue-list-full {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-height: 250px;
  overflow-y: auto;
}

.queue-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.55rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.queue-row:hover { background: var(--bg-tertiary); }
.queue-row.active { background: rgba(0, 212, 255, 0.08); }

.q-num {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  width: 22px;
  text-align: center;
}

.q-num.playing {
  color: var(--accent-cyan);
}

.eq-mini {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  height: 12px;
  justify-content: center;
}

.eq-mini i {
  width: 2px;
  background: var(--accent-cyan);
  border-radius: 1px;
  animation: eqMini 0.6s ease-in-out infinite alternate;
}

.eq-mini i:nth-child(1) { height: 6px; animation-delay: 0s; }
.eq-mini i:nth-child(2) { height: 10px; animation-delay: 0.15s; }
.eq-mini i:nth-child(3) { height: 8px; animation-delay: 0.3s; }

@keyframes eqMini {
  from { transform: scaleY(0.6); }
  to { transform: scaleY(1); }
}

.q-cover-mini {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.q-meta {
  flex: 1;
  min-width: 0;
}

.q-title {
  font-size: 0.8rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.q-artist {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.q-time {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .vinyl-container {
    width: 180px;
    height: 180px;
  }

  .vinyl-label {
    width: 72px;
    height: 72px;
  }

  .bottom-section {
    grid-template-columns: 1fr;
  }

  .waveform-bars {
    justify-content: center;
  }
}

.skip-toast {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  background: var(--bg-card);
  border: 1px solid rgba(var(--accent-orange-rgb), 0.3);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  box-shadow: var(--shadow-card);
}

.skip-toast svg {
  color: var(--accent-orange);
  flex-shrink: 0;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
