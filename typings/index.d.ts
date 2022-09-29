/**
 * @file 声明全局可用的类型，扩展依赖的类型
 */
/** */
import '@midwayjs/logger';
import { IMidwayBaseApplication } from '@midwayjs/core';
import { NextFunction, Context, Application } from '@midwayjs/koa';
import { AsyncLocalStorage } from 'async_hooks';

declare module '@midwayjs/core' {
  interface Context {}

  interface IMidwayBaseApplication {
    asyncLocalStorage: AsyncLocalStorage<{ [index: string | symbol]: any }>;
  }
}

declare module '@midwayjs/logger' {
  
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
