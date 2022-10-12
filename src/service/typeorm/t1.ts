import { Provide, Inject, sleep } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Not, Repository } from 'typeorm';

import { T1 } from '../../typeormEntity/t1';

import type { ILogger } from '@midwayjs/logger';

@Provide()
export class T1Service {
  @InjectEntityModel(T1)
  t1Model: Repository<T1>;

  @Inject()
  logger: ILogger;

  async findT1() {
    const t1 = (
      await this.t1Model.find({
        select: ['age', 'id', 'createTime', 'updateTime'],
        take: 1,
      })
    )[0];

    // const t1 = await this.t1Model.query(
    //   'SELECT `id`, `name`, `create_time`, `update_time` FROM `t1` LIMIT 1'
    // );

    this.logger.info(t1);

    return t1;
  }

  async addT1() {
    const t1 = this.t1Model.create({
      name: 'abc12',
      age: 10,
    });

    const res = await this.t1Model.insert(t1);

    // const res = await this.t1Model.save(t1);

    // const res = await this.t1Model
    //   .createQueryBuilder()
    //   .insert()
    //   .into('t1')
    //   .values([t1])
    //   .execute();

    this.logger.info(res);
    return res;
  }

  async countT1() {
    const count = await this.t1Model.count({
      where: {
        id: Not('1'),
      },
    });

    this.logger.info(count);

    return count;
  }

  async findAndCountT1() {
    const res = await this.t1Model.findAndCount({
      where: { id: Not('1') },
      take: 2,
    });
    this.logger.info(res);

    return res;
  }

  async updateT1(id: string) {
    const t1 = this.t1Model.create({
      id,
      name: 'xsxx',
    });
    const res = await this.t1Model.update({ id }, t1);
    // const res = await this.t1Model.save(t1);
    this.logger.info(res);

    return res;
  }

  async groupT1() {
    const res = await this.t1Model
      .createQueryBuilder()
      .groupBy('name')
      .getMany();
    this.logger.info(res);

    return res;
  }
}
