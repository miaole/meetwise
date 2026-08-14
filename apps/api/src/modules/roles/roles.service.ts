import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DbService } from '../../platform/db.service';

/**
 * 岗位库 + 简历岗位匹配应用服务。当前技能词重叠打分(确定性,可 gate);语义匹配(embedder+pgvector)是升级,seam 已在。
 * 修审计 F1:逻辑从 controller 下沉至此。
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;   // resume_id 是 uuid 列;非 uuid 直查会 22P02→500,提前当 not_found 兜成 404
const ROLES = [
  { id: 'backend', title: '后端工程师', skills: ['redis', '限流', '分布式锁', 'mysql', '分布式', '并发', '高并发'] },
  { id: 'sre', title: 'SRE / 运维', skills: ['监控', '高可用', '限流', '容灾', 'k8s', '稳定性'] },
  { id: 'data', title: '数据工程师', skills: ['sql', 'etl', '数仓', '大数据', 'spark'] },
];

@Injectable()
export class RolesService {
  constructor(private readonly db: DbService) {}

  list() { return { roles: ROLES.map((r) => ({ id: r.id, title: r.title, skills: r.skills })) }; }

  async match(principal: string, resumeId: string) {
    if (!UUID_RE.test(resumeId)) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);   // 非 uuid → 22P02 500 兜底成 404
    const facts = await this.db.asPrincipal(principal, async (c: any) => {
      const r = await c.query('SELECT structured FROM resume_profile WHERE resume_id=$1', [resumeId]);   // RLS 限己
      return r.rowCount === 0 ? null : JSON.stringify(r.rows[0].structured).toLowerCase();
    });
    if (facts === null) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    const matches = ROLES
      .map((role) => ({ id: role.id, title: role.title, score: role.skills.filter((s) => facts.includes(s.toLowerCase())).length }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    return { matches };
  }
}
