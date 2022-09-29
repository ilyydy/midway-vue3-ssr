import { failResp, successResp } from '../lib/util';

export abstract class Base {
  static successResp = successResp;
  static failResp = failResp;
}
