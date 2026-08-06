<div align="right">
  <a href="README.md">English</a> | <strong>简体中文</strong>
</div>

# Specato

> **AI 原生、Git 驱动、从规范到测试自动化。**

AI 已经让 TestCase 和自动化代码的生成变得非常容易。但只有生成，并不能形成可靠的测试体系。真正困难的是：如何让 AI 的产出始终受意图约束、能被全局理解、可以持续审查、不需要人工接力就能执行，并最终追溯到结果证据。

Specato 是我们对这个问题的回答：一个面向 API/UI 自动化测试的 **AI-native、Git-based、SDD-driven 解决方案**。它与其说是另一个测试框架，不如说是一套开放的解决方案架构和参考实现，用来把规范、Git、AI coding assistant、命令行 runner、执行证据和报告连接成一条连续链路。

## 问题不只是如何生成

AI 生成的测试要成为可维护的工程体系，通常会在三个地方断开：

- **只依靠 prompt 生成，会丢失原始意图。** 如果没有持久契约，随着 prompt、模型和上下文变化，生成的 TestCase 与自动化会不断漂移。
- **以数据库为中心的管理，对 AI 默认是不透明的。** 传统测试管理产品把用例和元数据保存在数据库与产品 UI 后面。集成或许能取回局部信息，但 AI 很难像读取源码仓库一样，自然获得全局结构、历史、关联关系和 diff。
- **只能通过 GUI 执行，流程会停在生成阶段。** 如果测试工具仍然依赖人工操作，AI 即使写出了自动化，也无法通过同一条工程链路可靠地校验、执行并解释结果。

## 三个设计选择

### 1. 用 Spec 约束生成

经过人确认的规范和验收边界是事实来源。AI 不能只根据一次性的 prompt 生成：每一份 TestCase、API/UI 自动化变更、execution plan 和结果引用，都应该来源于版本化规范，并且能够反向追溯。

因此，规范不是背景文档，而是主动的工程契约。它让不同 AI client 获得一致意图，约束 AI 可以改变什么，也让所有生成结果有记录可循、可以解释和审查。

### 2. 用 Git 管理测试资产

需要长期保存的测试资产以 AI 可读文件的形式进入 Git，而不是只作为记录保存在不透明的应用数据库中。AI coding assistant 可以读取完整项目结构、跟踪引用、比较历史、提出 diff，并通过与人相同的审查边界协作。

Git 由此成为规范、TestCase、自动化、manifest 和执行引用的共享记忆与控制面。分支、commit 和 review 构成审计轨迹，不依赖隐藏的 Agent 记忆或某个供应商的平台状态。

### 3. 执行工具必须 CLI-first

要进入核心流程，每个执行工具和 adapter 都必须能通过命令行非交互调用，并提供明确的输入、输出、退出状态和失败行为。同一条命令链路应该同时可供 AI coding assistant、开发者和 CI 使用。

CLI-first 不代表不需要 UI。Workbench UI 是给人观察和复核的界面；命令行才是稳定的自动化边界，让 AI 能从生成继续进入校验、执行与结果解释。

这三个选择共同把 **Spec + Git + CLI** 连接起来，使 AI 不再只是测试代码生成器，而能参与从规范到证据的完整链路。

## 从规范到证据

```text
人在 Git 中定义规范与验收边界
            │
            ▼
Codex / Claude Code / 其他 AI coding assistant
生成 TestCase、API/UI 自动化和集成变更
            │
            ▼
Specato 校验契约并协调既有 runner
            │
            ▼
Playwright / API 工具 / 其他执行引擎
            │
            ▼
结构化证据 + Allure 和原生报告
            │
            ▼
人观察、复核并批准变更
```

AI client 可以替换，持久接口是版本化仓库契约和显式命令。生成资产、执行引用和经过审查的变更都能指回来源规范，因此整条链路始终可以检查和追溯。

## 这套方法带来的特性

- **生成可追溯：** 每一份生成资产都有可审查的意图来源。
- **AI 获得仓库级全局上下文：** 规范、TestCase、自动化和历史可以被一起读取。
- **模型与工具可替换：** Codex、Claude Code 或其他具备仓库能力的 AI client 使用相同契约。
- **本机与 CI 使用同一条执行路径：** AI、开发者和流水线调用相同的 CLI runner。
- **集成优先，而不是重新造轮子：** OpenAPI、Arazzo、Markdown TestCase、Playwright、Allure 等成熟工具继续承担各自职责。
- **人在正确的层次保持控制：** 人定义意图、策略和审批边界，并观察规范、变更、证据与报告。

