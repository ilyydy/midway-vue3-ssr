import {
  Column,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate,
  UpdateDateColumn,
} from 'typeorm';
import _ from 'lodash';

import IdGenerator from '../lib/IdGenerator';

export const idGenerator = new IdGenerator(
  _.random(0, IdGenerator.maxWorkerId)
);

export abstract class Base {
  @PrimaryColumn({ update: false, nullable: false })
  id: string;

  @Column({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @BeforeInsert()
  private async setDefaultBeforeInsert() {
    if (!this.id) {
      this.id = idGenerator.nextId();
    }

    const time = new Date();
    if (!this.createTime) {
      this.createTime = time;
    }
    if (!this.updateTime) {
      this.updateTime = time;
    }
  }

  @BeforeUpdate()
  private async setDefaultBeforeUpdate() {
    const time = new Date();
    if (!this.updateTime) {
      this.updateTime = time;
    }
  }
}
