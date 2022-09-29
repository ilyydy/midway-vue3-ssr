import path from 'path';

import type { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo) => {
  return {
    midwayLogger: {
      default: {
        dir: path.join(appInfo.appDir, 'logs'),
      },
      clients: {
        appLogger: {
          level: 'debug',
          consoleLevel: 'debug',
        },
      },
    },
  } as MidwayConfig;
};
