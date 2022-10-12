import { Middleware } from '@midwayjs/core';
import { v4 } from 'uuid';

import { X_REQUEST_ID, X_TRANSACTION_ID } from '../share/constant';

import type { IMiddleware, IMidwayApplication } from '@midwayjs/core';
import type { NextFunction, Context } from '@midwayjs/koa';

/**
 * @see https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/assigntransactionid.md
 */
@Middleware()
export class TransactionIdMiddleware
  implements IMiddleware<Context, NextFunction>
{
  resolve(app: IMidwayApplication) {
    return async (ctx: Context, next: NextFunction) => {
      const store: { [index: string | symbol]: any } = {};
      // The first asyncLocalStorage.run argument is the initialization of the store state
      // the second argument is the function that has access to that store
      return app.asyncLocalStorage.run(store, async () => {
        const transactionId = v4().replace(/-/g, '');
        ctx[X_TRANSACTION_ID] = transactionId;
        store[X_TRANSACTION_ID] = transactionId;
        ctx.set(X_TRANSACTION_ID, transactionId);

        const requestId = ctx.get(X_REQUEST_ID);
        if (requestId) {
          ctx[X_REQUEST_ID] = requestId;
          store[X_REQUEST_ID] = requestId;
        }

        // By calling next() inside the function, we make sure all other middlewares run within the same AsyncLocalStorage context
        return next();
      });
    };
  }

  match(ctx: Context) {
    return ctx.path.startsWith('/api/');
  }

  static getName(): string {
    return 'TransactionIdMiddleware';
  }
}
