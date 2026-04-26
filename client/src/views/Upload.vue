<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import api from '../api'

const albums = ref<any[]>([])
const albumName = ref('')
const albumDesc = ref('')
const selectedAlbumId = ref('')
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const creatingAlbum = ref(false)
const createError = ref('')
const createSuccess = ref('')

const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')

// 管理照片相关
const photos = ref<any[]>([])
const showManage = ref(false)
const deletingId = ref<number | null>(null)

onMounted(async () => {
  const res = await api.get('/api/albums')
  albums.value = res.data
})

// 监听选中相册变化，获取照片列表
watch(selectedAlbumId, async (newAlbumId) => {
  if (newAlbumId) {
    showManage.value = true
    await fetchPhotos()
  }
  else {
    showManage.value = false
    photos.value = []
  }
})

async function fetchPhotos() {
  if (!selectedAlbumId.value)
    return
  const res = await api.get(`/api/photos/album/${selectedAlbumId.value}`)
  photos.value = res.data
}

async function createAlbum() {
  creatingAlbum.value = true
  createError.value = ''
  createSuccess.value = ''
  try {
    const res = await api.post('/api/albums', {
      name: albumName.value,
      description: albumDesc.value,
    })
    albums.value.unshift(res.data)
    albumName.value = ''
    albumDesc.value = ''
    createSuccess.value = '相册创建成功！'
    selectedAlbumId.value = String(res.data.id)
  }
  catch (e: any) {
    createError.value = e.response?.data?.error || '创建失败'
  }
  finally {
    creatingAlbum.value = false
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    selectedFile.value = target.files[0]
    previewUrl.value = URL.createObjectURL(target.files[0])
    target.value = ''
  }
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file?.type.startsWith('image/')) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

function clearSelection() {
  selectedFile.value = null
  previewUrl.value = null
  if (fileInput.value)
    fileInput.value.value = ''
}

async function uploadPhoto() {
  if (!selectedFile.value || !selectedAlbumId.value)
    return

  uploading.value = true
  uploadError.value = ''
  uploadSuccess.value = ''

  const formData = new FormData()
  formData.append('photo', selectedFile.value)
  formData.append('albumId', selectedAlbumId.value)

  try {
    await api.post('/api/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    uploadSuccess.value = '上传成功！'
    clearSelection()
    fetchPhotos()
  }
  catch (e: any) {
    uploadError.value = e.response?.data?.error || '上传失败'
  }
  finally {
    uploading.value = false
  }
}

async function deletePhoto(photoId: number) {
  if (!confirm('确定要删除这张照片吗？'))
    return

  deletingId.value = photoId
  try {
    await api.delete(`/api/photos/${photoId}`)
    photos.value = photos.value.filter(p => p.id !== photoId)
  }
  catch (e: any) {
    alert(e.response?.data?.error || '删除失败')
  }
  finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="upload-page">
    <h1>上传图片</h1>

    <!-- 创建相册 -->
    <div class="section">
      <h2>创建新相册</h2>
      <form class="create-form" @submit.prevent="createAlbum">
        <input v-model="albumName" placeholder="相册名称" required>
        <input v-model="albumDesc" placeholder="相册描述（可选）">
        <button type="submit" :disabled="creatingAlbum">
          创建相册
        </button>
      </form>
      <p v-if="createError" class="error">
        {{ createError }}
      </p>
      <p v-if="createSuccess" class="success">
        {{ createSuccess }}
      </p>
    </div>

    <!-- 上传图片 -->
    <div class="section">
      <h2>上传图片</h2>
      <div class="form-group">
        <label>选择相册</label>
        <select v-model="selectedAlbumId" required>
          <option value="">
            请选择相册
          </option>
          <option v-for="album in albums" :key="album.id" :value="album.id">
            {{ album.name }}
          </option>
        </select>
      </div>

      <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
        <input v-if="!previewUrl" ref="fileInput" type="file" accept="image/*" @change="handleFileChange">
        <div v-if="previewUrl" class="preview-container">
          <img :src="previewUrl" alt="Preview">
          <button type="button" class="remove-btn" @click.stop="clearSelection">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p v-else>
          拖拽图片到此处或点击选择
        </p>
      </div>

      <button
        :disabled="!selectedFile || uploading"
        class="upload-btn"
        @click="uploadPhoto"
      >
        {{ uploading ? '上传中...' : '上传' }}
      </button>
      <p v-if="uploadError" class="error">
        {{ uploadError }}
      </p>
      <p v-if="uploadSuccess" class="success">
        {{ uploadSuccess }}
      </p>
    </div>

    <!-- 照片管理 -->
    <div v-if="showManage && photos.length > 0" class="section">
      <h2>管理照片</h2>
      <div class="photo-list">
        <div v-for="photo in photos" :key="photo.id" class="photo-item">
          <img :src="photo.url" :alt="photo.filename">
          <button
            type="button"
            class="delete-btn"
            :disabled="deletingId === photo.id"
            @click="deletePhoto(photo.id)"
          >
            {{ deletingId === photo.id ? '删除中...' : '删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

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
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.preview-container {
  position: relative;
  width: 100%;
}

.preview-container img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: contain;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.6);
  border: none;
  color: #fff;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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

.photo-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.photo-item {
  position: relative;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.photo-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: #e53935;
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover {
  background: #c62828;
}

.delete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
