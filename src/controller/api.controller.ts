import { Inject, Controller, Get, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { API_ROUTE_PREFIX } from '../share/constant';

@Controller(API_ROUTE_PREFIX)
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;
}
