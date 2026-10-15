# GitHub 与游戏大厅接入

- **Status**: VERIFIED
- **Approved**: 2026-10-15 用户要求创建并推送 GitHub 仓库，并加入游戏大厅
- **Type**: feature

## R1 来源仓库 `[VERIFIED]`
- **Objective**：完整源码与可离线运行产物推送 xiaoxuhui/mini-scratch 的 main。
- **Definition of Done**：`node --test` 17/17；build 与 verify-build 成功；`git ls-remote origin refs/heads/main` 与本地 main 完整 SHA 一致。
- **Files**：LICENSE, .gitattributes, package.json, .github/workflows/check.yml, scripts/build.mjs, dist/LICENSE, README.md

## R2 大厅资源接入 `[VERIFIED]`
- **Objective**：固定来源 SHA 及独立存储合同，新增资源而保留既有游戏。
- **Definition of Done**：大厅 `node --test` 全绿，独立干净检出两次生产的 ZIP 摘要相同；生产公钥验签和匿名线上资产核验通过。
- **Files**：大厅 dynamic-sources.lock.json、scripts/upstream-watch.mjs、发布器 N14 范围、测试及 doc/N14 文档。

## R3 交付核验 `[VERIFIED]`
- **Objective**：确认 GitHub 来源可读、大厅签名目录可发现并说明实际客户端测试边界。
- **Definition of Done**：远端 main 与本地一致；签名目录中 mini-scratch、version=0.1.0、contentCode=1；旧游戏身份不回退；客户端验收结果如实记录。
- **Files**：doc/GitHub与大厅接入报告.md、大厅 doc/evidence/n14-mini-scratch-release.md

## 最终证据

2026-10-15：17/17 来源测试、build/verify-build 通过，两仓库精确运行提交 CI 成功；大厅85/85通过；五份资源包重复生产一致；已签名发布序列8，匿名核验全部8代目录和9份累计资源通过。来源锁保持8c3bad2a，公开发行资产644025209、资源资产644018323。完整证据见 GitHub与大厅接入报告.md 与大厅N14发行记录。Android设备未实测，结果如实记录。
