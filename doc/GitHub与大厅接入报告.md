# GitHub 与大厅接入报告

日期：2026-10-15。用户要求的两项工作均已完成：

1. 新建公开仓库 [xiaoxuhui/mini-scratch](https://github.com/xiaoxuhui/mini-scratch)，main 含完整历史、源码、离线产物、MIT 许可及 CI。初次推送 SHA `8c3bad2a0a9f71053bc2dfb132f7ca4417a182a4` 已用 git ls-remote 核对；后续报告提交不改变固定运行资源。
2. 大厅 [game-resources-v2](https://github.com/xiaoxuhui/game-hub/releases/tag/game-resources-v2) 目录序列 8 已签名发布 mini-scratch，显示名「灵感积木」，版本 0.1.0 / 资源 #1。

大厅 v0.4.0 及以上：“立即检查” → “游戏目录” → “灵感积木” → 安装。安装后进入首页，后续可离线运行，无需更换 APK。

来源 17/17 单测、构建和产物核对通过；[来源 CI](https://github.com/xiaoxuhui/mini-scratch/actions/runs/38745325580) 与 [大厅 CI](https://github.com/xiaoxuhui/game-hub/actions/runs/38745525437) 均成功。大厅 85/85 回归通过，5 份 ZIP 与 unsigned 描述重复生产摘要一致。

资源 ZIP SHA-256：`1323c534ffba8405448c52cf73c4b048f1596dd88f4c6b231258239d354e0d13`，asset 644018323，102015 字节。

签名目录 asset 644025209，SHA-256 `0158a1e8f61302f9928722c84716bbcfb3c4eeb5731436806397527c526d088b`。匿名在线检查输出 `Verified online sequence 8, 9 cumulative resources across 8 signed catalogs`。既有四个动态游戏完整描述与 ZIP 保持。

完整公开证据及缓存延迟安全续行见 [大厅 N14 发行记录](https://github.com/xiaoxuhui/game-hub/blob/main/doc/evidence/n14-mini-scratch-release.md)。本轮未运行 Android 设备，没有在用户设备安装；原浏览器文件往返验收限制继续保留。
