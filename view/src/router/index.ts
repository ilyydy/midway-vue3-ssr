import {
  createRouter as _createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import { VIEW_ROUTE_PREFIX } from '@share/constant';

export function createRouter() {
  return _createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory(VIEW_ROUTE_PREFIX)
      : createWebHistory(VIEW_ROUTE_PREFIX),
    routes: [
      {
        path: '/',
        name: 'home',
        component: HomeView,
      },
      {
        path: '/about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (About.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/AboutView.vue'),
      },
      {
        name: 'notFound',
        path: '/:pathMatch(.*)*',
        component: () => import('@/views/NotFoundView.vue'),
      },
    ],
  });
}
