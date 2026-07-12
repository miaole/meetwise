import { Injectable } from '@nestjs/common';
import { createPool, asPrincipal, type Client, type DbPool } from '@meetwise/db';

/** 数据访问：连接池 + principal 上下文事务。原语实现单一真相在 @meetwise/db，这里只做 Nest DI 薄封装。 */
@Injectable()
export class DbService {
  readonly pool: DbPool = createPool();

  asPrincipal<T>(user: string, fn: (c: Client) => Promise<T>): Promise<T> {
    return asPrincipal(this.pool, user, fn);
  }
}
