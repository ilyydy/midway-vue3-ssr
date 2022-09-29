import { Catch } from '@midwayjs/decorator';
import { httpError, MidwayHttpError } from '@midwayjs/core';

import { BaseFilter } from './base';

import type { Context } from '@midwayjs/koa';

@Catch([httpError.BadRequestError])
export class BadRequestFilter extends BaseFilter {
  catch(err: MidwayHttpError, ctx: Context) {
    ctx.status = Number(err.code);
    ctx.body = BaseFilter.failResp({
      code: Number(err.code),
      msg: err.message,
    });
  }
}