Specato 不是单一内置 Agent、数据库优先的测试管理平台，也不是用私有实现替代现有 runner。这个开源仓库是上述整合思路的参考实现：用稳定契约服务 AI，用成熟工具负责执行，用 Workbench 供人观察。详见 [AI-native SDD 运行模型](docs/ai-native-sdd.zh-CN.md)。

名称由 **SPEC**ification 与 **A**utomation、**T**esting、**O**rchestration 组合而成。

> **当前状态：** `0.1` 早期源码预览。当前仓库已经实现 SDD 控制基础和观察层；完整的 AI 生成契约、共享的可执行 runner adapter，以及端到端自动化生命周期仍属于路线图工作。

## 推荐接入方式：嵌入产品 monorepo

公开的 Specato 仓库是一份独立、完全 synthetic 的参考实现。真实项目接入时，推荐把 Specato workspace、项目 manifest、规范、TestCase 和生成的自动化代码放进**产品源码所在的同一个 monorepo**。

这是一项架构选择，而不只是方便的目录布局。一个 feature branch 可以同时修改产品代码及对应规范；AI coding assistant 随后在同一变更中生成或更新 TestCase、API 自动化和 UI 自动化。审查、校验、执行与证据都指向完全相同的 Git commit，从根本上避免源码仓库与独立数据库测试平台之间的同步问题。

推荐布局示意如下：

```text
your-product/
├─ apps/ or services/             # 产品源码
├─ packages/                      # 产品共享 package
├─ openspec/ or specs/            # SDD 变更与验收规范
├─ tests/
│  ├─ testcases/                  # 版本化 Markdown TestCase
│  ├─ api/                        # AI 生成的 API 自动化
│  └─ ui/                         # AI 生成的 UI 自动化
├─ qa/
│  ├─ project.yaml                # Specato ProjectManifest
│  ├─ config/                     # 环境模板；本机 secret 保持忽略
│  ├─ core/                       # Catalog 与校验契约
│  └─ workbench/                  # 面向人的观察 UI 与本机服务
├─ package.json
└─ pnpm-workspace.yaml            # 纳入 Specato workspace
```

产品目录不要求固定名称。当前 `qa/project.yaml` schema 已声明规范、TestCase、environment 和 Workbench 可读路径；automation、runner 与 report mapping 会随执行契约实现后加入 manifest。Workbench 的读取范围仍受 manifest 白名单限制，私有环境值仍不得进入 Git。在源码预览阶段，接入意味着把 workspace 以源码方式纳入产品 monorepo；未来即使改为 package 分发，安装方式可以变化，同仓运行模型不会变化。

预期的分支工作流是：

```text
变更规范 + 产品代码
        │
        ▼
AI 同步更新 TestCase + API 自动化 + UI 自动化
        │
        ▼
在同一个 checkout 中完成契约校验 + CLI 执行
        │
        ▼
证据和报告关联同一份规范、TestCase 与 commit
```

## 系统整体架构

```text
产品 monorepo / Git 控制面
  产品源码 · SDD 规范 · OAS · Arazzo · TestCase · 自动化代码
                              │
                              ▼
AI 流程驱动者
  Codex · Claude Code · 其他具备仓库能力的 AI client
  读取完整仓库并生成可审查变更
                              │
                              ▼
Specato 核心契约
  ProjectManifest · catalog · 环境校验 · 执行策略
                              │
                              ▼
CLI 执行边界
  ExecutionPlan · RunnerAdapter · preflight · 显式退出状态
                              │
                              ▼
成熟执行工具
  API runner · Playwright 或其他 UI runner · 报告生成器
                              │
                              ▼
证据与报告面
  结构化结果 · Allure · 原生 HTML 报告 · 可追溯引用
                              │
                              ▼
人的观察面
  Workbench UI · 源码/配置视图 · 诊断 · 复核
```

Git 负责意图与历史，AI 驱动工程流程，Specato 归一化并校验契约，成熟工具负责执行，报告保存证据，人复核最终状态。Workbench 不会成为第二个事实来源，也不会引入另一套编排数据库。

当前预览版已经实现项目发现、catalog、环境校验、受约束的仓库读取、报告发现和观察 UI。版本化 `ExecutionPlan`、execution event/result、共享 `RunnerAdapter` 调用和完整 AI 生成接口是下一层架构。详细契约边界见[架构说明](docs/architecture.zh-CN.md)。

## 全链路使用的规范与契约

并非每个环节都需要创造新的公共标准。Specato 在合适的位置复用成熟标准，只在跨工具缺少连接边界时增加小型、版本化的仓库契约。

