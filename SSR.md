# Midway + Vue3 + Vite 的全栈 SSR demo 工程

从头开始搭建一个基于 [Midway](https://www.midwayjs.org/docs/intro) Node.js 后端框架和 [Vue3](https://cn.vuejs.org/guide/introduction.html) + [Vite](https://cn.vitejs.dev/) 的 SSR + CSR 全栈 demo 工程

## 合并 Midway 和 Vue 工程

先使用命令 `npm init midway` 初始化一个 Midway koa-v3 标准项目，项目根目录结构如下：

```shell
├── README.md
├── README.zh-CN.md
├── bootstrap.js
├── jest.config.js
├── package.json
├── src
├── test
└── tsconfig.json
```

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

```shell
├── README.md
├── env.d.ts
├── index.html
├── package.json
├── public
├── src
├── tsconfig.config.json
├── tsconfig.json
└── vite.config.ts
```

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

build:view:client 将会为客户端构建生成 public/client/ssr-manifest.json

## 服务端 SSR 配置

src 目录下新建 vite.server.ts，用于在收到请求时渲染 html 并返回

```ts
import * as path from 'path';
import * as fs from 'fs';

import type { Application, Context } from '@midwayjs/koa';
// vite 是 dev 依赖，生产环境不存在，所以用 import type 形式
// eslint-disable-next-line node/no-unpublished-import
import type { ViteDevServer } from 'vite';

// 将请求路径转换为对应的前端路由
function convertPathToFrontRoute(path: string) {
  return path;
}

let _viteServer: ViteDevServer | undefined;

// 只本地开发时会被调用，创建 1 个 viteServer 单例
export async function getOrCreateViteServer(app: Application) {
  if (_viteServer !== undefined) return _viteServer;

  // vite 是 dev 依赖，生产环境不存在，只会在本地开发时动态 import
  // eslint-disable-next-line node/no-unpublished-import
  const vite = await import('vite');

  const viteServer = await vite.createServer({
    logLevel: 'info',
    root: 'view', // 需要指定 view 为根目录
    server: {
      middlewareMode: true,
    },
    appType: 'custom',
  });
  _viteServer = viteServer;

  // koa-connect 是 dev 依赖，生产环境不存在，只会在本地开发时动态 import
  // eslint-disable-next-line node/no-unpublished-import
  const koaConnect = await import('koa-connect');
  // 以中间件模式创建 Vite 应用，这将禁用 Vite 自身的 HTML 服务逻辑
  // 并让上层服务器（也即 midway 服务）接管控制
  app.use(koaConnect(viteServer.middlewares));

  return viteServer;
}

// 服务端渲染 html，将需要预加载的各类资源、pinia 状态、app 加到页面上
export async function ssrHtml(
  ctx: Context,
  template: string,
  renderResponse: any
) {
  const { html: appHtml, preloadLinks, appInfo, pinia } = renderResponse;

  const html = template
    .replace('"<!--app-pinia-->"', pinia)
    .replace('<!--preload-links-->', preloadLinks);

  return html.replace('<!--app-html-->', appHtml);
}

// 本地开发时调用，返回渲染好的 html
export async function devRender(ctx: Context) {
  let template = '';
  try {
    // 读取 view 目录下的 index.html
    template = await fs.promises.readFile(
      path.join(ctx.app.getAppDir(), 'view', 'index.html'),
      'utf-8'
    );
  } catch (error: any) {
    ctx.logger.error('read template error', error);
    ctx.throw('template error');
  }

  let viteServer: ViteDevServer | undefined;
  try {
    viteServer = await getOrCreateViteServer(ctx.app);
    // 应用 Vite HTML 转换。这将会注入 Vite HMR 客户端，
    // 同时也会从 Vite 插件应用 HTML 转换。
    template = await viteServer.transformIndexHtml(ctx.url, template);
    // 加载 server.ts 入口文件
    // vite.ssrLoadModule 将自动转换你的 ESM 源码使之可以在 Node.js 中运行！无需打包
    // 并提供类似 HMR 的根据情况随时失效
    const { render } = await viteServer.ssrLoadModule('/src/server.ts');
    // 获得 app、预加载的各类资源等渲染需要的数据
    const response = await render(convertPathToFrontRoute(ctx.url), {});

    return ssrHtml(ctx, template, response);
  } catch (error: any) {
    // 如果捕获到了一个错误，让 Vite 来修复该堆栈，这样它就可以映射回
    // 你的实际源码中
    viteServer && viteServer.ssrFixStacktrace(error);
    ctx.logger.error('devRender ssr error', error);
    ctx.throw('ssr error');
  }
}

let template = '';
let manifest: Record<string, any> | undefined;
let renderFunc: any;

// 线上环境调用，返回渲染好的 html
export async function commonRender(ctx: Context) {
  const appDir = ctx.app.getAppDir();

  try {
    template =
      template ||
      // 读取构建结果中的 html
      (await fs.promises.readFile(
        path.join(appDir, 'public', 'client', 'index.html'),
        'utf-8'
      ));
  } catch (error: any) {
    ctx.logger.error('read template error', error);
    ctx.throw('template error');
  }

  // 读取 ssr-manifest.json 清单，传递到 src/server.ts 导出的 render 函数中
  // 这将为我们提供足够的信息，来为异步路由相应的文件渲染预加载指令！
  try {
    manifest =
      manifest ||
      JSON.parse(
        await fs.promises.readFile(
          path.join(appDir, 'public', 'client', 'ssr-manifest.json'),
          'utf-8'
        )
      );

    // 加载构建后的 server.js 入口文件
    renderFunc =
      renderFunc ||
      (await import(path.join(appDir, 'public', 'server', 'server.js'))).render;
    const response: any = await renderFunc(
      convertPathToFrontRoute(ctx.url),
      manifest
    );
    return ssrHtml(ctx, template, response);
  } catch (error: any) {
    ctx.logger.error('commonRender ssr error', error);
    ctx.throw('ssr error');
  }
}

// 根据不同环境执行不同的渲染方法
export async function render(ctx: Context) {
  const env = ctx.app.getEnv();
  if (env !== 'dev' && env !== 'local') {
    return commonRender(ctx);
  } else {
    return devRender(ctx);
  }
}
```

在 view/index.html 加上占位标记供给服务端渲染时注入，并引入客户端入口文件 view/src/client.ts：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!--preload-links-->
</head>

<body>
  <div id="app"><!--app-html--></div>
  <script type="module" src="/src/client.ts"></script>
  <script>
    window.__pinia = "<!--app-pinia-->";
  </script>
</body>

</html>
```

后端 controller 方法上增加 SSR 的路由和处理方法，如 home.controller.ts 修改为：

```ts
import { Controller, Get, Inject, ContentType } from '@midwayjs/decorator';
import { render } from '../vite.server';

import type { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  // 前端有 / 和 /about 两个路由
  @Get('/')
  @Get('/about')
  @ContentType('html')
  async home(): Promise<string> {
    return await render(this.ctx);
  }
}
```

此时运行 npm run dev 启动 midway 开发服务，访问 <http://localhost:7001/> 即可看到服务端渲染的前端页面，访问 <http://localhost:7001/about> 同样

生产环境下，当浏览器获取到 SSR 页面时还需要加载对应的静态资源，这就需要一个静态资源服务，可以使用 Nginx，也可使用 [Midway 组件](https://www.midwayjs.org/docs/extensions/static_file)。以使用 Midway 组件为例，根据官方文档安装依赖、引入组件。因为该组件默认情况下托管项目根目录下的 public 目录中的内容，而客户端构建结果在 public/client 下，所以需要做配置：

```ts
// config.prod.ts
import { join } from 'path';

import type { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo) => {
  return {
    staticFile: {
      dirs: {
        default: {
          prefix: '/',
          dir: join(appInfo.appDir, 'public', 'client'),
        },
      },
    },
  } as MidwayConfig;
};
```

package.json 新增 1 条 scripts 命令，同时构建前后端

```json
"build": "run-p build:midway build:view",
```

运行 `npm run build`，再运行 `npm run start` 会启动生产环境的服务，访问 <http://localhost:7001/> 和 <http://localhost:7001/about> 可以看到页面，查看浏览器发出的请求，可以看到请求了 public/client 下的静态资源

## 优化

### 不同请求类型增加请求前缀

为了方便区分请求的是 API 接口，页面还是其他静态资源，一般使用不同的路径前缀。如 API 接口以 /api 开头，页面以 /view 开头，静态资源以 /public 开头

API 接口公共前缀通过 @Controller 配置即可

访问页面的 controller 方法的访问路径增加 /view/ 前缀，考虑访问方便，应该支持访问根路径 / 自动转到 /view

```ts
@Get('/')
@Get('/view')
@Get('/view/about')
```

因为请求路径发生了变化，所以需要修改 vite.server.ts 的 convertPathToFrontRoute 方法，让请求路径转为正确的前端路由，即请求 / 和 /view 访问前端路由 /，请求 /view/about 访问前端路由 /about

```ts
function convertPathToFrontRoute(path: string) {
  return path.replace(new RegExp('/view/'), '/');
}
```

同时修改 view/src/router/index.ts，让 Vue-Router 历史记录增加前缀

```ts
    history: import.meta.env.SSR
      ? createMemoryHistory("/view")
      : createWebHistory("/view"),
```

静态资源公共前缀可在 vite.config.ts 增加：

```ts
base: "/public/",
```

同时修改 Midway 的静态资源服务配置，prefix 为 '/public'

```ts
// src/config/config.prod.ts

prefix: '/public',
```

此时启动服务，可以发现访问 <http://localhost:7001> 会自动跳转到 <http://localhost:7001/view/>，也可以直接访问 <http://localhost:7001/view/about>，同时请求静态资源带上了 /public 前缀

### 动态路由和 404

请求页面存在两个问题：1. controller 方法上写死了前端的路由，不能动态扩展 2. 访问不存在的页面时应返回 404 页面，而访问不存在的 API 接口时应返回 JSON 响应，两种没有区分开

对于第一个问题，因为除了根路径，访问页面都以 /view 开头，所以可以 controller 方法上使用通配路由

```ts
@Get('/view/**')
```

对于第二个问题，因为 API 接口以 /api 开头，所以当服务端捕获到 404 时如果请求路径以 /api 开头，则返回 JSON 响应，否则返回 404 页面

前端加一个简单的 NotFoundView.vue 页面组件，并加到 Vue-Router 中作为兜底处理

```vue
<template>
  <div title="404" sub-title="Sorry, request error">
    <router-link to="/">
      <button>返回首页</button>
    </router-link>
  </div>
</template>
```

```ts
// view/src/router/index.ts
import {
  createRouter as _createRouter,
  createWebHistory,
  createMemoryHistory,
} from "vue-router";
import HomeView from "../views/HomeView.vue";

export function createRouter() {
  return _createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory("/view")
      : createWebHistory("/view"),
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
      {
        name: "notFound",
        path: "/:pathMatch(.*)*",
        component: () => import("../views/NotFoundView.vue"),
      },
    ],
  });
}
```

服务端修改 notfound.filter.ts，处理不同情况的 404，并在 src/configuration.ts 中启用 filter

```ts
import { Catch } from '@midwayjs/decorator';
import { httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    // 404 错误会到这里
    if (ctx.url.startsWith('/api')) {
      // 返回 JSON
      ctx.body = { code: 404 };
    } else {
      // 重定向到 /404
      ctx.redirect('/404');
    }
  }
}
```

controller 方法上增加一个 /404 路径，这样重定向到 /404 时会进行服务端渲染，做前端路由匹配，而前端路由中没有 /404 的路面，所以最后匹配到兜底的 notFound 路由，返回 404 页面

```ts
@Get('/404')
```

### 同时支持 SSR 和 CSR

有些时候我们想同时支持 SSR 和 CSR，可以根据请求参数（比如 query 的 renderType）来选择模式，默认用 SSR，当 renderType 是 "csr" 是则用 CSR

首先在 src/lib/vite.server.ts 中增加一个客户端渲染的 csrHtml 函数，用于将 html 中的占位符替换掉

```ts
export async function csrHtml(ctx: Context, template: string) {
  const html = template
    .replace('"<!--app-pinia-->"', '""')
    .replace('<!--preload-links-->', '');

  return html.replace('<!--app-html-->', '');
}
```

然后在 devRender 和 commonRender 分别增加根据 renderType 判断使用哪种模式的逻辑

```ts
  if (ctx.query.renderType === 'csr') {
    return csrHtml(ctx, template);
  }
