import { Catch } from '@midwayjs/decorator';
import { MidwayValidationError } from '@midwayjs/validate';

import { BaseFilter } from './base';
import { RESPONSE_CODE } from '../constant/code';

import type { Context } from '@midwayjs/koa';

@Catch(MidwayValidationError)
export class ParamsErrorFilter extends BaseFilter {
  catch(err: MidwayValidationError, ctx: Context) {
    ctx.body = BaseFilter.failResp({
      code: RESPONSE_CODE.PARAM_ERROR,
      msg: err.message,
    });
  }
}
