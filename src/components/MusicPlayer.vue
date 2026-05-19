<template>
  <div v-if="currentTrack" class="music-player" :class="{ expanded: expanded, mini: !expanded }">
    <div class="player-bar" @click="expanded = !expanded">
      <div class="player-left">
        <div
          class="player-cover"
          :style="{ backgroundImage: `url(${getAlbumImage(currentTrack.albummid)})` }"
        >
          <div class="cover-playing" v-if="isPlaying">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="player-track-info">
          <span class="track-name">{{ currentTrack.songname }}</span>
          <span class="track-artist">{{ formatArtists(currentTrack.singer) }}</span>
        </div>
      </div>

      <div class="player-center">
        <button class="ctrl-btn" @click.stop="prevTrack" :title="t('music.prevTrack')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        </button>
        <button class="ctrl-btn play-btn" @click.stop="togglePlay">
          <svg v-if="!isPlaying" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
        <button class="ctrl-btn" @click.stop="nextTrack" :title="t('music.nextTrack')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      </div>

      <div class="player-right">
        <button class="ctrl-btn mode-btn" @click.stop="cyclePlayMode" :title="modeTitle">
          <svg v-if="playModeState === 'list'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h12"/></svg>
          <svg v-else-if="playModeState === 'single'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h12"/><text x="20" y="21" font-size="10" fill="var(--accent-cyan)">1</text></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3L21 7 17 11"/><path d="M21 7H9a4 4 0 000 8h12"/></svg>
        </button>
        <button class="ctrl-btn fullscreen-btn" @click.stop="goToFullPage" :title="'全屏播放'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </button>
        <button class="ctrl-btn" @click.stop="expanded = !expanded">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ transform: expanded ? 'rotate(180deg)' : 'none' }"><path d="M6 9l6 6 6-6"/></svg>
        </button>
      </div>
    </div>

    <div v-if="expanded" class="player-expanded">
      <div class="progress-section">
        <span class="time">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" ref="progressBarRef" @click="seekProgress">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
          </div>
        </div>
        <span class="time">{{ formatTime(duration) }}</span>
      </div>

      <div class="volume-section">
        <button class="ctrl-btn vol-btn" @click="toggleMute">
          <svg v-if="isMuted || volume === 0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/></svg>
          <svg v-else-if="volume < 0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
        </button>
        <div class="volume-bar" ref="volumeBarRef" @click="seekVolume">
          <div class="volume-track">
            <div class="volume-fill" :style="{ width: (isMuted ? 0 : volume * 100) + '%' }"></div>
          </div>
        </div>
      </div>

      <div v-if="queue.length > 1" class="queue-section">
        <h4 class="queue-title">{{ t('music.queue') }} ({{ queue.length }})</h4>
        <div class="queue-list">
          <div
            v-for="(track, idx) in queue"
            :key="track.songmid"
            class="queue-item"
            :class="{ active: idx === currentTrackIndexState }"
            @click="playTrackAt(idx)"
          >
            <span class="q-idx">{{ idx + 1 }}</span>
            <div class="q-cover" :style="{ backgroundImage: `url(${getAlbumImage(track.albummid)})` }"></div>
            <div class="q-info">
              <span class="q-name">{{ track.songname }}</span>
              <span class="q-artist">{{ formatArtists(track.singer) }}</span>
            </div>
            <span class="q-dur">{{ formatTime(track.interval || 0) }}</span>
          </div>
        </div>
      </div>
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
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import musicService from '../services/musicService.js'

const router = useRouter()
const { t } = useI18n()
const emit = defineEmits(['toast'])

const playbackQueue = inject('playbackQueue', ref([]))
const currentTrackIndex = inject('currentTrackIndex', ref(-1))
const playMode = inject('playMode', ref('list'))

