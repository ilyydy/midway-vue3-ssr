import type { ILogger } from '@midwayjs/logger';
import type { IoRedis } from '../interface';

export function createProxyInstance(instance: IoRedis, logger: ILogger) {
  const proxy = new Proxy(instance, {
    get(target, propKey, receiver) {
      const v = Reflect.get(target, propKey, receiver);
      if (typeof v !== 'function') return v;

      return async (...args: any) => {
        const start = Date.now();
        // logger.info('redis call method %s with args %j', propKey, args);
        try {
          const r = await v.apply(target, args);
          return r;
        } finally {
          logger.info(
            'redis call method %s with args %j, cost %s ms',
            propKey,
            args,
            Date.now() - start
          );
        }
      };
    },
  });
  return proxy;
}
