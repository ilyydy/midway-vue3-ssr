import { httpError } from '@midwayjs/core';
import { getCurrentMainApp } from '@midwayjs/core';
import path from 'path';

import { X_REQUEST_ID, X_TRANSACTION_ID } from '../share/constant';
import mongoEntities from '../mongoEntity';
import mikroEntities from '../mikroEntity';

import type { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';
import type { Context } from '@midwayjs/koa';

export default (appInfo: MidwayAppInfo) => {
  return {
    // use for cookie sign key, should change to your own and keep security
    keys: '1664280162392_6592',
    koa: {
      port: 7001,

      /**
       * @see https://github.com/midwayjs/midway/blob/08e4152bb9530b699de4150c2494f04795348719/packages/web-koa/src/config/config.default.ts#L5
       */
      contextLoggerFormat: info => {
        const ctx = info.ctx as Context;
        const requestId = ctx[X_REQUEST_ID];
        const transactionId = ctx[X_TRANSACTION_ID];
        // format: '[$userId/$ip/$requestId/$transactionId/$use_ms $method $url]'
        const userId = ctx.userId || '-';
        const use = Date.now() - ctx.startTime;
        const label =
          userId +
          '/' +
          ctx.ip +
          '/' +
          (requestId || '-') +
          '/' +
          (transactionId || '-') +
          '/' +
          use +
          'ms ' +
          ctx.method +
          ' ' +
          ctx.url;
        return `${info.timestamp.replace(/,/g, '.')} ${info.LEVEL} ${
          info.pid
        } [${label}] ${info.message}`;
      },
    },

    typeorm: {
      dataSource: {
        default: {
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'tom',
          password: '123456mysql',
          database: 'd1',
          synchronize: false, // 如果第一次使用，不存在表，有同步的需求可以写 true
          logging: true,
          maxQueryExecutionTime: 1000,

          /**
           * 配置实体模型，以 initDataSource 方法的第二个参数(baseDir)作为相对路径查找
           * @see https://midwayjs.org/docs/data_source#2%E7%9B%AE%E5%BD%95%E6%89%AB%E6%8F%8F%E5%85%B3%E8%81%94%E5%AE%9E%E4%BD%93
           * @see https://github.com/midwayjs/midway/blob/v3.4.5/packages/typeorm/src/dataSourceManager.ts#L27
           * @see https://midwayjs.org/docs/deployment#%E9%83%A8%E7%BD%B2%E5%90%8E%E5%92%8C%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E7%9A%84%E5%8C%BA%E5%88%AB
           */
          entities: ['/typeormEntity'],
        },
      },
    },

    mikro: {
      dataSource: {
        default: {
          entities: mikroEntities,
          dbName: 'd1',
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          user: 'tom',
          password: '123456mysql',
          debug: true,
        },
      },
    },

    mongoose: {
      dataSource: {
        default: {
          uri: 'mongodb://localhost:27017/test',
          options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            user: 'myTester',
            pass: 'myTester',
            loggerLevel: 'debug',
          },
          // 关联实体
          entities: mongoEntities,
        },
      },
    },

    redis: {
      client: {
        keyPrefix: 'zc:test:',
        port: 6379, // Redis port
        host: '127.0.0.1', // Redis host
        db: 0,
      },
    },

    midwayLogger: {
      default: {
        dir: path.join(appInfo.HOME, 'logs', appInfo.name),
        maxSize: '10m',
      },
      clients: {
        appLogger: {
          level: 'info',
          format: info => {
            const app = getCurrentMainApp();
            const { transactionId, requestId } = app.getTransactionInfo();
            const label = [requestId, transactionId].some(i => !!i)
              ? [requestId || '-', transactionId || '-'].join('/')
              : '';
            return `${info.timestamp.replace(/,/g, '.')} ${info.LEVEL} ${
              info.pid
            } ${label ? `[${label}] ` : ''}${info.labelText}${info.message}`;
          },
        },
      },
    },

    bodyParser: {
      enableTypes: ['json', 'form', 'text', 'xml'],
      formLimit: '1mb',
      jsonLimit: '1mb',
      textLimit: '1mb',
      xmlLimit: '1mb',
      onerror(err: Error, ctx: Context) {
        ctx.logger.warn('bodyParser error', err);
        throw new httpError.BadRequestError(err.message);
      },
    },
  } as MidwayConfig;
};
