<template>
  <div class="upload-page">
    <h1>上传图片</h1>

    <!-- 创建相册 -->
    <div class="section">
      <h2>创建新相册</h2>
      <form @submit.prevent="createAlbum" class="create-form">
        <input v-model="albumName" placeholder="相册名称" required />
        <input v-model="albumDesc" placeholder="相册描述（可选）" />
        <button type="submit" :disabled="creatingAlbum">创建相册</button>
      </form>
      <p v-if="createError" class="error">{{ createError }}</p>
      <p v-if="createSuccess" class="success">{{ createSuccess }}</p>
    </div>

    <!-- 上传图片 -->
    <div class="section">
      <h2>上传图片</h2>
      <div class="form-group">
        <label>选择相册</label>
        <select v-model="selectedAlbumId" required>
          <option value="">请选择相册</option>
          <option v-for="album in albums" :key="album.id" :value="album.id">
            {{ album.name }}
          </option>
        </select>
      </div>

      <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
        <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" />
        <p>拖拽图片到此处或点击选择</p>
      </div>

      <button
        @click="uploadPhoto"
        :disabled="!selectedFile || uploading"
        class="upload-btn"
      >
        {{ uploading ? '上传中...' : '上传' }}
      </button>
      <p v-if="uploadError" class="error">{{ uploadError }}</p>
      <p v-if="uploadSuccess" class="success">{{ uploadSuccess }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';

const albums = ref<any[]>([]);
const albumName = ref('');
const albumDesc = ref('');
const selectedAlbumId = ref('');
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const creatingAlbum = ref(false);
const createError = ref('');
const createSuccess = ref('');

const uploading = ref(false);
const uploadError = ref('');
const uploadSuccess = ref('');

onMounted(async () => {
  const res = await api.get('/api/albums');
  albums.value = res.data;
});

async function createAlbum() {
  creatingAlbum.value = true;
  createError.value = '';
  createSuccess.value = '';
  try {
    const res = await api.post('/api/albums', {
      name: albumName.value,
      description: albumDesc.value,
    });
    albums.value.unshift(res.data);
    albumName.value = '';
    albumDesc.value = '';
    createSuccess.value = '相册创建成功！';
    selectedAlbumId.value = String(res.data.id);
  } catch (e: any) {
    createError.value = e.response?.data?.error || '创建失败';
  } finally {
    creatingAlbum.value = false;
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) {
    selectedFile.value = target.files[0];
  }
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0];
  if (file?.type.startsWith('image/')) {
    selectedFile.value = file;
  }
}

async function uploadPhoto() {
  if (!selectedFile.value || !selectedAlbumId.value) return;

  uploading.value = true;
  uploadError.value = '';
  uploadSuccess.value = '';

  const formData = new FormData();
  formData.append('photo', selectedFile.value);
  formData.append('albumId', selectedAlbumId.value);

  try {
    await api.post('/api/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    uploadSuccess.value = '上传成功！';
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
  } catch (e: any) {
    uploadError.value = e.response?.data?.error || '上传失败';
  } finally {
    uploading.value = false;
  }
}
</script>

<style scoped>
.upload-page {
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 30px;
}

.section {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.section h2 {
  font-size: 18px;
  margin-bottom: 20px;
}

.create-form {
  display: flex;
  gap: 12px;
}

.create-form input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.create-form button {
  padding: 10px 20px;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  position: relative;
}

.upload-area input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-btn {
  width: 100%;
  padding: 12px;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.upload-btn:disabled {
  opacity: 0.6;
}

.error {
  color: #e53935;
  margin-top: 12px;
}

.success {
  color: #4caf50;
  margin-top: 12px;
}
</style>