import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { listOpenJobs, applyToJob } from '@meetwise/db';
import { DbService } from '../../platform/db.service';

/**
 * 候选人(C 端)岗位应用服务。浏览=跨租户公开读(RLS p_read 放行 open);投递=候选人 INSERT 自己那条(RLS p_candidate_insert)。
 * 全经 asPrincipal——即便浏览也在 principal 上下文里跑(set_config 让公开读策略可评估)。业务异常在此抛(F1:controller 不碰)。
 */
@Injectable()
export class JobsService {
  constructor(private readonly db: DbService) {}

  browse(principal: string) {
    return this.db.asPrincipal(principal, async (c) => ({ jobs: await listOpenJobs(c) }));
  }

  async apply(principal: string, jobId: string) {
    const r = await this.db.asPrincipal(principal, (c) => applyToJob(c, principal, jobId));
    if (!r) throw new HttpException({ error: 'job_not_found_or_closed' }, HttpStatus.NOT_FOUND);   // 岗位不存在/已关闭
    return r;
  }
}
