import { Entity, Column, CreateDateColumn } from 'typeorm';

import { Base } from './base';

@Entity('t1')
export class T1 extends Base {
  @Column({ length: 5 })
  name: string;

  @Column()
  age: number;
}
