/**
 * @file 声明全局可用的类型，扩展依赖的类型
 */
/** */
import '@midwayjs/logger';
import '@midwayjs/core';
import '@midwayjs/koa';
import { AsyncLocalStorage } from 'async_hooks';
import IoRedis from 'ioredis';

import { X_TRANSACTION_ID, X_REQUEST_ID } from '../src/share/constant';

declare module '@midwayjs/core' {
  interface Context {
    [X_TRANSACTION_ID]: string;
    [X_REQUEST_ID]?: string;
  }

  interface IMidwayBaseApplication {
    asyncLocalStorage: AsyncLocalStorage<{ [index: string | symbol]: any }>;
    getTransactionInfo(): { transactionId: string; requestId?: string };
    redis: IoRedis;
  }
}

declare module '@midwayjs/logger' {}

declare global {
  type RenderType = 'csr' | 'ssr';

  interface RenderResponse {
    html: string;
    preloadLinks: string;
    appInfo: any;
    pinia: string;
  }

  interface Window {
    __pinia: any;
    __renderType?: RenderType;
  }
}

export {};
