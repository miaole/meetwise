            - generic [ref=e64]:
              - generic [ref=e65]:
                - img [ref=e66]
                - text: 新问题
              - generic [ref=e68]: · 技术深度
              - generic [ref=e69]: 第 2 题
            - paragraph [ref=e72]: TCP 三次握手过程中，为什么客户端最后还要发送一次 ACK？如果这一步缺失，服务端会处于什么状态？
          - generic [ref=e73]:
            - generic [ref=e74]: 我的回答
            - paragraph [ref=e77]: 我会用稳定幂等键约束写操作，配合 outbox、重试退避和指标告警确保最终一致。
      - status [ref=e78]: 练习因持续偏弱或多次未决提前结束（自适应控制流，不是能力等级或招聘结论）
      - alert [ref=e79]: 面试已完成并扣费结算，但未获得可信评分，本次不生成报告。岗位面试可从“我的投递”重新开始；其他面试可新建一场。
      - button "前往我的投递" [ref=e80] [cursor=pointer]
  - region "Notifications alt+T"
  - alert [ref=e81]: Meetwise 知面 · 预览版
```

# Test source

```ts
  132 |         );
  133 |         throw new Error(`[g7u-fixture] route not decided within ${ROUTE_DECIDED_WAIT_CAP_MS}ms cap — fixture wait failed honestly`);
  134 |       }
  135 |       await new Promise((resolve) => setTimeout(resolve, ROUTE_DECIDED_POLL_INTERVAL_MS));
  136 |     }
  137 |   } finally {
  138 |     await client.end().catch(() => {});
  139 |   }
  140 | }
  141 | 
  142 | test('C→B: real browser binds application to a new interview, completes it, and front-end finalizes it', async ({ page, browser, request }) => {
  143 |   // 这是一个 6 题的真实模型旅程：每题都包含 worker、模型评分和 SSE（服务器发送事件）回写。
  144 |   // 150 秒不足以覆盖已经实测的单轮真实语音延迟，导致“系统仍在正确收口”被误报为产品失败。
  145 |   // 此处只放宽旅程总预算；单服务延迟仍由 performance E2E（端到端）门独立量化，不能把该值当性能目标。
  146 |   test.setTimeout(420_000);
  147 |   const suffix = randomUUID();
