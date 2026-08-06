# AI Agent 指令

本仓库是独立的通用 QA Workbench，不依赖任何相邻仓库或非公开基础设施。

## 工作边界

- 文档、注释和协作说明以中文为主；命令、API、字段名和规范关键字保留英文。
- 默认做最小、安全、可验证的修改，不引入真实业务资产来替代 synthetic fixture。
- 禁止提交 SQL、真实 OAS/Arazzo/TestCase、截图基线、trace、HAR、报告、账号、token、Cookie、非公开域名、个人路径或环境身份。
- 复制或生成到仓库内的第三方源码必须保留许可证，并在 `THIRD_PARTY_NOTICES.md` 记录范围与上游来源；新增或同步时必须记录 revision，历史快照缺失时应明确标记 unknown，不得猜测。
- `qa/config/environments.yaml` 仅供本机使用，不得跟踪；secret value 只从环境变量读取。
- Workbench 的文件读取必须经过 manifest 白名单、规范化路径和 realpath 边界检查。
- 非 loopback 监听属于高风险能力，必须显式启用并在实现认证后才能推荐使用。

## 验证

提交前至少执行：

```powershell
pnpm install --frozen-lockfile
pnpm run verify
pnpm audit --prod --audit-level moderate
```

并运行专有标识、secret、依赖许可证和大文件扫描。测试未执行或因环境受阻时必须明确说明，不得声称通过。
