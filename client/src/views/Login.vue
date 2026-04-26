<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import EyeIcon from '../icons/EyeIcon.vue'
import EyeOffIcon from '../icons/EyeOffIcon.vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.value.username, form.value.password)
    router.push('/')
  }
  catch (e: any) {
    error.value = e.response?.data?.error || '登录失败'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>登录</h1>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <input v-model="form.username" placeholder="用户名" required>
        </div>
        <div class="form-group password-input">
          <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="密码" required>
          <button type="button" class="toggle-password" @click="showPassword = !showPassword">
            <EyeIcon v-if="showPassword" />
            <EyeOffIcon v-else />
          </button>
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p v-if="error" class="error">
          {{ error }}
        </p>
      </form>
      <p class="switch-link">
        还没有账号？<router-link to="/register">
          注册
        </router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding-top: 80px;
}

.auth-card {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.auth-card h1 {
  text-align: center;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 48px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #666;
  width: auto;
}

button {
  width: 100%;
  padding: 12px;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
}

.error {
  color: #e53935;
  text-align: center;
  margin-top: 16px;
}

.switch-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}
</style>