| 环节 | 推荐规范或契约 | 在链路中的作用 | 当前状态 |
| --- | --- | --- | --- |
| 变更意图与验收 | OpenSpec 等 Git-native SDD 格式，或等价的版本化 Markdown 规范 | 定义由人确认的需求、场景、验收边界和允许变更范围 | 推荐接入约定；核心不绑定具体 SDD 格式 |
| 项目拓扑 | `qa/project.yaml` 中的 Specato `ProjectManifest` | 映射模块、规范来源、TestCase 路径、environment、可读根目录、runner 和报告，避免硬编码业务领域 | 部分实现；catalog、environment 和文件读取字段已生效 |
| API 契约 | OpenAPI Specification（OAS） | 定义 operation、参数、请求/响应 schema、鉴权要求和稳定 `operationId` 引用 | Catalog 发现已实现；生成与执行 adapter 仍属于路线图 |
| 多步骤 API 行为 | Arazzo Specification | 把 OAS operation 连接成包含步骤输入、输出、依赖关系和成功条件的 workflow | Catalog 发现已实现；可执行 workflow adapter 仍属于路线图 |
| 人可读测试意图 | Specato Markdown TestCase 契约 | 用稳定 ID 组织 Requirement → Scenario → Priority → Preconditions → Steps → Expected results | 解析、校验、catalog、过滤和展示已实现 |
| 环境选择 | 版本化 YAML 环境模板 + 环境变量 secret reference | 定义命名 server、继承、传输策略和 secret 名称，不提交 secret value | 已实现配置校验与就绪状态展示 |
| 生成的自动化 | 带稳定 TestCase ID 和 OAS/Arazzo 引用的 runner-native 源码 | 把测试意图转换成可执行 API/UI 代码，同时保留到来源契约的追溯关系 | 目标 AI 生成约定；共享生成接口尚未实现 |
| 执行 | CLI + 版本化 `ExecutionPlan` 和 `RunnerAdapter` 契约 | 选择用例，校验 environment 与 runner capability，非交互调用工具并暴露确定的失败行为 | CLI-first 架构已定义；共享契约与调用仍属于路线图 |
| 证据与报告 | 结构化 execution event/result、Allure result，以及 Playwright HTML 等 runner 原生报告 | 保存已脱敏结果，把失败、artifact 和报告关联回规范与 TestCase | Allure 与 Playwright 报告发现已实现；统一 event/result 契约仍属于路线图 |
| 变更控制 | Git commit、branch、review 和 CI | 让规范、生成资产、代码和校验历史作为同一个变更被审查 | 由宿主产品仓库提供 |

OAS 描述单个 API 契约，Arazzo 描述多个 API operation 如何组成 workflow，Markdown TestCase 表达人可以复核的测试意图，runner-native 代码负责实际自动化执行。这些资产相互补充，而不是相互替代。

## 技术栈与选择理由

| 层次 | 参考实现中的选择 | 选择理由 |
| --- | --- | --- |
| Workspace | pnpm workspace / monorepo | 便于把 QA workspace 嵌入产品 package 旁边，让 AI 与 CI 使用同一份依赖图和命令入口 |
| Runtime 与 CLI | 使用 ECMAScript module 的 Node.js | 可在开发机和 CI 间移植，适合仓库工具，也容易非交互调用 |
| 仓库契约 | YAML 与 Markdown | 人可读、AI 可读、可 diff、可审查，并且不依赖应用数据库 |
| 发现与归一化 | 小型 Node.js module、`fast-glob` 和 YAML parser | 保持 catalog 构建确定性，同时不引入数据库依赖 |
| 本机服务 | Express | 为 catalog、配置状态、文件和报告提供轻量 loopback API，不把 Workbench 变成部署平台 |
| 观察 UI | React、Vite、Tailwind CSS 和 Radix UI primitive | 构建模块化本机界面，同时让编排状态继续留在仓库契约和 CLI 工具中 |
| API 与源码查看 | Scalar API Reference 和 Monaco Editor | 复用成熟 OAS 与源码查看器，不重新实现 editor 和 renderer |
| 报告 | Allure，以及 Playwright HTML 等 runner 原生报告 | 保留成熟报告生态和 runner 的详细诊断能力 |
| 验证 | Node.js test runner 与完全 synthetic 的 fixture | 让默认校验快速、离线、可复现，并且不需要私有环境或凭据 |

Specato 有意不绑定单一 API runner 或 AI 供应商。只要 runner 提供非交互 CLI、显式配置、确定的退出状态，以及可由安全 adapter 归一化的机器可读结果，就适合接入。UI 自动化推荐以 Playwright 为基础；API 执行可以由项目选择支持 OAS/Arazzo 的 CLI 工具。

## 当前能力

