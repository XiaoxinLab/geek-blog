<template>
  <div class="music-page">
    <section class="page-header">
      <div class="container">
        <div class="header-grid">
          <div class="header-text">
            <h1 class="page-title">
              <span class="title-icon">♪</span>
              {{ t('music.title') }}
            </h1>
            <p class="page-desc">{{ t('music.desc') }}</p>
          </div>
          <div class="search-area">
            <div class="search-box" :class="{ focused: searchFocused }">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref="searchInput"
                v-model="searchKeyword"
                :placeholder="t('music.searchPlaceholder')"
                @focus="searchFocused = true"
                @blur="searchFocused = false"
                @keyup.enter="onEnterSearch"
              />
              <button v-if="searchKeyword" class="clear-btn" @click="clearSearch">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <button type="button" class="search-btn" @click="onBtnSearch">{{ t('music.search') }}</button>
            </div>
            <div v-if="hotKeys.length > 0 && !hasSearched" class="hot-keys">
              <span class="hot-label">{{ t('music.hotSearch') }}:</span>
              <button
                v-for="(key, idx) in hotKeys.slice(0, 8)"
                :key="idx"
                class="hot-tag"
                :class="{ top3: idx < 3 }"
                @click="quickSearch(key)"
              >{{ key }}</button>
            </div>
          </div>
        </div>

        <nav class="tab-nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="switchTab(tab.key)"
          >
            <span class="tab-icon" v-html="tab.icon"></span>
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </section>

    <section class="music-content">
      <div class="container">

        <div v-if="loading && activeTab === 'search'" class="loading-state">
          <div class="loading-spinner"></div>
          <p>{{ t('music.loading') }}</p>
        </div>

        <div v-if="activeTab === 'search' && hasSearched && !loading" class="results-section" ref="searchResultsContainer">
          <div class="results-info">
            <span class="result-count">"{{ lastSearch }}" — {{ searchResults.length }} {{ t('music.results') }}</span>
          </div>

          <div v-if="searchResults.length > 0" class="song-list">
            <div
              v-for="(song, index) in searchResults"
              :key="song.songmid + '-' + index"
              class="song-card"
              :style="{ '--index': index }"
              @mouseenter="hoveredSong = song.songmid"
              @mouseleave="hoveredSong = null"
            >
              <div class="song-rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
              <div class="song-cover" :style="{ backgroundImage: `url(${getAlbumImage(song.albummid)})` }">
                <div class="play-overlay" :class="{ visible: hoveredSong === song.songmid }" @click="playSong(song)">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div class="song-info">
                <h3 class="song-name">{{ song.songname }}</h3>
                <p class="song-artist">{{ formatArtists(song.singer) }}</p>
                <span class="song-album">{{ song.albumname }}</span>
              </div>
              <div class="song-actions">
                <button class="action-icon" :title="t('music.play')" @click="playSong(song)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <button class="action-icon" :title="t('music.lyric')" @click="showLyric(song)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                </button>
              </div>
              <div class="song-duration">{{ formatDuration(song.interval) }}</div>
            </div>

            <div v-if="searchLoadingMore" class="load-more-indicator">
              <div class="loading-spinner small"></div>
              <span>加载更多...</span>
            </div>
            <div v-else-if="!searchHasMore && searchResults.length > 20" class="load-more-end">
              <span>— 已加载全部结果 —</span>
            </div>
          </div>

          <div v-if="searchResults.length === 0 && !loading" class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 18V5l12-2v13M9 9l12-2"/>
              <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            <p>{{ t('music.noResults') }}</p>
          </div>
        </div>

        <div v-if="activeTab === 'rank'" class="rank-section">
          <div v-if="rankLoading && !showRankDetail" class="loading-state"><div class="loading-spinner"></div></div>

          <div v-if="showRankDetail" class="rank-detail-section">
            <button class="back-btn" @click="backToRankList">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              {{ t('music.backToList') || '返回榜单列表' }}
            </button>
            <h3 class="rank-detail-title">{{ rankDetailTitle }}</h3>
            <div v-if="rankDetailLoading" class="loading-state"><div class="loading-spinner"></div></div>
            <div v-else-if="rankDetailSongs.length > 0" class="song-list">
              <div
                v-for="(song, index) in rankDetailSongs"
                :key="song.songmid || index"
                class="song-card"
                :style="{ '--index': index }"
                @mouseenter="hoveredSong = song.songmid"
                @mouseleave="hoveredSong = null"
              >
                <div class="song-rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                <div class="song-cover" :style="{ backgroundImage: `url(${getAlbumImage(song.albummid)})` }">
                  <div class="play-overlay" :class="{ visible: hoveredSong === song.songmid }" @click="playSong(song)">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="song-info">
                  <h3 class="song-name">{{ song.songname }}</h3>
                  <p class="song-artist">{{ formatArtists(song.singer) }}</p>
                  <span class="song-album">{{ song.albumname }}</span>
                </div>
                <div class="song-actions">
                  <button class="action-icon" :title="t('music.play')" @click="playSong(song)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                  <button class="action-icon" :title="t('music.lyric')" @click="showLyric(song)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  </button>
                </div>
                <div class="song-duration">{{ formatDuration(song.interval) }}</div>
              </div>
              <button v-if="rankDetailSongs.length > 0" class="play-all-btn" @click="playAll(rankDetailSongs)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                {{ t('music.playAll') || '播放全部' }}
              </button>
            </div>
          </div>

          <div v-if="!showRankDetail && !rankLoading && topLists.length > 0" class="rank-grid">
            <div
              v-for="list in topLists"
              :key="list.id"
              class="rank-card"
              @click="loadRankDetail(list.id, list.title)"
            >
              <div class="rank-cover" :style="{ backgroundImage: `url(${list.cover || ''})` }">
                <div class="rank-badge">{{ list.updateTime || '' }}</div>
              </div>
              <div class="rank-info">
                <h4 class="rank-title">{{ list.title }}</h4>
                <span class="rank-count">{{ list.count || 0 }} {{ t('music.tracks') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'playlist'" class="playlist-section">
          <div v-if="playlistLoading && !showPlaylistDetail" class="loading-state"><div class="loading-spinner"></div></div>

          <div v-if="showPlaylistDetail" class="rank-detail-section">
            <button class="back-btn" @click="backToPlaylistList">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              {{ t('music.backToList') || '返回歌单列表' }}
            </button>
            <h3 class="rank-detail-title">{{ playlistDetailTitle }}</h3>
            <div v-if="playlistDetailLoading" class="loading-state"><div class="loading-spinner"></div></div>
            <div v-else-if="playlistDetailSongs.length > 0" class="song-list">
              <div
                v-for="(song, index) in playlistDetailSongs"
                :key="song.songmid || index"
                class="song-card"
                :style="{ '--index': index }"
                @mouseenter="hoveredSong = song.songmid"
                @mouseleave="hoveredSong = null"
              >
                <div class="song-rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                <div class="song-cover" :style="{ backgroundImage: `url(${getAlbumImage(song.albummid)})` }">
                  <div class="play-overlay" :class="{ visible: hoveredSong === song.songmid }" @click="playSong(song)">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="song-info">
                  <h3 class="song-name">{{ song.songname }}</h3>
                  <p class="song-artist">{{ formatArtists(song.singer) }}</p>
                  <span class="song-album">{{ song.albumname }}</span>
                </div>
                <div class="song-actions">
                  <button class="action-icon" :title="t('music.play')" @click="playSong(song)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                  <button class="action-icon" :title="t('music.lyric')" @click="showLyric(song)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  </button>
                </div>
                <div class="song-duration">{{ formatDuration(song.interval) }}</div>
              </div>
              <button v-if="playlistDetailSongs.length > 0" class="play-all-btn" @click="playAll(playlistDetailSongs)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                {{ t('music.playAll') || '播放全部' }}
              </button>
            </div>
            <div v-else-if="!playlistDetailLoading && playlistDetailSongs.length === 0" class="empty-state">
              <p>该歌单暂无歌曲数据</p>
            </div>
          </div>

          <div v-if="!showPlaylistDetail && !playlistLoading && playlists.length > 0" class="playlist-grid">
            <div
              v-for="pl in playlists"
              :key="pl.disstid"
              class="pl-card"
              @click="loadPlaylistDetail(pl.disstid, pl.dissname)"
            >
              <div class="pl-img" :style="{ backgroundImage: `url(${pl.imgurl || ''})` }">
                <div class="pl-play-hint">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div class="pl-info">
                <h4 class="pl-title">{{ pl.dissname || pl.creatorname || '' }}</h4>
                <span class="pl-creator">{{ pl.creatorname || '' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'newAlbum'" class="album-section">
          <div v-if="albumLoading" class="loading-state"><div class="loading-spinner"></div></div>
          <div v-else-if="newAlbums.length > 0" class="album-grid">
            <div v-for="al in newAlbums" :key="al.albummid" class="album-card">
              <div class="album-img" :style="{ backgroundImage: `url(${getAlbumImage(al.albummid)})` }"></div>
              <div class="album-info">
                <h4 class="album-name">{{ al.albumname || '' }}</h4>
                <span class="album-singer">{{ formatArtists(al.singer) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showLyricModal" class="lyric-modal-backdrop" @click.self="showLyricModal = false">
          <div class="lyric-modal">
            <div class="lyric-header">
              <h3>{{ currentSong?.songname }}</h3>
              <button class="close-btn" @click="showLyricModal = false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="lyric-body">
              <div v-if="lyricLoading" class="lyric-loading"><div class="loading-spinner small"></div></div>
              <pre v-else class="lyric-content">{{ lyricText || t('music.noLyric') }}</pre>
            </div>
          </div>
        </div>

      </div>
    </section>

    <MusicPlayer ref="playerRef" @toast="triggerToast" />

    <transition name="toast">
      <div v-if="showToast" class="player-toast">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, provide, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import musicService from '../services/musicService.js'
import MusicPlayer from '../components/MusicPlayer.vue'

const { t } = useI18n()

const searchInput = ref(null)
const searchKeyword = ref('')
const searchFocused = ref(false)
const searchResults = ref([])
const loading = ref(false)
const hasSearched = ref(false)
const lastSearch = ref('')
const hotKeys = ref([])
const hoveredSong = ref(null)

const activeTab = ref('playlist')
const topLists = ref([])
const rankLoading = ref(false)
const rankDetailSongs = ref([])
const rankDetailTitle = ref('')
const showRankDetail = ref(false)
const rankDetailLoading = ref(false)
const playlists = ref([])
const playlistLoading = ref(false)
const showPlaylistDetail = ref(false)
const playlistDetailSongs = ref([])
const playlistDetailTitle = ref('')
const playlistDetailLoading = ref(false)
const newAlbums = ref([])
const albumLoading = ref(false)

const showLyricModal = ref(false)
const currentSong = ref(null)
const lyricText = ref('')
const lyricLoading = ref(false)

const playerRef = ref(null)
const searchResultsContainer = ref(null)
const toastMessage = ref('')
const showToast = ref(false)

let scrollObserver = null

function triggerToast(msg) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

function setupScrollLoad() {
  if (scrollObserver) {
    scrollObserver.disconnect()
    scrollObserver = null
  }
  nextTick(() => {
    const container = searchResultsContainer.value
    if (!container) return
    const sentinel = document.createElement('div')
    sentinel.className = 'scroll-sentinel'
    container.appendChild(sentinel)
    scrollObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && searchHasMore.value && !searchLoadingMore.value && !loading.value && hasSearched.value && activeTab.value === 'search') {
        handleSearch(true)
      }
    }, { rootMargin: '200px' })
    scrollObserver.observe(sentinel)
  })
}

const searchPage = ref(1)
const searchTotalPages = ref(1)
const searchHasMore = ref(true)
const searchLoadingMore = ref(false)

const tabs = computed(() => [
  { key: 'playlist', label: t('music.tabPlaylist'), icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12H3M16 6H3M12 18H3"/></svg>' },
  { key: 'rank', label: t('music.tabRank'), icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/><path d="M15 7a3 3 0 1 0-6 0c0 2 3 5.5 3 5.5S15 9 15 7z"/></svg>' },
  { key: 'search', label: t('music.tabSearch'), icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' },
  { key: 'newAlbum', label: t('music.tabNewAlbum'), icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>' }
])

const playbackQueue = ref([])
const currentTrackIndex = ref(-1)
const playMode = ref('list')

provide('playbackQueue', playbackQueue)
provide('currentTrackIndex', currentTrackIndex)
provide('playMode', playMode)

async function handleSearch(isLoadMore = false) {
  const kw = searchKeyword.value.trim()
  if (!kw) return

  if (!isLoadMore) {
    showPlaylistDetail.value = false
    showRankDetail.value = false
    hasSearched.value = true
    lastSearch.value = kw
    activeTab.value = 'search'
    searchPage.value = 1
    searchHasMore.value = true
    loading.value = true
  } else {
    searchLoadingMore.value = true
  }

  try {
    const page = isLoadMore ? searchPage.value : 1
    const res = await musicService.searchSongs(kw, 20, page)
    if (res) {
      const songList = res.data?.song?.list || res.song?.list || []
      const mapped = songList.map(s => ({
        songmid: s.mid || s.songmid,
        songname: s.name || s.songname,
        singer: s.singer || [],
        albummid: s.album?.mid || s.albummid || '',
        albumname: s.album?.name || s.albumname || '',
        interval: s.interval || 0
      }))
      if (isLoadMore) {
        searchResults.value.push(...mapped)
      } else {
        searchResults.value = mapped
      }
      const total = res.data?.song?.totalnum || res.song?.totalnum || 0
      searchTotalPages.value = Math.ceil(total / 20)
      searchPage.value++
      if (searchPage.value > searchTotalPages.value) {
        searchHasMore.value = false
      }
    } else {
      searchHasMore.value = false
    }
  } catch (e) {
    console.error('搜索失败:', e)
    const isTimeout = e?.code === 'ECONNABORTED' || e?.message?.includes('timeout')
    if (!isLoadMore) {
      if (!isTimeout) searchResults.value = []
      if (isTimeout) triggerToast(t('music.searchTimeout') || '搜索请求超时，请稍后重试')
    } else {
      triggerToast(isTimeout ? '加载更多超时' : '加载更多失败')
    }
    searchHasMore.value = false
  } finally {
    if (isLoadMore) {
      searchLoadingMore.value = false
    } else {
      loading.value = false
      requestAnimationFrame(() => {
        const el = searchResultsContainer.value
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }
}

function quickSearch(key) {
  searchKeyword.value = key
  handleSearch()
}

function onBtnSearch() {
  Promise.resolve().then(() => handleSearch())
}

function onEnterSearch() {
  Promise.resolve().then(() => handleSearch())
}

function clearSearch() {
  searchKeyword.value = ''
  hasSearched.value = false
  searchResults.value = []
}

async function fetchHotKeys() {
  try {
    const res = await musicService.getHotKeys()
    if (res) {
      const list = res.data?.hotkey || res.hotkey || []
      hotKeys.value = list.map(k => {
        if (typeof k === 'string') return k
        return k.k || k.hotkey || k.word || k.key || ''
      }).filter(Boolean).slice(0, 10)
    }
  } catch (e) {
    console.error('获取热搜失败:', e)
  }
}

function switchTab(key) {
  activeTab.value = key
  if (key === 'rank') {
    showRankDetail.value = false
    if (topLists.value.length === 0) loadTopLists()
  }
  if (key === 'playlist') {
    showPlaylistDetail.value = false
    if (playlists.value.length === 0) loadPlaylists()
  }
  if (key === 'newAlbum' && newAlbums.value.length === 0) loadNewAlbums()
}

async function loadTopLists() {
  rankLoading.value = true
  try {
    const res = await musicService.getTopLists()
    if (res) {
      const groups = res.group || res.data?.group || []
      topLists.value = groups.flatMap(g => {
        const list = g.topList || g.content || []
        return list.map(t => ({
          id: t.id,
          title: t.title,
          cover: t.headPic || t.cover || '',
          updateTime: t.updateTime ? String(t.updateTime).slice(0, 10) : '',
          count: t.listenNum || t.listenCount || 0
        }))
      })
    }
  } catch (e) {
    console.error('获取榜单失败:', e)
  } finally {
    rankLoading.value = false
  }
}

async function loadPlaylists() {
  playlistLoading.value = true
  try {
    const res = await musicService.getSongLists(0, 30)
    if (res) {
      const list = res.data?.list || res.list || res.disslist || []
      playlists.value = list.map(pl => ({
        disstid: pl.diss_id || pl.dissid || pl.id,
        dissname: pl.diss_name || pl.dissname || pl.title || '',
        imgurl: pl.imgurl || pl.cover || '',
        creatorname: pl.creator_name || pl.creator?.nickname || pl.creatorname || ''
      }))
    }
  } catch (e) {
    console.error('获取歌单失败:', e)
  } finally {
    playlistLoading.value = false
  }
}

async function loadNewAlbums() {
  albumLoading.value = true
  try {
    const res = await musicService.getNewDisks(2, 20)
    if (res) {
      const data = res.new_album?.data || res.data || res
      const albumList = data.albumlib || data.list || data.albums || []
      if (albumList.length === 0 && data.area) {
        newAlbums.value = []
        return
      }
      newAlbums.value = albumList.map(a => ({
        albummid: a.album_mid || a.albummid || a.mid || '',
        albumname: a.album_name || a.albumname || a.name || '',
        singer: a.singers || a.singer || []
      }))
    }
  } catch (e) {
    console.error('获取新碟失败:', e)
  } finally {
    albumLoading.value = false
  }
}

function getAlbumImage(albummid) {
  if (!albummid) return 'https://y.gtimg.cn/mediastyle/global/img/cover_200.png'
  return `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albummid}.jpg`
}

function formatArtists(singers) {
  if (!singers) return ''
  if (Array.isArray(singers)) return singers.map(s => s.name || s).join(' / ')
  return String(singers)
}

function formatDuration(interval) {
  if (!interval) return '--:--'
  const m = Math.floor(interval / 60)
  const s = interval % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function playSong(song) {
  if (!song || !song.songmid) return

  let sourceList = null
  if (showRankDetail.value && rankDetailSongs.value.length > 0) {
    sourceList = rankDetailSongs.value
  } else if (showPlaylistDetail.value && playlistDetailSongs.value.length > 0) {
    sourceList = playlistDetailSongs.value
  } else if (activeTab.value === 'search' && searchResults.value.length > 0) {
    sourceList = searchResults.value
  }

  if (sourceList && sourceList.length > 0) {
    const existingMids = new Set(playbackQueue.value.map(s => s.songmid))
    const fresh = sourceList.filter(s => !existingMids.has(s.songmid))
    const clickIdxInSource = sourceList.findIndex(s => s.songmid === song.songmid)
    const clickIdxInFresh = fresh.findIndex(s => s.songmid === song.songmid)
    if (clickIdxInFresh >= 0) {
      currentTrackIndex.value = playbackQueue.value.length + clickIdxInFresh
    } else if (clickIdxInSource >= 0) {
      currentTrackIndex.value = playbackQueue.value.findIndex(s => s.songmid === song.songmid)
    }
    playbackQueue.value.push(...fresh.map(s => ({
      songmid: s.songmid,
      songname: s.songname,
      singer: s.singer,
      albummid: s.albummid,
      albumname: s.albumname,
      interval: s.interval
    })))
  } else {
    const idx = playbackQueue.value.findIndex(s => s.songmid === song.songmid)
    if (idx >= 0) {
      currentTrackIndex.value = idx
    } else {
      currentTrackIndex.value = playbackQueue.value.length
      playbackQueue.value.push({
        songmid: song.songmid,
        songname: song.songname,
        singer: song.singer,
        albummid: song.albummid,
        albumname: song.albumname,
        interval: song.interval
      })
    }
  }

  nextTick(() => {
    if (playerRef.value) playerRef.value.play()
  })
}

function playAll(results) {
  playbackQueue.value = results.map(s => ({
    songmid: s.songmid,
    songname: s.songname,
    singer: s.singer,
    albummid: s.albummid,
    albumname: s.albumname,
    interval: s.interval
  }))
  currentTrackIndex.value = 0
  nextTick(() => {
    if (playerRef.value) {
      playerRef.value.play()
    }
  })
}

async function showLyric(song) {
  if (!song.songmid) return
  currentSong.value = song
  showLyricModal.value = true
  lyricText.value = ''
  lyricLoading.value = true
  try {
    const res = await musicService.getLyric(song.songmid)
    if (res) {
      lyricText.value = res.lyric || res.data?.lyric || ''
    }
  } catch (e) {
    lyricText.value = t('music.lyricError')
  } finally {
    lyricLoading.value = false
  }
}

async function loadRankDetail(topId, title) {
  showRankDetail.value = true
  rankDetailTitle.value = title || t('music.rankDetail')
  rankDetailLoading.value = true
  rankDetailSongs.value = []
  try {
    const res = await musicService.getRanks(topId, 50, 1)
    if (res) {
      const data = res.req_1?.data || res.data || res
      const songs = data.songInfoList || data.songlist || data.list || []
      rankDetailSongs.value = songs.map((s) => ({
        songmid: s.mid || s.songmid || s.id,
        songname: s.name || s.songname || s.title,
        singer: s.singer || [],
        albummid: s.album?.mid || s.albummid || '',
        albumname: s.album?.name || s.albumname || '',
        interval: s.interval || 0
      }))
    }
  } catch (e) {
    console.error('加载榜单详情失败:', e)
  } finally {
    rankDetailLoading.value = false
  }
}

function backToRankList() {
  showRankDetail.value = false
  rankDetailSongs.value = []
}

async function loadPlaylistDetail(disstid, title) {
  showPlaylistDetail.value = true
  playlistDetailTitle.value = title || t('music.playlistDetail')
  playlistDetailLoading.value = true
  playlistDetailSongs.value = []
  try {
    const res = await musicService.getSongListDetail(disstid)
    if (res) {
      const data = res.cdlist?.[0] || res.data?.cdlist?.[0] || res.data || res
      const songs = data.songlist || data.songList || data.songs || []
      if (!songs.length) {
        console.warn('歌单详情数据为空, 原始响应:', JSON.stringify(res).slice(0, 500))
      }
      playlistDetailSongs.value = songs.map(s => ({
        songmid: s.mid || s.songmid,
        songname: s.name || s.songname,
        singer: s.singer || [],
        albummid: s.album?.mid || s.albummid || '',
        albumname: s.album?.name || s.albumname || '',
        interval: s.interval || 0
      }))
    }
  } catch (e) {
    console.error('加载歌单详情失败:', e)
  } finally {
    playlistDetailLoading.value = false
  }
}

function backToPlaylistList() {
  showPlaylistDetail.value = false
  playlistDetailSongs.value = []
}

onMounted(() => {
  fetchHotKeys()
  loadPlaylists()
})

watch([() => searchResults.value.length, activeTab], () => {
  if (activeTab.value === 'search' && hasSearched.value) {
    setupScrollLoad()
  }
})
</script>

<style scoped>
.music-page {
  padding-top: 80px;
  min-height: 100vh;
}

.page-header {
  padding: 3rem 0 0;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(180deg, rgba(var(--accent-cyan-rgb), 0.03) 0%, transparent 100%);
}

.header-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 3rem;
  align-items: start;
  padding-bottom: 2rem;
}

.page-title {
  font-family: var(--font-mono);
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 700;
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  animation: titleIn 0.7s ease-out;
}

@keyframes titleIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.title-icon {
  color: var(--accent-cyan);
  font-size: 1.6em;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.08); }
}

.page-desc {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.7;
  animation: fadeIn 0.6s ease-out 0.2s forwards;
  opacity: 0;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.45rem 0.75rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-card);
}

.search-box.focused {
  border-color: var(--accent-cyan);
  box-shadow: var(--shadow-glow), var(--shadow-card);
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: color 0.25s ease;
}

.search-box.focused .search-icon {
  color: var(--accent-cyan);
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.92rem;
  padding: 0.35rem 0.6rem;
  min-width: 0;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.clear-btn:hover {
  color: var(--error-color);
}

.search-btn {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.55rem 1.2rem;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-cyan-hover));
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(var(--accent-cyan-rgb), 0.35);
}

.hot-keys {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
}

.hot-label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.hot-tag {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  padding: 0.28rem 0.7rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.hot-tag:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  background: rgba(var(--accent-cyan-rgb), 0.06);
}

.hot-tag.top3 {
  border-color: rgba(var(--accent-orange-rgb), 0.3);
  color: var(--accent-orange);
}

.hot-tag.top3:hover {
  border-color: var(--accent-orange);
  background: rgba(var(--accent-orange-rgb), 0.08);
}

.tab-nav {
  display: flex;
  gap: 0.25rem;
  padding-bottom: 0;
  overflow-x: auto;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.83rem;
  padding: 0.7rem 1.2rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.tab-btn .tab-icon {
  display: flex;
  opacity: 0.7;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: rgba(var(--accent-cyan-rgb), 0.03);
}

.tab-btn.active {
  color: var(--accent-cyan);
  border-bottom-color: var(--accent-cyan);
}

.tab-btn.active .tab-icon {
  opacity: 1;
}

.music-content {
  padding: 2.5rem 0 5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--accent-cyan-rgb), 0.1);
  border-top-color: var(--accent-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results-info {
  margin-bottom: 1.5rem;
}

.result-count {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-muted);
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.song-card {
  display: grid;
  grid-template-columns: 42px 56px 1fr auto 70px;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.2rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateX(-16px);
  animation: slideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) calc(var(--index) * 0.05s) forwards;
}

@keyframes slideIn {
  to { opacity: 1; transform: translateX(0); }
}

.song-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-glow), var(--shadow-card);
  transform: translateX(4px);
}

.song-rank {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-muted);
  text-align: center;
  width: 100%;
}

.song-rank.top {
  color: var(--accent-cyan);
  text-shadow: 0 0 12px rgba(var(--accent-cyan-rgb), 0.3);
}

.song-cover {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-card));
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.play-overlay.visible {
  opacity: 1;
}

.play-overlay:hover {
  background: rgba(var(--accent-cyan-rgb), 0.7);
}

.song-info {
  min-width: 0;
  overflow: hidden;
}

.song-name {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.song-card:hover .song-name {
  color: var(--accent-cyan);
}

.song-artist {
  font-size: 0.82rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.15rem;
}

.song-album {
  font-size: 0.74rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions {
  display: flex;
  gap: 0.35rem;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.song-card:hover .song-actions {
  opacity: 1;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-icon:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  background: rgba(var(--accent-cyan-rgb), 0.08);
}

.song-duration {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: right;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  width: 64px;
  height: 64px;
  opacity: 0.25;
  margin-bottom: 1rem;
}

.rank-grid,
.playlist-grid,
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.rank-card,
.pl-card,
.album-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.rank-card:hover,
.pl-card:hover,
.album-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-4px);
  box-shadow: var(--shadow-glow), var(--shadow-card);
}

.rank-cover,
.pl-img,
.album-img {
  aspect-ratio: 1;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-card));
  background-size: cover;
  background-position: center;
  position: relative;
}

.rank-badge {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  padding: 0.2rem 0.55rem;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  color: #fff;
  border-radius: var(--radius-sm);
}

.rank-info,
.pl-info,
.album-info {
  padding: 0.85rem 1rem;
}

.rank-title,
.pl-title,
.album-name {
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rank-count,
.pl-creator,
.album-singer {
  font-size: 0.76rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.lyric-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease;
}

.lyric-modal {
  width: min(90vw, 580px);
  max-height: 75vh;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card), var(--shadow-glow);
  animation: modalIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.lyric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.lyric-header h3 {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: var(--error-color);
  background: rgba(var(--accent-pink-rgb), 0.08);
}

.lyric-body {
  padding: 1.5rem;
  max-height: 55vh;
  overflow-y: auto;
}

.lyric-loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.lyric-content {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 2;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  margin-bottom: 1.25rem;
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.rank-detail-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
}

.play-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-cyan-hover));
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.25s ease;
}

