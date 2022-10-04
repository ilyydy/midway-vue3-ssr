import { Entity, Property } from '@mikro-orm/core';
import _ from 'lodash';

import IdGenerator from '../lib/IdGenerator';
import { Base } from './base';

export const idGenerator = new IdGenerator(
  _.random(0, IdGenerator.maxWorkerId)
);

@Entity()
export class T1 extends Base {
  @Property()
  name: string;

  @Property()
  age: number;
}
