<div align="right">
  <a href="open-source-readiness.md">English</a> | <strong>简体中文</strong>
</div>

# 开源准备度

## 当前判断

Specato 已作为 `0.1` 早期源码预览公开。它的定位是 AI-native、Git-based、SDD-driven 工作空间：人定义规范和边界，可替换的 AI coding assistant 生成并维护 TestCase、API/UI 自动化、runner 集成和 execution plan。

公共仓库目前适合源码审查、独立安装以及 synthetic catalog/report 探索。它**还不是**带 tag 的预览版本、稳定 API、完整 AI 驱动自动化生命周期、远程服务或已发布 npm package。

## 已交付并验证

- 独立仓库，不依赖来源业务仓库、相邻 checkout 或非公开基础设施。
- 从审计后的源码树创建了干净的公共 Git 历史。
- Manifest 驱动的 OpenAPI、Arazzo、TestCase、environment 和 report 发现。
- TestCase ID 不依赖固定 capability 前缀或私有目录约定。
- 用于观察 catalog、配置就绪状态、白名单源码和报告的本机 Workbench UI。
- 仓库文件和报告文件具备 manifest allowlist、路径规范化、realpath 和 symlink 逃逸测试。
- 默认只绑定 loopback，非 loopback 使用需要显式 opt-in。
- 仓库只包含 synthetic OAS、Arazzo、TestCase 和单元测试资产。
- 初始公开源码快照已完成冻结安装、15 项单元/集成测试、生产构建、依赖漏洞审计、仓库审计和干净历史 secret 扫描。
- Apache-2.0 源码许可证，以及随仓库分发的 shadcn/ui 生成源码 MIT 声明。
- 生产依赖仅包含宽松或可选择宽松分支的许可证；审计锁文件中未发现 GPL、LGPL、AGPL 或 SSPL 依赖。
- 英文默认、简体中文同步镜像的文档体系。
- CodeGraph 已在本机初始化，索引数据库不进入 Git。

## 门禁状态

| 门禁 | 状态 | 证据或剩余缺口 |
| --- | --- | --- |
| G0 公开内容 | 当前源码已满足 | Synthetic 资产、仓库审计、干净公共历史和公开策略 |
| G1 可复现 | 当前源码已满足 | 隔离 checkout 中的冻结安装、测试和构建 |
| G2 安全 | 部分满足 | 当前路径、URL、loopback 和 secret 边界有测试；runner sandbox 与完整脱敏 pipeline 尚不存在 |
| G3 AI 驱动执行 | 未满足 | 生成契约、`ExecutionPlan`、runner adapter 和 synthetic API/UI 端到端执行尚未实现 |
| G4 许可证 | 源码分发已满足 | Apache-2.0、锁定依赖审计和 vendored source notice |
| G5 治理 | 部分满足 | 已有贡献、安全、公开、双语文档和路线图策略；发布流程、兼容矩阵和维护策略还需要实际演练 |

## 带 tag 预览版前的剩余缺口

1. 定义面向 AI 的 TestCase、API 自动化、UI 自动化和 adapter 变更生成契约。
2. 实现版本化 `ExecutionPlan`、`ExecutionEvent` 和 `ExecutionResult` 契约。
3. 通过同一显式 adapter 边界集成 API runner 与 Playwright runner。
4. 实现并测试证据脱敏、保留、取消、超时和失败处理。
5. 证明完整 synthetic 流程：人的规范 → AI 生成资产 → 校验执行 → Allure/原生报告 → 人工复核。
6. 使用仓库脚本发布平台中立的自动化方案，不让核心依赖某一个托管平台。
7. 验证支持的 Windows/Linux 和最低 Node.js/当前 LTS 矩阵。
8. 定义 release tag、changelog 生成、兼容性承诺和维护责任。
9. 为关键 `0.x` 依赖建立升级检查和 bundle budget。

## 分发判断

仓库只分发源码，不交付 `node_modules`、bundle、容器、离线依赖或第三方二进制。因此 npm 依赖 notice 不复制进源码树，但每个依赖仍受其锁定版本许可证约束。

若分发形态改变，必须以实际产物重新生成第三方 notice 和 SBOM。阶段规划见[开源路线图](open-source-roadmap.zh-CN.md)，发布检查见[公开内容边界](publication-boundary.zh-CN.md)。
