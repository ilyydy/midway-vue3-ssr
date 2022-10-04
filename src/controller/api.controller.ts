import {
  Inject,
  Controller,
  Get,
  Post,
  Body,
  Headers,
  App,
} from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';

import { API_ROUTE_PREFIX } from '../share/constant';
import { Base } from './base';
import { Obj1DTO } from '../dto/obj1';
import { T1Service } from '../service/typeorm/t1';

import type { Context, Application } from '@midwayjs/koa';
import type { ILogger } from '@midwayjs/logger';

@Controller(API_ROUTE_PREFIX)
export class APIController extends Base {
  @Inject()
  ctx: Context;

  @App()
  app: Application;

  @Inject()
  logger: ILogger;

  @Inject()
  t1Service: T1Service;

  @Get('/json')
  async getJson() {
    return Base.successResp({});
  }

  @Post('/json')
  async postJson(@Body() body: any, @Headers() headers: any) {
    this.logger.info('request body %j', body);
    this.logger.info('request headers %j', headers);

    return Base.successResp({});
  }

  @Post('/validateJson')
  @Validate()
  async validateJson(@Body() body: Obj1DTO) {
    return { success: true, message: 'OK', data: body };
  }

  @Get('/mysql')
  async getMysql() {
    const addRes = await this.t1Service.addT1();
    this.logger.info('add res %j', addRes);
    const findRes = await this.t1Service.findT1();
    await this.t1Service.updateT1(findRes.id);
    return Base.successResp({ data: { findRes } });
  }

  @Get('/redis')
  async redis() {
    const key = 'a';

    const r1 = await this.app.redis.get(key);
    const r2 = await this.app.redis.setex(key, 15, 'zc');
    const r3 = await this.app.redis.get(key);
    // const r4 = await this.redisInstance.del(key);

    const data = { r1, r2, r3 };
    return Base.successResp({ data });
  }

  @Get('/log')
  async log() {
    this.logger.debug('debug info');
    this.logger.warn('WARNNING!!!!');
    this.logger.info('hello world'); // 输出字符串
    this.logger.info(123); // 输出数字
    this.logger.info(['b', 'c']); // 输出数组
    this.logger.info(new Set([2, 3, 4])); // 输出 Set
    this.logger.info(
      new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ])
    ); // 输出 Map
    this.logger.error(new Error('custom error'));
    this.logger.info(
      'text before error',
      new Error('error instance after text')
    );

    return Base.successResp({});
  }
}
