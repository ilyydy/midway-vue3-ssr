import { Catch } from '@midwayjs/core';
import { httpError, MidwayHttpError } from '@midwayjs/core';

import { API_ROUTE_PREFIX } from '../share/constant';
import { BaseFilter } from './base';

import type { Context } from '@midwayjs/koa';

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    // 404 错误会到这里
    if (ctx.url.startsWith(API_ROUTE_PREFIX)) {
      // 返回 JSON
      ctx.status = Number(err.code);
      ctx.body = BaseFilter.failResp({
        code: Number(err.code),
        msg: err.message,
      });
    } else {
      // 重定向到 /404
      ctx.redirect('/404');
    }
  }
}
