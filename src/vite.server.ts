import * as path from 'path';
import * as fs from 'fs';

import type { Application, Context } from '@midwayjs/koa';
// vite 是 dev 依赖，生产环境不存在，所以用 import type 形式
// eslint-disable-next-line node/no-unpublished-import
import type { ViteDevServer } from 'vite';

// 将请求路径转换为对应的前端路由
function convertPathToFrontRoute(path: string) {
  return path.replace(new RegExp('/view/'), '/');
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

  if (ctx.query.renderType === 'csr') {
    return csrHtml(ctx, template);
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

  if (ctx.query.renderType === 'csr') {
    return csrHtml(ctx, template);
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
