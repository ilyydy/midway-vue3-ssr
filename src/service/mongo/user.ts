import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';

import { User } from '../../mongoEntity/user';

import type { ReturnModelType } from '@typegoose/typegoose';
import type { ILogger } from '@midwayjs/logger';

@Provide()
export class MongoUserService {
  @InjectEntityModel(User)
  userModel: ReturnModelType<typeof User>;

  @Inject()
  logger: ILogger;

  async create() {
    const createRes = await this.userModel.create({
      name: 'JohnDoe',
      jobs: ['Cleaner'],
    });

    return { createRes };
  }

  async find() {
    const user1 = await this.userModel
      .findOne(
        {},
        {},
        {
          sort: { createdAt: -1 },
        }
      )
      .lean()
      .exec();

    return user1;
  }

  async update(_id: string) {
    console.log(_id, 'id');
    const updateRes = await this.userModel.updateOne(
      {
        _id,
      },
      { name: 'abc' }
    );
    return updateRes;
  }
}