```

启动服务访问 <http://localhost:7001/?renderType=csr> 可以看到页面，但是会发现浏览器控制台有警告：

```log
runtime-core.esm-bundler.js:38 [Vue warn]: Attempting to hydrate existing markup but container is empty. Performing full mount instead.
```

这是因为 view/src/client.ts 中的 app 还是用 createSSRApp 创建的，执行了客户端激活。所以这里应该根据选择的模式用 createApp 或 createSSRApp 来创建 App。而渲染模式可以通过 csrHtml 或 ssrHtml 加到 html 中，客户端再读取出来

```ts
export async function csrHtml(ctx: Context, template: string) {
  const html = template
    .replace('"<!--render-type-->"', '"csr"')
    .replace('"<!--app-pinia-->"', '""')
    .replace('<!--preload-links-->', '');

  return html.replace('<!--app-html-->', '');
}

// 服务端渲染 html，将需要预加载的各类资源、pinia 状态、app 加到页面上
export async function ssrHtml(
  ctx: Context,
  template: string,
  renderResponse: any
) {
  const { html: appHtml, preloadLinks, appInfo, pinia } = renderResponse;

  const html = template
    .replace('"<!--render-type-->"', '"ssr"')
    .replace('"<!--app-pinia-->"', pinia)
    .replace('<!--preload-links-->', preloadLinks);

  return html.replace('<!--app-html-->', appHtml);
}
```

index.html 加上这个占位符：

```html
window.__renderType = "<!--render-type-->";
```

修改创建 app 的函数

```ts
// view/src/main.ts
// 创建 app，在服务端和客户端间共享
import { createSSRApp, createApp as createCSRApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import { createRouter } from './router';

import './assets/main.css';

// 每次请求时调用创建一个新的 app
export function createApp(renderType: 'csr' | 'ssr' = 'ssr') {
  const app = renderType === 'ssr' ? createSSRApp(App) : createCSRApp(App);

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

client.ts 中读取 __renderType 决定 renderType

```ts
// view/src/client.ts
let renderType = (window as any).__renderType;
if (renderType !== 'csr' && renderType !== 'ssr') {
  renderType = 'ssr';
}

const { app, router, pinia } = createApp(renderType);
```

再次启动服务访问 <http://localhost:7001/?renderType=csr> 可以看到告警不再出现

### 抽取公共变量和类型

前后端有不少公共的变量（比如页面、静态资源公共前缀，ssr 和 csr 等）和类型（比如 API JSON 响应的数据类型），这些我们可以统一放在一个目录中，前后端代码共享

在 src 下新建一个 share 目录，constant.ts 放置常量。服务端代码可直接使用按需替换

```ts
// constant.ts
/**
 * @file 服务端、浏览器端共用的变量，注意兼容性，不包含敏感信息
 */
/** */

export const API_ROUTE_PREFIX = '/api';
export const VIEW_ROUTE_PREFIX = '/view';
export const STATIC_RESOURCE_ROUTE_PREFIX = '/public';

export const FRONT_SOURCE_DIR_NAME = 'view';
export const FRONT_BUILD_DIR_NAME = 'public';
export const FRONT_BUILD_CLIENT_DIR_NAME = 'client';
export const FRONT_BUILD_SERVER_DIR_NAME = 'server';
export const SRC_SERVER_ENTRY_PATH = '/src/server.ts';
export const BUILD_SERVER_ENTRY = 'server.js';
export const ENTRY_HTML = 'index.html';
export const MANIFEST = 'ssr-manifest.json';
export const CSR = 'csr';
export const SSR = 'ssr';
```

前端为了方便 import 设置路径别名，修改 view/tsconfig.json

```json
{
  "extends": "@vue/tsconfig/tsconfig.web.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@share/*": ["../src/share/*"]
    }
  }
}
```

修改 view/vite.config.ts

```ts
import { fileURLToPath, URL } from "node:url";
import { join } from "node:path";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { STATIC_RESOURCE_ROUTE_PREFIX } from "../src/share/constant";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => ({
  base: STATIC_RESOURCE_ROUTE_PREFIX + "/",
  build: {
    outDir: "../public",
    emptyOutDir: true,
  },
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@share": fileURLToPath(
        new URL(join("../src", "share"), import.meta.url)
      ),
    },
  },
  ssr: {
    format: "cjs",
  },
}));
```

对于类型共享，新建 typings/index.d.ts，放置全局可用的类型

```ts
/**
 * @file 声明全局可用的类型，扩展依赖的类型
 */
/* */

declare global {
  type RenderType = 'csr' | 'ssr';

  interface RenderResponse {
    html: string;
    preloadLinks: string;
    appInfo: any;
    pinia: string;
  }
}

export {}
```

为了在服务端使用，配置 tsconfig.json

```json
{
  "compileOnSave": true,
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "inlineSourceMap":true,
    "noImplicitThis": true,
    "noUnusedLocals": false,
    "stripInternal": true,
    "skipLibCheck": true,
    "pretty": true,
    "declaration": true,
    "forceConsistentCasingInFileNames": true,
    "typeRoots": [ "./typings", "./node_modules/@types"],
    "outDir": "dist"
  },
  "exclude": [
    "dist",
    "node_modules",
    "test",
    "view"
  ],
  "include": [
    "src",
    "typings"
  ]
}
```

为了在前端使用，配置 view/tsconfig.json

```json
{
  "extends": "@vue/tsconfig/tsconfig.web.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue", "../typings"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@share/*": ["../src/share/*"]
    }
  }
}
```

### ViteDevServer 创建时机

本地 dev 模式启动服务后，修改前端 vue 文件会触发 Vite 的热更新。修改 服务端 ts 代码会触发 Midway 服务的自动重启功能。这时会发现 Vite 的热更新能力失效，并且浏览器一直在请求 <http://localhost:24678/public/>，手动刷新页面后又恢复正常

24678 是 Vite 的 websocket 服务的端口。当访问页面相关的路径时会调用 getOrCreateViteServer 创建 ViteDevServer，同时创建 websocket 服务。然后页面在浏览器加载， Vite 在浏览器创建 websocket 客户端和这个 websocket 服务交互，实现热更新。当 Midway 服务重启后，之前的 ViteDevServer 和 websocket 服务都不再存在，浏览器的 websocket 客户端断开与 websocket 服务的连接，然后不断请求 <http://localhost:24678/public/>，尝试重连。然而如果没有再次访问页面相关的路径，ViteDevServer 和 websocket 服务一直未被创建，websocket 客户端一直无法连接上，最终导致热更新失效

所以为了保持热更新能力，Midway 服务重启后应该立即创建 ViteDevServer。可以通过修改 src/configuration.ts 实现：

```ts
  async onServerReady(): Promise<void> {
    if (this.app.getEnv() === 'dev' || this.app.getEnv() === 'local') {
      await getOrCreateViteServer(this.app);
    }
  }
```

## 参考

* [Vite setup catalogue](https://github.com/sapphi-red/vite-setup-catalogue)
* [vue3 服务端渲染 (SSR)](https://cn.vuejs.org/guide/scaling-up/ssr.html)
* [vue2 服务器端渲染指南](https://juejin.cn/post/7109271896729845774)
* [vite 服务端渲染](https://cn.vitejs.dev/guide/ssr.html)
* [vue router SSR](https://router.vuejs.org/zh/guide/migration/index.html#%E6%96%B0%E7%9A%84-history-%E9%85%8D%E7%BD%AE%E5%8F%96%E4%BB%A3-mode)
* [pinia SSR](https://pinia.vuejs.org/ssr/)
* [敲下命令后，Vite 做了哪些事？](https://juejin.cn/post/7109271896729845774)
