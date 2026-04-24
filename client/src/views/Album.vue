<template>
  <div class="album-detail">
    <div class="album-header">
      <h1>{{ album?.name }}</h1>
      <p>{{ album?.description || '暂无描述' }}</p>
      <span class="album-owner">by {{ album?.owner_name }}</span>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="photos.length === 0" class="empty">暂无图片</div>
    <div v-else class="photo-grid">
      <div v-for="photo in photos" :key="photo.id" class="photo-item">
        <img :src="photo.url" :alt="photo.filename" @click="previewPhoto(photo.url)" />
      </div>
    </div>

    <!-- 预览弹窗 -->
    <div v-if="previewUrl" class="preview-overlay" @click="previewUrl = null">
      <img :src="previewUrl" alt="Preview" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const album = ref<any>(null);
const photos = ref<any[]>([]);
const loading = ref(true);
const previewUrl = ref<string | null>(null);

onMounted(async () => {
  const albumId = route.params.id;
  try {
    const [albumRes, photosRes] = await Promise.all([
      api.get(`/api/albums/${albumId}`),
      api.get(`/api/photos/album/${albumId}`),
    ]);
    album.value = albumRes.data;
    photos.value = photosRes.data;
  } finally {
    loading.value = false;
  }
});

function previewPhoto(url: string) {
  previewUrl.value = url;
}
</script>

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
</style>