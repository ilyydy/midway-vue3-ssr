import { Aspect } from '@midwayjs/core';

import { filterList } from '../filter';
import { jsonStringify } from '../lib/util';
import { X_RESPONSE_TIME } from '../share/constant';

import type { Context } from '@midwayjs/koa';
import type { IMethodAspect, JoinPoint } from '@midwayjs/core';

@Aspect(filterList, 'catch')
export class ReportInfo implements IMethodAspect {
  async after(point: JoinPoint) {
    const ctx = point.args[1] as Context;
    ctx.logger.info(
      `filter response status ${ctx.status} body ${jsonStringify(ctx.body)}`
    );
    ctx.set(X_RESPONSE_TIME, `${Date.now() - ctx.startTime}ms`);
  }
}
