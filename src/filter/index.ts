import { UnhandledErrorFilter } from './unhandledError';
import { BadRequestFilter } from './badRequest';
import { NotFoundFilter } from './notfound';
import { ParamsErrorFilter } from './paramsError';

export const filterList = [
  NotFoundFilter,
  ParamsErrorFilter,
  BadRequestFilter,
  UnhandledErrorFilter,
];
