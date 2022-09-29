import { Middleware } from '@midwayjs/decorator';

import { X_RESPONSE_TIME } from '../share/constant';

import type { IMiddleware } from '@midwayjs/core';
import type { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class FormatRespMiddleware
  implements IMiddleware<Context, NextFunction>
{
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      await next();
      ctx.set(X_RESPONSE_TIME, `${Date.now() - ctx.startTime}ms`);
    };
  }

  match(ctx: Context) {
    return ctx.path.startsWith('/api/');
  }

  static getName(): string {
    return 'FormatRespMiddleware';
  }
}
