import {
  Configuration,
  App,
  Logger,
  Inject,
  Config,
} from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import * as staticFile from '@midwayjs/static-file';
import { AsyncLocalStorage } from 'async_hooks';
import * as redis from '@midwayjs/redis';
import * as typegoose from '@midwayjs/typegoose';
import * as typeorm from '@midwayjs/typeorm';
import * as mikro from '@midwayjs/mikro';
import mongoose from 'mongoose';

import { filterList } from './filter';
import { middlewares } from './middleware';
import { getOrCreateViteServer } from './lib/vite.server';
import { isDev } from './lib/util';
import { createProxyInstance } from './lib/redis';
import { X_REQUEST_ID, X_TRANSACTION_ID } from './share/constant';
import { TypeORMLogger } from './service/typeorm/typeormLogger';

import type { ILogger } from '@midwayjs/logger';
import type { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import type { IDatabaseDriver } from '@mikro-orm/core';

@Configuration({
  imports: [
    koa,
    validate,
    redis,
    typegoose,
    typeorm,
    mikro,
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

  @Inject()
  redisServiceFactory: redis.RedisServiceFactory;

  @Config('typeorm')
  typeormConfig: typeorm.typeormConfigOptions;

  @Config('mikro')
  mikroConfig: mikro.MikroConfigOptions<IDatabaseDriver>;

  async onConfigLoad(applicationContext: IMidwayContainer) {
    this.app.asyncLocalStorage = new AsyncLocalStorage();
    this.app.getTransactionInfo = () => {
      const store = this.app.asyncLocalStorage.getStore() || {};
      return {
        transactionId: store[X_TRANSACTION_ID],
        requestId: store[X_REQUEST_ID],
      };
    };

    const { dataSource } = this.typeormConfig;
    if (dataSource) {
      const typeORMLogger = applicationContext.get(TypeORMLogger);
      Object.values(dataSource).forEach(i => {
        (i as any).logger = typeORMLogger;
      });
    }

    if (this.mikroConfig.dataSource) {
      Object.values(this.mikroConfig.dataSource).forEach(i => {
        (i as any).logger = (msg: string) => this.logger.info(`mikro ${msg}`);
      });
    }

    mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
      this.logger.info(
        `mongo ${collectionName}.${methodName} ${JSON.stringify(methodArgs)}`
      );
    });
  }

  async onReady(applicationContext: IMidwayContainer) {
    // add middleware
    this.app.useMiddleware(middlewares);
    // add filter
    this.app.useFilter(filterList);

    const redis = this.redisServiceFactory.get();
    const proxyRedis = createProxyInstance(redis, this.logger);
    this.app.redis = proxyRedis;
  }

  async onServerReady(): Promise<void> {
    this.logger.info('onServerReady');
    if (isDev(this.app.getEnv())) {
      await getOrCreateViteServer(this.app);
    }
  }
}
