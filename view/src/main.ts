// 创建 app，在服务端和客户端间共享
import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import { createRouter } from './router';

import './assets/main.css';

// 每次请求时调用创建一个新的 app
export function createApp() {
  const app = createSSRApp(App);

  // 对每个请求都创建新的 router 和 pinia
  const router = createRouter();
  const pinia = createPinia();

  app.use(router);
  app.use(pinia);

  app.config.errorHandler = (err, instance, info) => {
    // 向追踪服务报告错误
    console.log('app error', err, info, instance);
  };

  return { app, router, pinia };
}
