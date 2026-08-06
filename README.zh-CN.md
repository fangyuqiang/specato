<div align="right">
  <a href="README.md">English</a> | <strong>简体中文</strong>
</div>

# Specato

> **AI 原生、Git 驱动、从规范到测试自动化。**

Specato 是一个 **AI-native、Git-based、SDD-driven 的 API/UI 自动化测试工作空间**。人负责在 Git 中定义和审批规范、边界与验收意图；Codex、Claude Code 等具备仓库操作能力的 AI coding assistant 根据规范生成 TestCase、API/UI 自动化、runner 集成、execution plan 和可追溯报告。

Specato 是这条流程面向 AI 的工作空间和契约系统。它的可视化 Workbench UI 是面向人的观察与复核窗口，不是让人手工编排测试的主要入口。项目集成 OpenAPI、Arazzo、Playwright、Allure 等成熟工具，而不是替代它们。

名称由 **SPEC**ification 与 **A**utomation、**T**esting、**O**rchestration 组合而成。规范始终是事实来源，AI 围绕成熟工具生成可执行资产。

> **当前状态：** `0.1` 早期源码预览。仓库已按 Apache-2.0 公开，但尚未承诺稳定 API、远程部署、package 分发或可执行 runner adapter。

## 运行模型

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

AI client 可以替换，持久接口是 Git 仓库。Specato 不是单一内置 Agent，也不是新测试框架。详见 [AI-native SDD 运行模型](docs/ai-native-sdd.zh-CN.md)。

## 为什么需要 Specato

- 用 Git 管理规范、TestCase 和审查历史。
- 将模块、API operation、workflow 和 scenario 归一化为统一的可搜索目录。
- 通过 manifest、provider 和 runner adapter 隔离项目特有行为。
- 让执行证据和报告可追溯到来源规范与 TestCase。
- 为 AI coding assistant 提供稳定的生成和执行工作空间，同时让人统一查看规范、计划、证据和报告。

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
