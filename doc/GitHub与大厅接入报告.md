# GitHub 与大厅接入报告

## v0.2 更新已上线

2026-10-15。来源固定 `10d7d0566693764d2de2d83c828f0fabd2fd7102`，九类积木与画笔共69种；42/42测试、构建与桌面/手机/单文件浏览器检查通过。[来源CI](https://github.com/xiaoxuhui/mini-scratch/actions/runs/38753577199)成功。

大厅序列9已发布0.2.0 / 资源#2，完整历史与其他游戏保留，无需更换APK。ZIP asset644169215，188863字节，SHA-256 `12d3953b9369755e246e1a3859a506f86cf9db2f120a29efbae13e125a5aadec`；签名目录asset644172022，SHA-256 `d4970f1be88b4afc02878cfa0a0eb92617b241ee1642b031e8696c7851056a9e`。匿名结果：`Verified online sequence 9, 10 cumulative resources across 9 signed catalogs`。

大厅点“立即检查”获取更新；未安装的在“游戏目录”安装。新版独立v2作品槽、旧槽及首次升级备份保留；旧版后续编辑不会合并进新版。本轮未做Android设备实测，返回值拖拽、文件往返与听音验收边界见v0.2测试报告。完整[大厅N15发行记录](https://github.com/xiaoxuhui/game-hub/blob/main/doc/evidence/n15-mini-scratch-v02-release.md)。

## 首次接入历史

日期：2026-10-15。用户要求的两项工作均已完成：

1. 新建公开仓库 [xiaoxuhui/mini-scratch](https://github.com/xiaoxuhui/mini-scratch)，main 含完整历史、源码、离线产物、MIT 许可及 CI。初次推送 SHA `8c3bad2a0a9f71053bc2dfb132f7ca4417a182a4` 已用 git ls-remote 核对；后续报告提交不改变固定运行资源。
2. 大厅 [game-resources-v2](https://github.com/xiaoxuhui/game-hub/releases/tag/game-resources-v2) 目录序列 8 已签名发布 mini-scratch，显示名「灵感积木」，版本 0.1.0 / 资源 #1。

大厅 v0.4.0 及以上：“立即检查” → “游戏目录” → “灵感积木” → 安装。安装后进入首页，后续可离线运行，无需更换 APK。

来源 17/17 单测、构建和产物核对通过；[来源 CI](https://github.com/xiaoxuhui/mini-scratch/actions/runs/38745325580) 与 [大厅 CI](https://github.com/xiaoxuhui/game-hub/actions/runs/38745525437) 均成功。大厅 85/85 回归通过，5 份 ZIP 与 unsigned 描述重复生产摘要一致。

资源 ZIP SHA-256：`1323c534ffba8405448c52cf73c4b048f1596dd88f4c6b231258239d354e0d13`，asset 644018323，102015 字节。

签名目录 asset 644025209，SHA-256 `0158a1e8f61302f9928722c84716bbcfb3c4eeb5731436806397527c526d088b`。匿名在线检查输出 `Verified online sequence 8, 9 cumulative resources across 8 signed catalogs`。既有四个动态游戏完整描述与 ZIP 保持。

完整公开证据及缓存延迟安全续行见 [大厅 N14 发行记录](https://github.com/xiaoxuhui/game-hub/blob/main/doc/evidence/n14-mini-scratch-release.md)。本轮未运行 Android 设备，没有在用户设备安装；原浏览器文件往返验收限制继续保留。
