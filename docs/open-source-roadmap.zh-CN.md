<div align="right">
  <a href="open-source-roadmap.md">English</a> | <strong>简体中文</strong>
</div>

# 开源路线图

## 产品方向

QA Workbench 的目标是成为 AI-native、Git-based、SDD-driven 的 API/UI 自动化测试解决方案。

人定义规范、验收意图和策略边界；Codex、Claude Code 等可替换的 AI coding assistant 把事实来源转换为 TestCase、API/UI 自动化、runner 集成、execution plan 和报告集成；可视化 Workbench UI 让人观察、复核和批准结果状态。

项目集成成熟标准和工具，而不是重新实现它们：

- 用 OpenAPI 表达 API 契约；
- 用 Arazzo 表达多步 API workflow；
- 用仓库 TestCase 表达验收意图；
- 用 Playwright 等既有 runner 执行；
- 用 Allure 和 runner 原生报告查看结果；
- 用 Git 完成审查、历史和可移植性；
- 用多种 AI coding assistant 完成生成与编排。

## 交付原则

- 先稳定仓库契约，再增加大量 adapter。
- 保持 AI client 可替换，不由单一内置 Agent 拥有流程。
- 通过显式 schema、命令、allowlist 和 preflight 生成与执行。
- 成熟工具已经解决执行或报告时优先集成。
- 真实项目知识留在项目侧 manifest 和 adapter。
- 远程认证和授权通过独立审查前，可视化 UI 只绑定 loopback。
- 证据先脱敏再写盘，无法确认安全时 fail-closed。
- 每份文档都区分已交付、进行中和路线图意图。

## 发布门禁

| 门禁 | 必须证明的结果 |
| --- | --- |
| G0 公开内容 | 无真实规范、TestCase、账号、环境身份、非公开基础设施、业务资产和生成证据 |
| G1 可复现 | 从隔离候选 checkout 冻结安装、测试、构建并运行 synthetic demo |
| G2 安全 | Secret scan 无未处理项；路径、命令、secret、脱敏和远程访问边界有效 |
| G3 AI 工作流 | 经审查规范可以驱动 AI 生成 TestCase 和 API/UI 自动化，并完成可追溯执行 |
| G4 集成 | 通过稳定 adapter 连接既有 runner 与 Allure/原生报告，不复制其核心行为 |
| G5 许可证 | 源码许可证、锁定依赖审计，以及实际分发第三方源码或二进制的完整 notice |
| G6 治理 | 版本、贡献、安全响应、维护、兼容性和发布流程可以实际执行 |

## 阶段 0 — 公共源码基础

**状态：当前源码预览已交付。**

范围：

- 独立 workspace 和干净公共历史；
- manifest 驱动的 OpenAPI、Arazzo、TestCase、environment 和 report catalog；
- 仅监听 loopback、文件读取受 allowlist 和 realpath 约束的 Workbench UI；
- 受边界约束的 Allure 和 Playwright 报告发现；
- synthetic fixture、仓库审计、依赖审计、许可证声明和 secret 扫描；
- 英文默认的双语文档和本机 CodeGraph 初始化。

退出证据：当前源码快照已满足 G0、G1，并验证 G2/G5 中与源码分发相关的部分。

阶段 0 不提供 AI 生成自动化或 runner 编排。

## 阶段 1 — AI-readable SDD 与生成契约

**目标：** 让多种 AI coding assistant 能安全、无歧义地转换人编写的意图。

范围：

- 定义版本化的规范意图、TestCase 生成、自动化生成和变更来源 schema；
- 定义 Codex、Claude Code 等 client 可使用的仓库指令和工具中立操作；
- 根据经审查规范生成 synthetic TestCase；
- 根据 OpenAPI/Arazzo 生成 API 自动化骨架，根据经审查 UI 规范生成 UI 自动化骨架；
- 每个生成资产都关联来源规范、理由和审查状态；
- 校验生成内容符合公开边界和项目边界。

