import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Album from '../views/Album.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Upload from '../views/Upload.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/album/:id', component: Album },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/upload', component: Upload },
  ],
});

export default router;