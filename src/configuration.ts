import { Configuration, App, Logger } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import * as staticFile from '@midwayjs/static-file';
import { AsyncLocalStorage } from 'async_hooks';

import { filterList } from './filter';
import { middlewares } from './middleware';
import { getOrCreateViteServer } from './lib/vite.server';
import { isDev } from './lib/util';
import { X_REQUEST_ID, X_TRANSACTION_ID } from './share/constant';

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
    this.app.useMiddleware(middlewares);
    // add filter
    this.app.useFilter(filterList);

    this.app.asyncLocalStorage = new AsyncLocalStorage();
    this.app.getTransactionInfo = () => {
      const store = this.app.asyncLocalStorage.getStore() || {};
      return {
        transactionId: store[X_TRANSACTION_ID],
        requestId: store[X_REQUEST_ID],
      };
    };
  }

  async onServerReady(): Promise<void> {
    this.logger.info('onServerReady');
    if (isDev(this.app.getEnv())) {
      await getOrCreateViteServer(this.app);
    }
  }
}
