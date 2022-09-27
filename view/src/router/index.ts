import {
  createRouter as _createRouter,
  createWebHistory,
  createMemoryHistory,
} from "vue-router";
import HomeView from "../views/HomeView.vue";

export function createRouter() {
  return _createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory(import.meta.env.BASE_URL)
      : createWebHistory(import.meta.env.BASE_URL),
    routes: [
      {
        path: "/",
        name: "home",
        component: HomeView,
      },
      {
        path: "/about",
        name: "about",
        // route level code-splitting
        // this generates a separate chunk (About.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import("../views/AboutView.vue"),
      },
    ],
  });
}
