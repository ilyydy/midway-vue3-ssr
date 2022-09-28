import { Controller, Get, Inject, ContentType } from '@midwayjs/decorator';
import { render } from '../vite.server';

import type { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  @Get('/404')
  @Get('/view/**')
  @ContentType('html')
  async home(): Promise<string> {
    return await render(this.ctx);
  }
}
