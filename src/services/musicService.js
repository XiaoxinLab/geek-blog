import axios from 'axios'

const MUSIC_API_BASE = import.meta.env.VITE_MUSIC_API_URL || 'http://localhost:3200'

const musicApi = axios.create({
  baseURL: MUSIC_API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

function unwrap(res) {
  return res?.data?.response || res?.data || res
}

export const searchSongs = (keyword, limit = 10, page = 1) =>
  musicApi.get(`/getSearchByKey/${encodeURIComponent(keyword)}/${limit}/${page}/1`, { timeout: 30000 }).then(unwrap)

export const getHotKeys = () =>
  musicApi.get('/getHotkey').then(unwrap)

export const getSongInfo = (songmid) =>
  musicApi.get(`/getSongInfo/${songmid}`).then(unwrap)

export const getMusicPlay = (songmid, quality = 128) =>
  musicApi.get('/getMusicPlay', { params: { songmid, quality, resType: 'play' } }).then(unwrap)

export const getLyric = (songmid) =>
  musicApi.get('/getLyric', { params: { songmid, isFormat: 1 } }).then(unwrap)

export const getTopLists = () =>
  musicApi.get('/getTopLists').then(unwrap)

export const getRanks = (topId, limit = 20, page = 1) =>
  musicApi.get(`/getRanks/${topId}/${limit}/${page}`).then(unwrap)

export const getRecommend = () =>
  musicApi.get('/getRecommend').then(unwrap)

export const getSongListCategories = () =>
  musicApi.get('/getSongListCategories').then(unwrap)

export const getSongLists = (page = 0, limit = 20, categoryId = 10000000, sortId = 5) => {
  return musicApi.get(`/getSongLists/${page}/${limit}/${categoryId}/${sortId}`).then(unwrap)
}

export const getSongListDetail = (disstid) =>
  musicApi.get('/getSongListDetail', { params: { disstid } }).then(unwrap)

export const getNewDisks = (page = 1, limit = 10) =>
  musicApi.get(`/getNewDisks/${page}/${limit}`).then(unwrap)

export const getSingerList = (area = -100, sex = -100, genre = -100, index = -100, page = 1) =>
  musicApi.get(`/getSingerList/${area}/${sex}/${genre}/${index}/${page}`).then(unwrap)

export const getSingerHotsong = (singermid, limit = 15, page = 1) =>
  musicApi.get(`/getSingerHotsong/${singermid}/${limit}/${page}`).then(unwrap)

export const getMvList = (area_id = 15, version_id = 7, limit = 12, page = 1) =>
  musicApi.get(`/getMv/${area_id}/${version_id}/${limit}/${page}`).then(unwrap)

export const getComments = (id, pagesize = 15, pagenum = 1) =>
  musicApi.get(`/getComments/${id}/0/0/${pagesize}/${pagenum}/1/2`).then(unwrap)

export default {
  searchSongs,
  getHotKeys,
  getSongInfo,
  getMusicPlay,
  getLyric,
  getTopLists,
  getRanks,
  getRecommend,
  getSongListCategories,
  getSongLists,
  getSongListDetail,
  getNewDisks,
  getSingerList,
  getSingerHotsong,
  getMvList,
  getComments
}