退出条件：

- 两种不同 AI client 能根据相同 synthetic 规范产出等价仓库资产；
- 生成资产通过 schema、来源、公开和审查检查；
- 不需要把供应商专用 prompt 或隐藏状态作为事实来源。

## 阶段 2 — 共享执行内核与 runner 集成

**目标：** 通过既有工具执行生成的自动化，不构建新的测试框架。

范围：

- 版本化 `ExecutionPlan`、`RunnerCapability`、`ExecutionEvent` 和 `ExecutionResult`；
- 定义 `RunnerAdapter` 的 preflight、输入校验、取消、超时和结构化输出；
- 集成只访问 synthetic loopback 服务的 API runner；
- 集成只访问 synthetic 本机页面的 Playwright；
- 向 AI client、CLI、CI 和 Workbench UI 暴露同一执行契约；
- 强制命令 allowlist、environment readiness 和 workspace 边界。

退出条件：

- 一个 synthetic API 流程和一个 synthetic UI 流程通过 G3；
- 配置缺失、命令不受支持、路径逃逸、取消和超时都有已测试失败行为；
- runner 特有行为留在 adapter。

## 阶段 3 — 证据、Allure 与人工复核

**目标：** 让 AI 驱动执行可解释、可复核，同时不替代原生报告系统。

范围：

- 实现 Authorization、Cookie、token、密码、签名、query 参数和配置字段脱敏；
- 把执行结果关联到来源规范、TestCase、生成资产和 Git revision；
- 集成 Allure 生成，并在有价值时保留 runner 原生报告；
- 在 Workbench UI 展示规范、计划、诊断、证据摘要和报告；
- 定义保留、清理、损坏输出和 fail-closed 行为。

退出条件：

- 每个展示结果都能追溯到经审查意图和执行 revision；
- 脱敏和路径边界有对抗测试；
- 可视化 UI 保持观察/复核面，不变成另一套手工编排系统。

## 阶段 4 — 项目侧 adapter 验证与带 tag 预览版

**目标：** 证明公共核心支持真实集成，同时不导入私有资产。

范围：

- 在项目侧或独立仓库维护真实 adapter；
- 至少验证一个 API 集成和一个 UI 集成；
- 建立 core/adapter 兼容矩阵；
- 验证 Windows/Linux 和最低 Node.js/当前 LTS；
- 使用仓库脚本发布平台中立的自动化方案；
- 增加威胁建模、迁移说明、changelog 生成、issue 模板和维护者规则；
- 为带 tag prerelease 生成校验和、SBOM 和可追溯 release metadata。

退出条件：不可变 release candidate 通过 G0-G6，并完成一次外部 synthetic 接入周期。

## 阶段 5 — 1.0 稳定版

**目标：** 对核心契约的兼容、升级和安全响应作出承诺。

范围：

- 冻结 schema 兼容规则和弃用周期；
- 发布支持的 AI client/tool 与 runner/adapter 兼容矩阵；
- 记录迁移工具和破坏性变更策略；
- 定义安全响应、维护分支和终止支持规则；
- 仅在远程认证和授权通过独立审查后考虑远程 Workbench 访问。

退出条件：契约升级、安全响应、release 维护和 adapter 迁移都完成过实际演练。

## 下一步实施顺序

1. 规范人编写的 SDD 输入和 AI 生成 TestCase 的来源模型。
2. 为生成输出和仓库边界增加 synthetic contract test。
3. 定义共享 execution 与 event schema。
4. 在同一 adapter 契约后先集成既有 API runner，再集成 Playwright。
5. 实现脱敏以及 Allure/evidence 关联。
6. 用项目侧 adapter 验证，但不导入私有资产。
7. 执行完整的带 tag 预览发布门禁。

本路线图定义基于证据的退出条件，不承诺日期。只有所需资产和验证进入公共仓库后，阶段状态才会更新。
