import { Injectable } from '@nestjs/common';
import { createPool, asGateway, asPrincipal, type Client, type DbPool } from '@meetwise/db';

/** 数据访问：连接池 + principal 上下文事务。原语实现单一真相在 @meetwise/db，这里只做 Nest DI 薄封装。 */
@Injectable()
export class DbService {
  readonly pool: DbPool = createPool();

  asPrincipal<T>(user: string, fn: (c: Client) => Promise<T>): Promise<T> {
    return asPrincipal(this.pool, user, fn);
  }

  /** 仅执行版本化固定 SECURITY DEFINER 函数；网关角色没有任何业务表权限。 */
  asGateway<T>(fn: (c: Client) => Promise<T>): Promise<T> {
    return asGateway(this.pool, fn);
  }
}
