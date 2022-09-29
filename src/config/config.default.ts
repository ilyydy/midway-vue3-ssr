import { httpError } from '@midwayjs/core';
import { getCurrentMainApp } from '@midwayjs/core';
import path from 'path';

import { X_REQUEST_ID, X_TRANSACTION_ID } from '../share/constant';

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
