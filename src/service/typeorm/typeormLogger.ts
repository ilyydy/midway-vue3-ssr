import { Logger as TypeORMLoggerInterface, QueryRunner } from 'typeorm';
import { Provide, ScopeEnum, Scope, Logger } from '@midwayjs/core';
import { ILogger } from '@midwayjs/logger';

@Provide('typeORMLogger')
@Scope(ScopeEnum.Singleton)
export class TypeORMLogger implements TypeORMLoggerInterface {
  @Logger()
  logger: ILogger;

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    this.logger.info('sql logQuery, %s, parameters %j', query, parameters);
  }

  logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner
  ) {
    this.logger.info(
      'sql logQueryError, %s, parameters %j, error %s',
      query,
      parameters,
      error
    );
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner
  ) {
    this.logger.info(
      'sql logQuerySlow, %s, parameters %j, cost %dms',
      query,
      parameters,
      time
    );
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    //
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    //
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    //
  }
}
