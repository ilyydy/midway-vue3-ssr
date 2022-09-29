import { Catch } from '@midwayjs/decorator';
import { HttpStatus } from '@midwayjs/core';

import { BaseFilter } from './base';

import type { Context } from '@midwayjs/koa';

@Catch()
export class UnhandledErrorFilter extends BaseFilter {
  catch(err: Error, ctx: Context) {
    // 所有的未知错误会到这里
    ctx.logger.error('unhandled error', err);
    ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
    ctx.body = BaseFilter.failResp({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      msg: 'server error',
    });
  }
}
