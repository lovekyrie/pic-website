<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const album = ref<any>(null)
const photos = ref<any[]>([])
const loading = ref(true)
const previewUrl = ref<string | null>(null)
const currentIndex = ref(0)

onMounted(async () => {
  const albumId = route.params.id
  try {
    const [albumRes, photosRes] = await Promise.all([
      api.get(`/api/albums/${albumId}`),
      api.get(`/api/photos/album/${albumId}`),
    ])
    album.value = albumRes.data
    photos.value = photosRes.data
  }
  finally {
    loading.value = false
  }
})

function previewPhoto(url: string) {
  currentIndex.value = photos.value.findIndex(p => p.url === url)
  previewUrl.value = url
}

function closePreview() {
  previewUrl.value = null
}

function prevPhoto() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    previewUrl.value = photos.value[currentIndex.value].url
  }
}

function nextPhoto() {
  if (currentIndex.value < photos.value.length - 1) {
    currentIndex.value++
    previewUrl.value = photos.value[currentIndex.value].url
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft')
    prevPhoto()
  if (e.key === 'ArrowRight')
    nextPhoto()
  if (e.key === 'Escape')
    closePreview()
}
</script>

<template>
  <div class="album-detail">
    <div class="album-header">
      <h1>{{ album?.name }}</h1>
      <p>{{ album?.description || '暂无描述' }}</p>
      <span class="album-owner">by {{ album?.owner_name }}</span>
    </div>

    <div v-if="loading" class="loading">
      加载中...
    </div>
    <div v-else-if="photos.length === 0" class="empty">
      暂无图片
    </div>
    <div v-else class="photo-grid">
      <div v-for="photo in photos" :key="photo.id" class="photo-item">
        <img :src="photo.url" :alt="photo.filename" @click="previewPhoto(photo.url)">
      </div>
    </div>

    <!-- 预览弹窗 -->
    <div v-if="previewUrl" class="preview-overlay" @click.self="closePreview" @keydown="handleKeydown">
      <button class="nav-btn prev-btn" :disabled="currentIndex <= 0" @click="prevPhoto">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <img :src="previewUrl" alt="Preview" class="preview-image" @click.stop>
      <button class="nav-btn next-btn" :disabled="currentIndex >= photos.length - 1" @click="nextPhoto">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      <button class="close-btn" @click="closePreview">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div class="photo-counter">
        {{ currentIndex + 1 }} / {{ photos.length }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.album-header {
  margin-bottom: 30px;
}

.album-header h1 {
  margin-bottom: 10px;
}

.album-header p {
  color: #666;
  margin-bottom: 10px;
}

.album-owner {
  font-size: 14px;
  color: #999;
}

.loading, .empty {
  text-align: center;
  color: #999;
  padding: 50px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.photo-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.photo-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.2s;
}

.photo-item:hover img {
  transform: scale(1.05);
}

.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-overlay img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.preview-image {
  cursor: default;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.1);
  border: none;
  color: #fff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.2);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255,255,255,0.2);
}

.photo-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 14px;
  background: rgba(0,0,0,0.5);
  padding: 6px 12px;
  border-radius: 20px;
}
</style>
