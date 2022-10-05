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

declare module 'axios' {
  interface AxiosRequestConfig {
    abortWhenRepeat?: boolean; // 是否启用取消重复请求，只在未传入 signal 时有效
    abortType?: 'before' | 'after' // 取消重复请求时取消前面的还是后面的，默认取消前面的
    getAbortIdentifier?: (config: AxiosRequestConfig) => string // 计算一个请求的 identifier，用于判断是否是重复请求，默认用 method + url + query 计算
  }
}

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
