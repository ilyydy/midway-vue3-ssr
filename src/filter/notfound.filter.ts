import { Catch } from '@midwayjs/decorator';
import { httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { API_ROUTE_PREFIX } from '../share/constant';

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    // 404 错误会到这里
    if (ctx.url.startsWith(API_ROUTE_PREFIX)) {
      // 返回 JSON
      ctx.body = { code: 404 };
    } else {
      // 重定向到 /404
      ctx.redirect('/404');
    }
  }
}
