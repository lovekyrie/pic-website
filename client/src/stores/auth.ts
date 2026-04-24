import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '');
  const user = ref<{ id: number; username: string } | null>(null);

  function setToken(t: string) {
    token.value = t;
    localStorage.setItem('token', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  }

  function setUser(u: { id: number; username: string } | null) {
    user.value = u;
  }

  async function fetchUser() {
    if (!token.value) return;
    try {
      const res = await api.get('/api/auth/me');
      user.value = res.data;
    } catch {
      logout();
    }
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }

  async function login(username: string, password: string) {
    const res = await api.post('/api/auth/login', { username, password });
    setToken(res.data.token);
    setUser(res.data.user);
  }

  async function register(username: string, password: string) {
    const res = await api.post('/api/auth/register', { username, password });
    setToken(res.data.token);
    setUser(res.data.user);
  }

  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    fetchUser();
  }

  return { token, user, login, register, logout, fetchUser };
});