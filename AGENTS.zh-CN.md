<div align="right">
  <a href="AGENTS.md">English</a> | <strong>简体中文</strong>
</div>

# AI Coding Assistant 指令

本仓库是独立、通用的 Specato 项目，不依赖来源业务仓库、相邻 checkout 或非公开基础设施。

## 产品模型

- Specato 是 AI-native、Git-based、SDD-driven 的 API/UI 自动化测试工作空间。
- 人定义并审批规范、验收意图、策略和风险边界。
- Codex、Claude Code 等可替换的 AI coding assistant 根据规范生成和维护 TestCase、API/UI 自动化、runner adapter、execution plan 与报告集成。
- 仓库契约是持久接口。不得把某个 prompt、单一模型、隐藏 Agent 状态或可视化 UI 作为事实来源。
- 可视化 Workbench UI 用于人的观察与复核，不是主要的手工编排界面。
- 集成 OpenAPI、Arazzo、Playwright、Allure 等成熟标准和工具。没有明确集成缺口时，不重新实现它们的核心能力。

## 工作边界

- 默认做满足需求的最小、安全、可验证修改。
- 不引入真实业务资产来替代 synthetic fixture。
- 禁止提交 SQL、真实 OAS/Arazzo/TestCase、截图基线、trace、HAR、报告、账号、token、Cookie、非公开域名、个人路径或环境身份。
- AI 生成内容与人编写内容适用相同要求：提交前验证规范一致性、保密性、来源、许可证和公开适用性。
- 复制或生成到仓库内的第三方源码必须保留许可证，并在 `THIRD_PARTY_NOTICES.md` 记录范围和上游来源。新同步必须记录准确 revision；历史快照来源不明时标记 `unknown`，不得猜测。
- `qa/config/environments.yaml` 仅供本机使用，不得跟踪；secret value 只从环境变量读取。
- Workbench 文件读取必须经过 manifest allowlist、路径规范化和 realpath 边界检查。
- 非 loopback 绑定属于高风险能力，必须显式启用，并且在实现认证和授权前不得推荐。

## 文档

- 英文是持续维护项目文档的默认语言。
- 每份持续维护的 `*.md` 文档都必须有同步的 `*.zh-CN.md` 镜像，并在两份文件顶部提供语言切换。
- `README.md` 是默认入口，并链接到 `README.zh-CN.md`。
- 法律许可证正文保留官方语言；说明性文档可以双语。
- `examples/` 下的可执行 Markdown fixture 是测试输入，不要求翻译副本。
- 必须明确区分已交付、进行中和路线图意图。

## 验证

提交前至少执行：

```powershell
pnpm install --frozen-lockfile
pnpm run verify
pnpm audit --prod --audit-level moderate
pnpm run audit:repository
```

还必须执行私有残留、secret、依赖许可证、Git 历史、文档链接、双语覆盖和大文件扫描。检查被跳过或阻塞时必须明确报告，不能声称通过。
