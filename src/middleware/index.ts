import { LogRequestMiddleware } from './logRequest';
import { TransactionIdMiddleware } from './transactionId';
import { FormatRespMiddleware } from './formatResp';

export const middlewares = [
  TransactionIdMiddleware,
  FormatRespMiddleware,
  LogRequestMiddleware,
];
