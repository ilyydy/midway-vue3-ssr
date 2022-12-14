import { renderToString } from "vue/server-renderer";
import { basename } from "path";

import { createApp } from "./main";

import type { RouteLocationRaw } from "vue-router";

// 该函数被服务端调用，创建 app，进行路由跳转，渲染 HTML 为字符串，获取需要预加载的各类资源，一起交给服务端进行渲染
export async function render(
  to: RouteLocationRaw,  // 要跳转的路由
  manifest: Record<string, string[]>
) {
  const { app, router, pinia } = createApp();

  await router.push(to);
  await router.isReady();

  // passing SSR context object which will be available via useSSRContext()
  // @vitejs/plugin-vue injects code into a component's setup() that registers
  // itself on ctx.modules. After the render, ctx.modules would contain all the
  // components that have been instantiated during this render call.
  const ctx = {} as { modules: Set<string> };
  const html = await renderToString(app, ctx);
  // ctx.modules 现在是一个渲染期间使用的模块 ID 的 Set。清单包含模块 ID 到它们关联的 chunk 和资源文件的映射。

  // the SSR manifest generated by Vite contains module -> chunk/asset mapping
  // which we can then use to determine what files need to be preloaded for this
  // request.
  const preloadLinks = renderPreloadLinks(ctx.modules, manifest);

  const response = {
    html,  // 渲染为字符串的 html
    preloadLinks, // 需要预加载的各类资源
    pinia: JSON.stringify(pinia.state.value),  // 将 pinia 已有的状态序列化，用于后面客户端激活
    appInfo: {},  // 自行添加的字段，可用于放置一些固定的 app 信息，如 title，应用描述等，可在服务端渲染时加到页面上
  };
  return response;
}

function renderPreloadLinks(
  modules: Set<string>,
  manifest: Record<string, string[]>
) {
  let links = "";
  const seen = new Set();

  modules.forEach((id) => {
    const files = manifest[id];
    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file);
          const filename = basename(file);
          if (manifest[filename]) {
            for (const depFile of manifest[filename]) {
              links += renderPreloadLink(depFile);
              seen.add(depFile);
            }
          }
          links += renderPreloadLink(file);
        }
      });
    }
  });
  return links;
}

function renderPreloadLink(file: string) {
  if (file.endsWith(".js")) {
    return `<link rel="modulepreload" crossorigin href="${file}">`;
  } else if (file.endsWith(".css")) {
    return ` <link rel="stylesheet" href="${file}">`;
  } else if (file.endsWith(".woff")) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
  } else if (file.endsWith(".woff2")) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
  } else if (file.endsWith(".gif")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/gif">`;
  } else if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`;
  } else if (file.endsWith(".png")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/png">`;
  } else {
    // TODO
    return "";
  }
}
