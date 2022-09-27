# Midway + Vue3 + Vite 的全栈 SSR demo 工程

从头开始搭建一个基于 [Midway](https://www.midwayjs.org/docs/intro) 是 Node.js 后端框架和 [Vue3](https://cn.vuejs.org/guide/introduction.html) + [Vite](https://cn.vitejs.dev/) 的 SSR + CSR 全栈 demo 工程

## 合并 Midway 和 Vue 工程

先使用命令 `npm init midway` 初始化一个 Midway koa-v3 标准项目，项目根目录结构如下：

├── README.md
├── README.zh-CN.md
├── bootstrap.js
├── jest.config.js
├── package.json
├── src
├── test
└── tsconfig.json

前端代码我选择放在项目根目录下的 view 目录，在其中初始化一个 Vite 的 Vue3 项目

```bash
npm init vue@latest

# Project name 输入 view
# TypeScript yes
# JSX yes
# Vue Router yes
# Pinia yes
# ESLint yes
# Prettier yes
```

view 的根目录结构如下：

├── README.md
├── env.d.ts
├── index.html
├── package.json
├── public
├── src
├── tsconfig.config.json
├── tsconfig.json
└── vite.config.ts

将前端 package.json 的依赖和 scripts 命令按需移动到项目根目录 package.json，重复的 scripts 命令用 midway 和 view 区分前后端，前端一些命令指定 view 目录，合并后如下：

```json
{
  "dependencies": {
    "@midwayjs/bootstrap": "^3.0.0",
    "@midwayjs/core": "^3.0.0",
    "@midwayjs/decorator": "^3.0.0",
    "@midwayjs/info": "^3.0.0",
    "@midwayjs/koa": "^3.0.0",
    "@midwayjs/logger": "^2.14.0",
    "@midwayjs/validate": "^3.0.0",
    "pinia": "^2.0.21",
    "vue": "^3.2.38",
    "vue-router": "^4.1.5"
  },
  "devDependencies": {
    "@midwayjs/cli": "^1.2.90",
    "@midwayjs/mock": "^3.0.0",
    "@types/jest": "^26.0.10",
    "@types/koa": "^2.13.4",
    "@types/node": "14",
    "cross-env": "^6.0.0",
    "jest": "^26.4.0",
    "mwts": "^1.0.5",
    "ts-jest": "^26.2.0",
    "@rushstack/eslint-patch": "^1.1.4",
    "@vitejs/plugin-vue": "^3.0.3",
    "@vitejs/plugin-vue-jsx": "^2.0.1",
    "@vue/eslint-config-prettier": "^7.0.0",
    "@vue/eslint-config-typescript": "^11.0.0",
    "@vue/tsconfig": "^0.1.3",
    "eslint": "^8.22.0",
    "eslint-plugin-vue": "^9.3.0",
    "npm-run-all": "^4.1.5",
    "prettier": "^2.7.1",
    "typescript": "~4.7.4",
    "vite": "^3.0.9",
    "vue-tsc": "^0.40.7"
  },
  "scripts": {
    "start": "NODE_ENV=production node ./bootstrap.js",
    "dev": "cross-env NODE_ENV=local midway-bin dev --ts",
    "build:midway": "midway-bin build -c",
    "test": "midway-bin test --ts",
    "cov": "midway-bin cov --ts",
    "lint": "run-p lint:midway lint:view",
    "lint:midway": "mwts fix",
    "ci": "npm run cov",
    "dev:view": "vite -c view/vite.config.ts view",
    "preview:view": "vite preview --port 4173",
    "build:view": "run-p type-check build-only:view",
    "build-only:view": "vite -c view/vite.config.ts build view",
    "type-check": "vue-tsc -p view/tsconfig.json --noEmit",
    "lint:view": "eslint view -c ./view/.eslintrc.cjs --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix"
  },
}
```

view 目录删除 README.md、.gitignore 等无用文件。vite.config.ts 增加 build.outDir 配置 '../public'，让前端编译的代码在项目根目录下的 public

分别修改项目根目录的 tsconfig.json、.eslintrc.json，排除 view 目录前端代码

## 前端 SSR 配置

为了在服务器和客户端之间共享相同的应用代码，并且避免[跨请求状态污染](https://cn.vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution)，view/src/main.ts 改造为：

```ts
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
```

对于 vue-router 需要暴露一个 createRouter 函数，并根据是否是 SSR 使用不同的 [history 创建方法](https://router.vuejs.org/zh/guide/migration/index.html#%E6%96%B0%E7%9A%84-history-%E9%85%8D%E7%BD%AE%E5%8F%96%E4%BB%A3-mode)，view/src/router/index.ts 改造为：

```ts
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
```

服务端通过一个 server.ts 入口文件导入通用代码创建应用：

```ts
// view/src/server.ts
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
```

客户端（也即浏览器端）通过一个 client.ts 入口文件创建应用：

```ts
import { createApp } from "./main";

const { app, router, pinia } = createApp();

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
```

默认情况下 Vite [SSR 构建产物是 ESM 格式](https://cn.vitejs.dev/guide/ssr.html#ssr-format)，而服务端 midway 是 commonjs，所以需要配置 view/vite.config.ts，使构建产物是 commonjs

```ts
  ssr: {
    format: 'cjs',
  },
```

package.json 新增两条 scripts 命令，分别进行客户端构建和 SSR 构建

```json
"build-only:view": "run-p build:view:client build:view:server",
"build:view:client": "vite build view --outDir ../public/client --ssrManifest",
"build:view:server": "vite build view --outDir ../public/server --ssr src/server",
```
