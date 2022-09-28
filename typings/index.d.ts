/**
 * @file 声明全局可用的类型，扩展依赖的类型
 */
/** */

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
