import { Controller, Get, Inject, ContentType } from '@midwayjs/core';

import { render } from '../lib/vite.server';
import { VIEW_ROUTE_PREFIX } from '../share/constant';

import type { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  @Get('/404')
  @Get(`${VIEW_ROUTE_PREFIX}/**`)
  @ContentType('html')
  async home(): Promise<string> {
    return await render(this.ctx);
  }
}
