import { createApp } from './main';
import { CSR, SSR } from '@share/constant';

let renderType = window.__renderType;
if (renderType !== CSR && renderType !== SSR) {
  renderType = SSR;
}

const { app, router, pinia } = createApp(renderType);

// pinia 的状态激活
// 服务端渲染时将 pinia 的状态挂载到 window.__pinia 上
// @see https://pinia.vuejs.org/ssr/#state-hydration
if (window.__pinia) {
  pinia.state.value = window.__pinia;
}

// 路由加载完成后在挂载
router.isReady().then(() => {
  app.mount('#app');
});

export {};
