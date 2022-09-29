import { Configuration, App, Logger } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import * as staticFile from '@midwayjs/static-file';
import { AsyncLocalStorage } from 'async_hooks';

import { DefaultErrorFilter } from './filter/default.filter';
import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';
import { getOrCreateViteServer } from './vite.server';

import type { ILogger } from '@midwayjs/logger';
import type { ILifeCycle } from '@midwayjs/core';

@Configuration({
  imports: [
    koa,
    validate,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    {
      component: staticFile,
      enabledEnvironment: ['production'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: koa.Application;

  @Logger()
  logger: ILogger;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);
    // add filter
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }

  async onServerReady(): Promise<void> {
    this.logger.info('onServerReady');
    if (this.app.getEnv() === 'dev' || this.app.getEnv() === 'local') {
      await getOrCreateViteServer(this.app);
    }

    this.app.asyncLocalStorage = new AsyncLocalStorage();
  }
}
