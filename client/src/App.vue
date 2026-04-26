<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div id="app">
    <nav class="navbar">
      <div class="container nav-content">
        <router-link to="/" class="logo">
          📷 个人相册
        </router-link>
        <div class="nav-links">
          <template v-if="authStore.user">
            <router-link to="/upload">
              上传
            </router-link>
            <span>{{ authStore.user.username }}</span>
            <button @click="handleLogout">
              退出
            </button>
          </template>
          <template v-else>
            <router-link to="/login">
              登录
            </router-link>
            <router-link to="/register">
              注册
            </router-link>
          </template>
        </div>
      </div>
    </nav>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.navbar {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 15px 0;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.nav-links button:hover {
  color: #333;
}
</style>
