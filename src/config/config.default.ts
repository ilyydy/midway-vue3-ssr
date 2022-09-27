import type { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo) => {
  return {
    // use for cookie sign key, should change to your own and keep security
    keys: '1664280162392_6592',
    koa: {
      port: 7001,
    },
  } as MidwayConfig;
};
