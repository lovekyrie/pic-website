<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>注册</h1>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <input v-model="form.username" placeholder="用户名" required />
        </div>
        <div class="form-group">
          <input v-model="form.password" type="password" placeholder="密码" required />
        </div>
        <div class="form-group">
          <input v-model="form.confirmPassword" type="password" placeholder="确认密码" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <p class="switch-link">
        已有账号？<router-link to="/login">登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({ username: '', password: '', confirmPassword: '' });
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次密码不一致';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    await authStore.register(form.value.username, form.value.password);
    router.push('/');
  } catch (e: any) {
    error.value = e.response?.data?.error || '注册失败';
  } finally {
    loading.value = false;
  }
}
</script>

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