import { LogRequestMiddleware } from './logRequest';
import { TransactionIdMiddleware } from './transactionId';

export const middlewares = [TransactionIdMiddleware, LogRequestMiddleware];
