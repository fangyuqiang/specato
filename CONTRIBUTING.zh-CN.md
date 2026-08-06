<div align="right">
  <a href="CONTRIBUTING.md">English</a> | <strong>简体中文</strong>
</div>

# 参与 QA Workbench 贡献

QA Workbench 当前是早期源码预览。贡献应保持仓库可独立安装、可验证并且不携带私有项目资产。可复用契约比快速堆叠项目专用功能更重要。

## 开始之前

1. 阅读[架构说明](docs/architecture.zh-CN.md)、[公开内容边界](docs/publication-boundary.zh-CN.md)和[安全策略](SECURITY.zh-CN.md)。
2. 确认变更不依赖相邻仓库、个人机器路径、私有运行环境或组织专用约定。
3. 修改公共契约或可观察行为前，先更新相关规范和可验证场景。
4. 不要在公开 issue 中披露漏洞，请遵循 [SECURITY.zh-CN.md](SECURITY.zh-CN.md)。

对于较大的契约变更，应在实现前发起聚焦的讨论或提案，说明使用场景、备选方案、兼容性影响和 synthetic 验证计划。

## 开发环境

前置条件：

- Node.js `>=20.19`
- Corepack
- 根目录 `packageManager` 固定的 pnpm `10.34.5`

安装和验证：

```powershell
corepack enable
pnpm install --frozen-lockfile
pnpm run verify
```

以根目录 `package.json` 中的脚本为事实来源。不得为了让验证通过而把个人路径、代理、测试身份或 secret 写入脚本。

## 设计约束

- 核心只表达可复用概念；项目特有行为放入 manifest、provider 或 adapter。
- 语义匹配时扩展现有契约，不为单一接入创建平行流程。
- 默认行为必须能由仓库自有的 synthetic fixture 验证。
- 只保存环境变量名或 secret reference，不保存 secret value。
- 错误诊断应可执行，但不得回显凭据或敏感输入。
- 每个新依赖都要说明用途、维护状态和许可证影响。
- 新复制或生成的第三方源码必须记录准确的上游 revision。

## 测试与证据

验证强度应与变更风险匹配：

| 变更 | 最低证据 |
| --- | --- |
| 纯函数或契约 | 成功和失败路径的单元测试 |
| Provider 或 adapter | Synthetic fixture 与 preflight/失败测试 |
| Workbench 交互 | 相关组件或端到端流程 |
| 报告格式或证据 | 结构和脱敏断言 |
| 路径、package 或发布规则 | 在隔离 checkout 中验证 |

Fixture 必须从零编写，或拥有可证明公开的来源。改名或部分脱敏真实资产并不足够；来源不确定时应重新构造最小 synthetic fixture。

## 文档语言约定

英文是持续维护项目文档的默认语言。修改文档时，必须在同一变更中更新其简体中文版本，并保留两份文件顶部的语言切换。

- 默认文件：`name.md`
- 简体中文镜像：`name.zh-CN.md`
- `README.md` 链接到 `README.zh-CN.md`，中文版反向链接。
- 法律许可证正文保持官方语言，不得改写为翻译版本。
- `examples/` 下的可执行 Markdown fixture 是测试输入，不属于翻译文档。

## 提交变更

每次变更保持聚焦，不混入全仓格式化、生成文件或无关重构。

变更说明应包含：

- 修改内容及原因；
- 受影响的公共契约或兼容性预期；
- 安全、数据、网络、secret 和许可证影响；
- 已执行的测试与审计，包括跳过项；
- 已同步更新的中英文文档对。

提交前执行：

```powershell
pnpm install --frozen-lockfile
pnpm run verify
pnpm audit --prod --audit-level moderate
pnpm run audit:repository
```

维护者发布源码版本前还必须执行专有残留、secret、依赖许可证、Git 历史和大文件扫描。

## 分发边界

项目当前只分发源码。不得提交 `node_modules`、bundle、容器、生成报告、运行缓存或未登记的 vendored dependency。如果变更新增实际分发的二进制、bundle、生成源码快照或离线依赖，必须以最终产物重新评估 notices 和许可证义务。
