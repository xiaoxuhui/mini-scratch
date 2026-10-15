# GitHub 与游戏大厅接入

- **Status**: PENDING
- **Approved**: 2026-10-15 用户要求创建并推送 GitHub 仓库，并加入游戏大厅
- **Type**: feature

## R1 来源仓库 `[PENDING]`
- **Objective**：完整源码与可离线运行产物推送 xiaoxuhui/mini-scratch 的 main。
- **Definition of Done**：`node --test` 17/17；build 与 verify-build 成功；`git ls-remote origin refs/heads/main` 与本地 main 完整 SHA 一致。
- **Files**：LICENSE, .gitattributes, package.json, .github/workflows/check.yml, scripts/build.mjs, dist/LICENSE, README.md

## R2 大厅资源接入 `[PENDING]`
- **Objective**：固定来源 SHA 及独立存储合同，新增资源而保留既有游戏。
- **Definition of Done**：大厅 `node --test` 全绿，独立干净检出两次生产的 ZIP 摘要相同；生产公钥验签和匿名线上资产核验通过。
- **Files**：大厅 dynamic-sources.lock.json、scripts/upstream-watch.mjs、发布器 N14 范围、测试及 doc/N14 文档。

## R3 交付核验 `[PENDING]`
- **Objective**：确认 GitHub 来源可读、大厅签名目录可发现并说明实际客户端测试边界。
- **Definition of Done**：远端 main 与本地一致；签名目录中 mini-scratch、version=0.1.0、contentCode=1；旧游戏身份不回退；客户端验收结果如实记录。
- **Files**：doc/GitHub与大厅接入报告.md、大厅 doc/evidence/n14-mini-scratch-release.md
