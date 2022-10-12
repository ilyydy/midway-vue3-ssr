import { Provide, Inject, sleep } from '@midwayjs/core';
import { InjectRepository } from '@midwayjs/mikro';
import { QueryOrder, wrap } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mysql';

import { T1 } from '../../mikroEntity/t1';

import type { ILogger } from '@midwayjs/logger';

@Provide()
export class T1Service {
  @InjectRepository(T1)
  t1Model: EntityRepository<T1>;

  @Inject()
  logger: ILogger;

  async findT1() {
    const t1 = await this.t1Model.findOne(
      { age: 10 },
      { fields: ['age', 'id', 'createTime', 'updateTime'] }
    );

    this.logger.info(t1);

    return t1;
  }

  async addT1() {
    const t1 = this.t1Model.create({
      name: 'abc12',
      age: 10,
    });

    await this.t1Model.persistAndFlush(t1);
  }

  async updateT1(t1: T1) {
    wrap(t1).assign({ name: 'xxx' });
    await this.t1Model.flush();
  }
}
