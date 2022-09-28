import { Controller, Get, Inject, ContentType } from '@midwayjs/decorator';
import { render } from '../vite.server';

import type { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  // 前端有 / 和 /about 两个路由
  @Get('/')
  @Get('/view')
  @Get('/view/about')
  @ContentType('html')
  async home(): Promise<string> {
    return await render(this.ctx);
  }
}
