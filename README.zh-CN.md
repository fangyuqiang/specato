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
