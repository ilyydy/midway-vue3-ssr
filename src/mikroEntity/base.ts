import {
  PrimaryKey,
  Property,
  BigIntType,
  OptionalProps,
} from '@mikro-orm/core';
import _ from 'lodash';

import IdGenerator from '../lib/IdGenerator';

export const idGenerator = new IdGenerator(
  _.random(0, IdGenerator.maxWorkerId)
);

export abstract class Base {
  @PrimaryKey({ type: BigIntType })
  id: string = idGenerator.nextId();

  @Property({ name: 'create_time', nullable: true })
  createTime: Date = new Date();

  @Property({ name: 'update_time', nullable: true, onUpdate: () => new Date() })
  updateTime: Date = new Date();

  [OptionalProps]?: 'createTime' | 'updateTime';
}
