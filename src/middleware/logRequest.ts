import { Middleware } from '@midwayjs/decorator';

import { jsonStringify, isTxtContentType } from '../lib/util';
import {
  CONTENT_TYPE,
  CONTENT_LENGTH,
  HTTP_METHOD_MAP,
} from '../share/constant';

import type { IMiddleware } from '@midwayjs/core';
import type { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class LogRequestMiddleware
  implements IMiddleware<Context, NextFunction>
{
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const reqContentType = ctx.get(CONTENT_TYPE);

      let msg = `${LogRequestMiddleware.getName()} request `;
      if (ctx.method !== HTTP_METHOD_MAP.get) {
        const reqBody = isTxtContentType(reqContentType)
          ? jsonStringify(ctx.request.body)
          : `${reqContentType} ${ctx.get(CONTENT_LENGTH)}`;
        msg += `body ${reqBody}`;
      }
      msg += `query ${jsonStringify(ctx.query)}`;

      ctx.logger.info(msg);
      await next();

      const respContentType = ctx.response.get(CONTENT_TYPE);
      const respBody = isTxtContentType(respContentType)
        ? jsonStringify(ctx.body)
        : `${respContentType} ${ctx.response.get(CONTENT_LENGTH)}`;
      ctx.logger.info(
        `${LogRequestMiddleware.getName()} response status ${
          ctx.status
        } body ${respBody}`
      );
    };
  }

  match(ctx: Context) {
    return ctx.path.startsWith('/api/');
  }

  static getName(): string {
    return 'LogRequestMiddleware';
  }
}
