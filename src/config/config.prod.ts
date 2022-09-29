import { join } from 'path';

import {
  STATIC_RESOURCE_ROUTE_PREFIX,
  FRONT_BUILD_DIR_NAME,
  FRONT_BUILD_CLIENT_DIR_NAME,
} from '../share/constant';

import type { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo) => {
  return {
    staticFile: {
      dirs: {
        default: {
          prefix: STATIC_RESOURCE_ROUTE_PREFIX,
          dir: join(
            appInfo.appDir,
            FRONT_BUILD_DIR_NAME,
            FRONT_BUILD_CLIENT_DIR_NAME
          ),
        },
      },
    },
  } as MidwayConfig;
};