const audioRef = ref(null)
const progressBarRef = ref(null)
const volumeBarRef = ref(null)
const expanded = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.7)
const isMuted = ref(false)
const playUrl = ref('')
const urlLoading = ref(false)
const isSkipping = ref(false)
const playFailTimer = ref(null)
const skipTimer = ref(null)
const failedSongmids = ref(new Set())

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
  if (playModeState.value === 'single') return t('music.singleLoop')
  if (playModeState.value === 'random') return t('music.randomPlay')
  return t('music.listLoop')
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
  urlLoading.value = true
  try {
    const res = await musicService.getMusicPlay(songmid, 128)
    if (res) {
      const url = res.data?.playUrl || res.playUrl || res.url || ''
      playUrl.value = url
      if (!url) {
        console.warn('获取播放链接为空')
        handleSkipUnavailable()
      }
    } else {
      handleSkipUnavailable()
    }
  } catch (e) {
    console.error('获取播放链接失败:', e)
    playUrl.value = ''
    handleSkipUnavailable()
  } finally {
    urlLoading.value = false
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
  emit('toast', `"${trackName}" ${t('music.unavailable')}，自动播放下一首`)
  isSkipping.value = true
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

function pause() {
  const audio = audioRef.value
  if (audio) audio.pause()
}

function prevTrack() {
  if (queue.value.length === 0) return
  if (playModeState.value === 'random') {
    const prev = currentTrackIndexState.value
    let newIdx
    do {
      newIdx = Math.floor(Math.random() * queue.value.length)
    } while (newIdx === prev && queue.value.length > 1)
    currentTrackIndex.value = newIdx
  } else {
    currentTrackIndex.value = currentTrackIndexState.value <= 0
      ? queue.value.length - 1
      : currentTrackIndexState.value - 1
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
    } while (newIdx === prev && queue.value.length > 1 && !failedSongmids.value.has(queue.value[newIdx]?.songmid))
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
  if (idx < 0 || idx >= queue.value.length) return
  if (idx === currentTrackIndexState.value && isPlaying.value) return
  if (skipTimer.value) {
    clearTimeout(skipTimer.value)
    skipTimer.value = null
  }
  isSkipping.value = false
  failedSongmids.value.clear()
  currentTrackIndex.value = idx
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

function seekProgress(e) {
  const bar = progressBarRef.value
  if (!bar || !audioRef.value || duration.value <= 0) return
  const rect = bar.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  audioRef.value.currentTime = ratio * duration.value
}

function seekVolume(e) {
  const bar = volumeBarRef.value
  if (!bar || !audioRef.value) return
  const rect = bar.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  volume.value = ratio
  audioRef.value.volume = ratio
  isMuted.value = ratio === 0
  audioRef.value.muted = isMuted.value
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
    if (audioRef.value) {
      audioRef.value.currentTime = 0
      audioRef.value.play().catch(() => {})
    }
  } else {
    nextTrack()
  }
}

function onError() {
  console.error('音频加载失败')
  isPlaying.value = false
  handleSkipUnavailable()
}

function goToFullPage() {
  router.push('/music/play')
}

watch(currentTrackIndex, (newVal, oldVal) => {
  if (newVal !== oldVal && newVal >= 0) {
    playUrl.value = ''
    nextTick(() => {
      play()
    })
  }
})

watch(volume, (v) => {
  if (audioRef.value) {
    audioRef.value.volume = v
  }
})

defineExpose({ play, pause, togglePlay, nextTrack, prevTrack })
</script>

<style scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: playerIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes playerIn {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.player-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  cursor: pointer;
  transition: background 0.2s ease;
}

.player-bar:hover {
  background: var(--bg-tertiary);
}

.player-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
  flex: 1;
}

.player-cover {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-card));
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.cover-playing {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 6px;
}

.cover-playing span {
  width: 3px;
  background: var(--accent-cyan);
  border-radius: 2px;
  animation: eq 0.8s ease-in-out infinite;
}

.cover-playing span:nth-child(1) { height: 40%; animation-delay: 0s; }
.cover-playing span:nth-child(2) { height: 70%; animation-delay: 0.15s; }
.cover-playing span:nth-child(3) { height: 50%; animation-delay: 0.3s; }

@keyframes eq {
  0%, 100% { height: 30%; }
  50% { height: 80%; }
}

.player-track-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.track-name {
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 0.76rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-center {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
}

.player-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  justify-content: flex-end;
}

.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.ctrl-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.play-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-cyan-hover));
  color: var(--bg-primary);
  box-shadow: 0 4px 18px rgba(0, 212, 255, 0.25);
}

.play-btn:hover {
  box-shadow: 0 4px 18px rgba(0, 212, 255, 0.4);
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-cyan-hover));
  color: var(--bg-primary);
}

.mode-btn.single svg::after {
  content: '1';
}

.fullscreen-btn {
  color: var(--accent-cyan);
}

.fullscreen-btn:hover {
  background: rgba(0, 212, 255, 0.1);
}

.player-expanded {
  padding: 0 1.5rem 1.2rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: expandIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

@keyframes expandIn {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 400px; }
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.time {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  min-width: 38px;
}

.progress-bar {
  flex: 1;
  cursor: pointer;
  padding: 6px 0;
}

.progress-track {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  position: relative;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green));
  border-radius: 2px;
  transition: width 0.15s linear;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: var(--accent-cyan);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}

.volume-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.vol-btn {
  width: 30px;
  height: 30px;
}

.volume-bar {
  width: 100px;
  cursor: pointer;
  padding: 4px 0;
}

.volume-track {
  height: 3px;
  background: var(--bg-tertiary);
  border-radius: 2px;
}

.volume-fill {
  height: 100%;
  background: var(--accent-cyan);
  border-radius: 2px;
  transition: width 0.1s ease;
}

.queue-section {
  max-height: 200px;
  overflow: hidden;
}

.queue-title {
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.55rem;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 150px;
  overflow-y: auto;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.6rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s ease;
}

.queue-item:hover {
  background: var(--bg-tertiary);
}

.queue-item.active {
  background: rgba(0, 212, 255, 0.08);
}

.q-idx {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  width: 22px;
  text-align: center;
}

.q-cover {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.q-info {
  flex: 1;
  min-width: 0;
}

.q-name {
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

.q-dur {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .player-bar {
    padding: 0.55rem 0.85rem;
  }

  .player-right {
    gap: 0.15rem;
  }

  .player-expanded {
    padding: 0 0.85rem 1rem;
  }

  .volume-bar {
    width: 60px;
  }

  .player-track-info {
    max-width: 130px;
  }
}

@media (max-width: 480px) {
  .player-center {
    gap: 0.3rem;
  }

  .ctrl-btn {
    width: 28px;
    height: 28px;
  }

  .play-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
