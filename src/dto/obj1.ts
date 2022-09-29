import { Rule, RuleType } from '@midwayjs/validate';

export class Obj1DTO {
  @Rule(RuleType.number().required())
  id: number;

  @Rule(RuleType.string().max(10))
  name: string;

  @Rule(RuleType.number().max(60))
  age: number;
}
