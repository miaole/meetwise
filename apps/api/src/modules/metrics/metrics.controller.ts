import { Controller, Get, Header } from '@nestjs/common';
import { getMetrics } from '@meetwise/ai-runtime';

/**
 * Prometheus 抓取端点(公开,只出聚合标量——无 PII)。覆盖 Langfuse 管不到的系统层:
 * HTTP 请求率/错误率/延迟(由 main.ts onResponse hook 记)、队列深度/熔断态(gauge,后续接)。
 * 生产应由网络/ingress 限制为内网可达;此处不加业务鉴权(scraper 无登录态)。
 */
@Controller('metrics')
export class MetricsController {
  @Get()
  @Header('content-type', 'text/plain; version=0.0.4')
  scrape(): string {
    return getMetrics().render();
  }
}
