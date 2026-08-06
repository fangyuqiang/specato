<div align="right">
  <a href="architecture.md">English</a> | <strong>简体中文</strong>
</div>

# 架构说明

## 定位

Specato 是面向 API/UI 自动化测试的 AI-native、Git-based、SDD-driven 工作空间。人定义规范、验收意图和策略边界；可替换的 AI coding assistant 根据事实来源生成 TestCase、API/UI 自动化、adapter 变更和 execution plan；成熟 runner 执行计划；可视化 Workbench UI 供人观察和复核结果状态。

项目不是内置自治 Agent，也不替代 Git、OpenAPI、Arazzo、Playwright、Allure 或 AI coding assistant。角色边界见 [AI-native SDD 运行模型](ai-native-sdd.zh-CN.md)。

## 架构原则

- **Git 是控制面。** 规范、manifest、TestCase、计划和经审查变更保持版本化和可移植。
- **规范驱动行为。** 运行工作必须追溯到显式、可测试资产。
- **AI client 是可替换的驱动者。** Codex、Claude Code 等工具使用相同仓库契约。
- **既有工具负责执行。** Adapter 集成成熟 runner 和报告系统，不重新实现它们。
- **Specato 面向 AI。** 仓库契约和工具是 AI 驱动生成与执行的主要工作界面。
- **Workbench UI 是观察面。** 可视化 UI 向人展示 catalog、配置状态、证据和报告，不是主要编排界面。
- **项目知识留在项目侧。** 公共核心不学习私有产品概念。

## 平面与分层

```text
控制面（Git）
  规范 · TestCase · ProjectManifest · 经审查变更
                              │
                              ▼
流程驱动者
  Codex · Claude Code · 其他 AI client
  生成 TestCase · 自动化 · adapter · execution plan
                              │
                              ▼
核心契约与校验
  CatalogProvider · EnvironmentProvider · ExecutionPlan · event
                              │
                              ▼
集成与执行
  RunnerAdapter · 既有 API/UI runner · 报告生成器
                              │
                              ▼
证据面
  已脱敏结构化结果 · 原生报告 · 可追溯引用
                              │
                              ▼
人的观察面
  Workbench UI · 复核视图 · 诊断 · 审批
```

当前预览版实现了 catalog、environment、仓库文件、报告索引和观察部分。Execution plan 与 runner adapter 仍属于路线图工作。

## 核心契约

### `ProjectManifest`

声明项目 ID、规范来源、provider、受支持 runner、允许的 workspace 和报告策略。TestCase source 显式声明 `files`、`module` 和 `capability`；核心不能从目录名反推私有领域模型。

### `CatalogProvider`

把 TestCase、OpenAPI、Arazzo 或其他规范来源归一化为可查询的 catalog entry 和诊断。它负责发现契约，不执行测试。

### `EnvironmentProvider`

把环境名称、base URL、继承和 secret reference 解析为已校验运行配置。UI 和 AI client 可以查看就绪状态，但不能读取 secret value。

### `ExecutionPlan` 与执行事件

目标执行契约描述选中测试、runner capability、已校验 environment reference、超时、取消和证据策略。版本化 event/result 将让 AI client、CLI、CI 和 Workbench 共用一条执行路径。该契约尚未实现。

### `RunnerAdapter`

把已校验 execution plan 翻译为成熟 runner 调用。Adapter 声明 capability、输入 schema、preflight、取消行为和结构化输出；不得拼接 shell 命令，也不得把项目专用鉴权提升为核心概念。

### `ReportDefinition`

定义结构化结果如何索引、脱敏、聚合和展示。报告消费执行输出，但不成为规范事实来源。

当前预览版索引 API/UI Allure 2 JSON 和 Playwright HTML 报告。历史 XML 或产品专用格式不属于兼容契约。

## 参考数据流

1. 人在 Git 中定义或批准规范、验收意图和运行边界。
2. AI client 读取仓库指令，生成或更新 TestCase、API/UI 自动化和所需 adapter 代码。
3. `ProjectManifest` 和 provider 从经审查资产建立归一化 catalog。
4. AI client 准备 execution plan；核心校验选择、environment reference、路径和 runner capability。
5. Runner adapter 调用既有 API/UI 工具。
6. 证据在写盘前脱敏，并关联来源规范与 TestCase。
7. Workbench UI 展示 catalog 状态、诊断和报告供人复核。
8. 经批准的规范和生成资产更新 Git 事实来源。

默认采用 fail-closed：schema 无效、runner 未注册、配置缺失、路径逃逸、命令不受支持或脱敏无法确认时停止操作。

## 仓库与部署决策

- 在真实集成形成稳定 package 边界前保留 `qa/` workspace。
- 默认示例和验证只使用 synthetic project。
- Workbench UI 定位为本机观察工具，默认绑定 loopback。
- 仓库文件使用 manifest allowlist、路径规范化和 realpath 边界。
- 动态报告使用固定根目录和 realpath 边界。
- 真实项目 manifest、adapter、凭据和证据留在项目侧仓库或本机忽略路径。
- 暴露仓库中立的生成、校验、执行和证据契约，使多种 AI 工具能驱动同一流程。

## 扩展判断

新增概念前回答：

1. 差异能否由项目 manifest 表达？
2. 若不能，它属于 catalog、environment、execution、runner、evidence 还是 report？
3. 两个独立 synthetic 场景能否验证该语义？
4. 它是在集成既有工具，还是不必要地重新实现？
5. 它是否会让核心依赖某个 AI client、私有产品术语或 secret？

只有可复用语义进入核心。工具专用传输放在 adapter，产品专用行为留在项目侧。

## 演进方向

独立安装和安全门禁稳定后，架构可以增加：

- 版本化 execution 与 evidence 契约；
- 基于既有工具的 API 和 Playwright runner adapter；
- Codex、Claude Code 和其他 client 共用的 AI-readable CLI 或工具接口；
- core/adapter 兼容矩阵；
- 基于已证明复用的 package 边界；
- 仅在认证和授权通过独立审查后提供远程观察。

这些是路线图方向，不是当前预览版已交付能力。
