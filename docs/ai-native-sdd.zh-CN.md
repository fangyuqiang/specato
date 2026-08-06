<div align="right">
  <a href="ai-native-sdd.md">English</a> | <strong>简体中文</strong>
</div>

# AI-Native SDD 运行模型

## 产品主张

QA Workbench 是一个面向 API/UI 自动化测试的 AI-native、Git-based、规范驱动开发（SDD）工作空间。它的主要使用者是根据人编写的规范开展工作的 AI coding assistant。

它**不是**单一自治 Agent、Agent 框架，也不是要替代成熟测试工具的私有实现。Codex、Claude Code 以及其他具备仓库操作能力的 AI coding assistant 通过读取版本化契约、生成测试资产与集成代码、调用显式工具来驱动工程流程；可视化 Workbench UI 为人提供统一的观察、复核和追溯入口。

设计目标是用稳定的仓库契约连接 OpenAPI、Arazzo、Markdown TestCase、Playwright、Allure 等成熟标准和工具，而不是重新实现它们已经提供的能力。

## 系统角色

| 角色 | 职责 | 不负责 |
| --- | --- | --- |
| Git 仓库 | 版本化控制面、审查历史、变更边界和审计轨迹 | 保存运行 secret 或生成证据 |
| SDD 资产 | 意图、规范、验收场景、TestCase 和执行引用 | 隐藏的项目约定 |
| 人 | 定义规范、验收意图、策略和审批边界 | 手工编写或协调每一份测试资产 |
| AI coding assistant | 生成 TestCase、API/UI 自动化、adapter 变更和 execution plan；调用受支持工具；解释结果 | 脱离仓库策略行动或成为隐藏事实来源 |
| QA Workbench 契约与工具 | 为 AI client 提供稳定的发现、校验、生成、执行和证据关联工作空间 | 把流程内置或锁定到单一 AI 供应商 |
| 核心契约 | 归一化 catalog、environment、execution plan、event 和 report reference | 编码单一产品的业务语言 |
| 既有 runner 与 adapter | 通过显式能力执行 API/UI 自动化 | 决定产品意图或治理规则 |
| 证据与报告工具 | 保存已脱敏的结构化结果和原生报告 | 成为规范事实来源 |
| Workbench UI | 面向人的观察、导航、复核和追溯 | 成为主要的手工编排界面 |

## 参考流程

```text
人编写的规范与验收边界
        │
        ▼
Git 中版本化的 SDD 事实来源
        │
        ▼
Codex / Claude Code / 其他 AI coding assistant
生成 TestCase、API/UI 自动化、adapter 和计划
        │
        ▼
核心校验 + 显式 runner adapter
        │
        ▼
既有 API/UI runner（例如 Playwright）
        │
        ▼
已脱敏证据 + 原生报告（例如 Allure）
        │
        ▼
Workbench 观察与人工复核
        │
        └──────────► 经审查的 Git 变更
```

AI 工具可以替换。持久接口是仓库中的规范、manifest、schema、命令、证据引用和可审查变更。人定义什么必须成立，AI 负责把这些意图主要转换为可执行的测试工程资产。

## 这里的 “AI-native” 是什么

- 仓库结构和契约从设计上支持 AI coding assistant 安全读取与修改。
- AI coding assistant 应根据经审查的规范生成和维护 TestCase、API/UI 自动化、runner adapter 与报告集成。
- 操作具有显式输入、输出、前置条件和失败状态，不依赖口口相传的知识。
- AI 工具可以准备计划并调用 adapter，但允许行为由仓库定义。
- 人工审查聚焦意图、规范变更、证据和风险，而不是手动重放每个命令。
- 流程不归属于单一供应商、模型、prompt 或内置 Agent。

AI-native 不代表“默认信任 AI”。不可信规范、路径边界、命令 allowlist、secret 隔离和 fail-closed 证据处理仍然必须成立。

## 这里的 “SDD-driven” 是什么

规范是主动的执行契约，不是被动文档：

1. 变更从明确意图和预期行为开始。
2. OpenAPI、Arazzo、TestCase 或其他版本化资产定义可测试契约。
3. 项目 manifest 将这些资产连接到 provider、environment 和受支持 runner。
4. AI client 生成或更新所需测试资产，并调用经过校验的 execution plan。
5. 结果反向关联来源规范和 TestCase。
6. 审查更新 Git 事实来源，而不是不透明的平台数据库。

## 集成优先，而不是重造

只有能补充以下跨工具缺口时，QA Workbench 才应增加集成能力：

- 稳定的仓库契约；
- 安全发现和归一化；
- 显式执行边界；
- 从规范到证据的追溯；
- 面向人的观察界面。

它不应替代 OpenAPI 建模、Arazzo workflow 语义、Playwright 浏览器自动化、Allure 报告、Git 审查或 AI coding assistant 本身。它的职责是让这些组件能被 AI-driven SDD 清晰理解和组合。

## 当前实现与目标模型

当前已交付：

- 项目 manifest 与 synthetic 规范发现；
- OpenAPI、Arazzo 和 TestCase catalog；
- environment 与 secret reference 解析；
- 用于观察 catalog、配置、源码和报告的本机 Workbench；
- 受边界约束的 Allure 和 Playwright 报告发现。

仍需实现：

- 版本化的 `ExecutionPlan`、`ExecutionEvent` 和 `ExecutionResult` 契约；
- 面向 AI 的 TestCase、API 自动化、UI 自动化和 adapter 变更生成契约；
- 可由 AI client、CLI、CI 和 Workbench 共用的 runner adapter 调用；
- 完整脱敏和证据保留 pipeline；
- synthetic API/UI 端到端执行流程；
- 面向多种 AI coding assistant 的工具接口文档。

在这些能力完成前，仓库展示的是 SDD 控制基础和面向人的观察 UI，而不是完整的 AI 驱动自动化生命周期。
