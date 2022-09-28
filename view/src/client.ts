import { createApp } from "./main";

let renderType = (window as any).__renderType;
if (renderType !== 'csr' && renderType !== 'ssr') {
  renderType = 'ssr';
}

const { app, router, pinia } = createApp(renderType);

// pinia 的状态激活
// 服务端渲染时将 pinia 的状态挂载到 window.__pinia 上
// @see https://pinia.vuejs.org/ssr/#state-hydration
if ((window as any).__pinia) {
  pinia.state.value = (window as any).__pinia;
}

// 路由加载完成后在挂载
router.isReady().then(() => {
  app.mount("#app");
});

export {};
