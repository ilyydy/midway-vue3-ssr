import { Inject, Controller, Get, Query } from '@midwayjs/decorator';

import { API_ROUTE_PREFIX } from '../share/constant';
import { Base } from './base';

import type { Context } from '@midwayjs/koa';
import type { ILogger } from '@midwayjs/logger';

@Controller(API_ROUTE_PREFIX)
export class APIController extends Base {
  @Inject()
  ctx: Context;

  @Inject()
  logger: ILogger;

  @Get('/json')
  async json() {
    return Base.successResp({});
  }
}
