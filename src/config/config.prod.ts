import { join } from 'path';

import type { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo) => {
  return {
    staticFile: {
      dirs: {
        default: {
          prefix: '/public',
          dir: join(appInfo.appDir, 'public', 'client'),
        },
      },
    },
  } as MidwayConfig;
};
