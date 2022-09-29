import { failResp, successResp } from '../lib/util';

export abstract class BaseFilter {
  static successResp = successResp;
  static failResp = failResp;
}
