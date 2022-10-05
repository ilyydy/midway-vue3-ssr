import { makeHttpRequest, getCurrentApplicationContext } from '@midwayjs/core';
import { Provide, Inject } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';

import { X_REQUEST_ID, X_TRANSACTION_ID } from '../share/constant';

import type { ILogger } from '@midwayjs/logger';
import type { Context } from '@midwayjs/koa';

@Provide()
export class CurlService {
  @Inject()
  logger: ILogger;

  @Inject()
  ctx: Context;

  async curlBaidu() {
    const result = await makeHttpRequest('https://www.baidu.com', {
      dataType: 'text',
    });
    const data = result.data;
    // this.logger.info('curlBaidu headers %j', result.headers);
    // this.logger.info(`curlBaidu data ${data}`);
    return data;
  }

  async curlSelfJson() {
    const framework = getCurrentApplicationContext().get(koa.Framework);
    const port = framework.getPort();
    const result = await makeHttpRequest(`http://localhost:${port}/api/json`, {
      method: 'POST',
      data: {
        a: 1,
        b: 'b',
      },
      headers: {
        [X_REQUEST_ID]: this.ctx[X_TRANSACTION_ID],
      },
      contentType: 'json',
      dataType: 'json',
    });
    const data = result.data;
    this.logger.info('curlSelfJson headers %j', result.headers);
    this.logger.info('curlSelfJson data %j', data);
    return data;
  }
}
