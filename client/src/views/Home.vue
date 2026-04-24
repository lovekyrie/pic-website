<template>
  <div class="home">
    <h1>相册列表</h1>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="albums.length === 0" class="empty">暂无相册</div>
    <div v-else class="album-grid">
      <router-link
        v-for="album in albums"
        :key="album.id"
        :to="`/album/${album.id}`"
        class="album-card"
      >
        <div class="album-cover">
          <img v-if="album.cover_url" :src="album.cover_url" :alt="album.name" />
          <span v-else class="no-cover">📁</span>
        </div>
        <div class="album-info">
          <h3>{{ album.name }}</h3>
          <p>{{ album.description || '暂无描述' }}</p>
          <span class="album-owner">by {{ album.owner_name }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';

const albums = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await api.get('/api/albums');
    albums.value = res.data;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.home h1 {
  margin-bottom: 30px;
}

.loading, .empty {
  text-align: center;
  color: #999;
  padding: 50px;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.album-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.album-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.album-cover {
  height: 200px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  font-size: 48px;
}

.album-info {
  padding: 16px;
}

.album-info h3 {
  margin-bottom: 8px;
}

.album-info p {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.album-owner {
  font-size: 12px;
  color: #999;
}
</style>