- 通过 `qa/project.yaml` 以 manifest 驱动 OpenAPI、Arazzo 和 TestCase 发现。
- TestCase ID 不依赖固定 capability 或目录命名规则。
- 支持任意命名 server、环境继承和 secret reference，且不返回 secret value。
- 默认仅监听 loopback 的本机 Workbench，以及受 manifest 白名单约束的仓库文件读取。
- 报告索引受固定输出根目录、路径规范化和 realpath 边界保护。
- 支持 API/UI 的 Allure 2 结果索引和 Playwright HTML 报告发现。
- 完全合成的规范、TestCase 和离线单元测试。

AI 生成自动化、共享 runner adapter 调用、端到端执行编排、远程认证、package 发布和真实项目接入仍属于路线图工作，不是当前预览版已经交付的能力。

## 安全与公开边界

公共核心不得依赖任何单一产品仓库、域名、鉴权角色、请求头、数据库、测试账号或非公开基础设施约定。项目差异必须放在项目 manifest、provider 或 runner adapter 中。

本仓库只接受可复现的源码、公开文档和 synthetic 示例。禁止提交：

- SQL dump、真实、可还原或脱敏不充分的业务数据；
- 真实项目的 OpenAPI、Arazzo、TestCase、验收或缺陷资料；
- 截图基线、trace、HAR、浏览器状态或真实品牌素材；
- 凭据、token、Cookie、环境身份、内部地址或个人路径；
- 生成报告、运行产物、vendored dependency 或构建产物。

可执行示例必须使用虚构命名、合成数据以及 loopback 或 mock 服务。完整规则见[公开内容边界](docs/publication-boundary.zh-CN.md)。

## 仓库结构

```text
specato/
├─ qa/                    # 项目 manifest、核心模块和 Workbench
├─ examples/              # 合成 OAS、Arazzo 和 TestCase fixture
├─ docs/                  # 架构、安全和项目治理文档
└─ scripts/               # 仓库级验证工具
```

当前 workspace 有意保留在 `qa/`。仓库必须能在没有相邻仓库、个人工作区或非公开基础设施时独立安装。

## 快速开始

### 前置条件

- Node.js `>=20.19`
- Corepack
- `packageManager` 固定的 pnpm `10.34.5`

### 安装与运行

```powershell
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

开发命令会启动本机 Workbench UI，用于观察 catalog、配置、源码引用和报告。请保持 loopback 监听；非 loopback 绑定是需要显式启用的高风险能力，在认证和授权实现前不属于受支持的部署建议。

### 验证 checkout

```powershell
pnpm run verify
pnpm audit --prod --audit-level moderate
pnpm run audit:repository
```

默认验证不得依赖 Docker、数据库、真实凭据、私密环境或相邻仓库。

## 文档

英文是默认文档语言。每份持续维护的项目文档都有简体中文对应版本，并在顶部提供语言切换。

| 文档 | 用途 |
| --- | --- |
| [文档索引](docs/README.zh-CN.md) | 导航和语言约定 |
| [AI-native SDD 运行模型](docs/ai-native-sdd.zh-CN.md) | 人与 AI 的角色，以及从规范到自动化的流程 |
| [架构说明](docs/architecture.zh-CN.md) | 组件、契约、数据流和扩展规则 |
| [公开内容边界](docs/publication-boundary.zh-CN.md) | 允许内容、禁止资产和发布检查 |
| [开源准备度](docs/open-source-readiness.zh-CN.md) | 当前成熟度和剩余发布缺口 |
| [开源路线图](docs/open-source-roadmap.zh-CN.md) | 阶段、门禁和退出条件 |
| [参与贡献](CONTRIBUTING.zh-CN.md) | 开发流程和贡献要求 |
| [安全策略](SECURITY.zh-CN.md) | 漏洞报告和安全边界 |
| [第三方源码声明](THIRD_PARTY_NOTICES.zh-CN.md) | 随仓库分发的第三方源码 |

## 参与贡献

Specato 倾向于能加强可复用契约的小步、可审查变更。贡献前请阅读[架构说明](docs/architecture.zh-CN.md)、[公开内容边界](docs/publication-boundary.zh-CN.md)和[贡献指南](CONTRIBUTING.zh-CN.md)。

安全问题不得在公开 issue 中披露，请遵循 [SECURITY.zh-CN.md](SECURITY.zh-CN.md)。

## 许可证与分发

Specato 自有源码采用 [Apache License 2.0](LICENSE)。第三方组件继续适用其锁定版本的许可证和版权；复制或生成到仓库中的第三方源码记录在 [THIRD_PARTY_NOTICES.zh-CN.md](THIRD_PARTY_NOTICES.zh-CN.md)。

项目当前只分发源码，不发布 `node_modules`、第三方二进制、容器、离线依赖包或 npm package。根 package 保持 `private: true`，避免误发布。若分发形态改变，必须以实际交付产物重新计算 notices 和许可证义务。