.play-all-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(var(--accent-cyan-rgb), 0.25);
}

.pl-play-hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pl-card:hover .pl-play-hint {
  opacity: 1;
}

.playlist-section {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.scroll-sentinel {
  height: 1px;
  width: 100%;
}

.load-more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1.25rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.load-more-end {
  text-align: center;
  padding: 1rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.player-toast {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2001;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  box-shadow: var(--shadow-card), 0 0 24px rgba(var(--accent-cyan-rgb), 0.08);
  white-space: nowrap;
  transition: background var(--transition-normal), border-color var(--transition-normal);
}

.player-toast svg {
  color: var(--accent-cyan);
  flex-shrink: 0;
}

.toast-enter-active {
  animation: toastIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-leave-active {
  animation: toastOut 0.25s ease forwards;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(16px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@keyframes toastOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@media (max-width: 900px) {
  .header-grid {
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }

  .song-card {
    grid-template-columns: 32px 48px 1fr auto;
    gap: 0.7rem;
    padding: 0.7rem 0.85rem;
  }

  .song-duration {
    display: none;
  }

  .rank-grid,
  .playlist-grid,
  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.85rem;
  }
}

@media (max-width: 600px) {
  .song-card {
    grid-template-columns: 28px 44px 1fr;
    gap: 0.6rem;
    padding: 0.65rem 0.75rem;
  }

  .song-actions {
    display: none;
  }

  .song-cover {
    width: 44px;
    height: 44px;
  }

  .tab-btn {
    padding: 0.6rem 0.85rem;
    font-size: 0.78rem;
  }

  .rank-grid,
  .playlist-grid,
  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
