<div align="right">
  <a href="publication-boundary.md">English</a> | <strong>简体中文</strong>
</div>

# 公开内容边界

## 目的

本文定义哪些内容可以进入公共 QA Workbench 仓库、哪些内容被禁止，以及哪些检查会阻断发布。公共仓库只包含可复用实现、synthetic 示例和公开开发文档；无法证明可公开性的内容必须留在仓库之外。

AI 生成内容不会自动变得安全或原创。AI coding assistant 生成的 TestCase、自动化代码、fixture、文档和 adapter，必须满足与人编写内容相同的来源、保密、许可证和审查要求。

## 允许内容

- TestCase、OpenAPI、Arazzo 等规范的通用发现和解析。
- 面向 AI 的生成、校验、执行计划、证据和报告契约。
- 测试选择、结构化事件、状态管理和安全 adapter 接口。
- 通用本机 Workbench UI 和服务端实现。
- 公共 provider、runner adapter 和 report 契约。
- 与真实产品无关的单元测试和开发配置。
- 从零编写的 synthetic fixture、示例规范和演示页面。
- 明确区分已交付、设计和路线图意图的文档。

## 禁止内容

### 数据与测试资产

- SQL dump、数据库快照、SQLite 或其他本地数据库。
- 真实或可还原的用户、请求、响应、日志或业务数据。
- 真实项目的 OpenAPI、Arazzo、TestCase、验收规则或缺陷复现资料。
- 截图基线、视觉 diff、trace、HAR、录屏、DOM 快照或浏览器 storage state。
- 无法证明公开来源和不可还原性的“脱敏”数据或资产。

### 身份与基础设施

- Token、Cookie、密码、签名密钥、私钥或测试账号。
- 真实邮件地址、角色映射、环境身份或个人工作区路径。
- 私有域名、IP、代理、数据库 DSN、集群、日志库或 CI runner 标识。
- 产品专用请求头、内部路由、部署脚本或安全例外。

### 历史与第三方内容

- 私有 issue、代码审查、决策或人员信息。
- 未确认许可证和上游来源的第三方源码、字体、图标、图片或生成资产。
- `node_modules`、第三方二进制、bundle、容器、构建产物或离线依赖。
- 仅给真实资产改名但仍保留可识别业务逻辑的 fixture。
- 复现私有上下文、受版权保护源码或无法验证来源的 AI 生成内容。

## 通用化规则

| 项目侧概念 | 公共仓库中的表达 |
| --- | --- |
| 固定模块和规范路径 | `ProjectManifest` 配置 |
| 环境和身份 | `EnvironmentProvider` 加 secret reference |
| 产品专用鉴权 | 项目侧 runner adapter |
| 固定测试命令 | `RunnerAdapter` capability 声明 |
| 产品报告字段 | 通用结构化执行事件 |
| 真实规范或 TestCase | 根据明确公开意图从零编写的 synthetic 资产 |
| AI 工具专用 prompt 或状态 | 仓库中立的指令、schema 或 adapter |

公共核心只保留至少能被两个独立场景复用的语义。私有 adapter 可以位于项目仓库或本机忽略路径，但公共核心不能依赖它们。

## Synthetic 示例要求

- 使用虚构项目、模块、域名、身份和数据。
- 只访问 loopback、保留示例域名或 mock。
- 数据量保持最小，同时覆盖成功和失败路径。
- 不保留真实 ID、字段组合、响应内容、截图或可识别 workflow 结构。
- 在没有私密环境变量、相邻仓库或组织服务时可以验证。
- AI 生成示例提交前必须对照原始规范和本公开边界复核。

## 源码分发边界

项目当前只分发源码，并通过 `package.json` 和 `pnpm-lock.yaml` 声明 npm 依赖。使用者自行安装依赖，每个锁定组件继续适用其自身许可证。

不得提交 `node_modules`、bundle、容器或离线依赖包。复制或生成到仓库的第三方源码必须保留所需许可证和版权文本，并在 `THIRD_PARTY_NOTICES.md` 中记录范围、上游来源和准确 revision。历史快照缺少 revision 时应标记为 `unknown`，不得伪造来源。

若分发形态改变，必须以实际交付产物执行许可证分析，并按需附带全部许可证、版权、notice 和 SBOM。

## 发布检查

1. 检查新增文件类型、大小、生成产物和 Git 跟踪状态。
2. 扫描私有标识、内部域名、私有 IP、个人路径和环境身份。
3. 对候选树和可发布 Git 历史执行 secret 扫描。
4. 确认路径保持在仓库内，默认流程不需要相邻仓库。
5. 审计锁定依赖的漏洞和许可证，以及 vendored source notice。
6. 在隔离 checkout 中执行冻结安装、测试和生产构建。
7. 复核 AI 生成资产是否忠于规范、来源明确且未意外复现私有上下文。
8. 确认每份持续维护文档都有同步的英文和简体中文版本。

任何检查存在未解决项时不得发布。
