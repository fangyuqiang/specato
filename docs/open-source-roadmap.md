# 开源路线图

## 目标与发布原则

QA Workbench 的开源目标是交付一个可独立安装、以规范为事实来源、默认本机安全运行的 API/UI 自动化工作台。

发布遵循以下原则：

- 先稳定通用契约，再接入具体 runner；项目专用能力留在项目侧 adapter。
- 先公开源代码，再评估 npm package；公开仓库不等于稳定 API。
- 默认只监听 loopback；远程模式在认证、授权、CSRF 和审计完成前不进入推荐路径。
- 默认示例、测试和 CI 只能使用 synthetic fixture，不连接真实业务环境。
- 所有证据必须先脱敏再写盘；无法确认脱敏成功时 fail-closed。
- 文档严格区分“已交付、发布阻断、路线图”，不把规划写成现有能力。

## 当前基线

当前定位是 `0.1` 早期预览候选，已交付：

- 独立 workspace、冻结依赖安装、单元测试和生产构建；
- manifest 驱动的 OAS、Arazzo 和 TestCase catalog；
- TestCase source 显式声明 `files`、`module` 和 `capability`，不依赖固定目录；
- 环境继承、任意命名 server 和 secret reference；
- loopback Workbench、受 allowlist 和 realpath 保护的仓库文件读取；
- 受固定报告根目录和 realpath 保护的 API/UI Allure 2 JSON 与 Playwright HTML 报告查看；
- TestCase 与 Allure `caseRef` 的识别和摘要；
- synthetic demo、依赖审计、许可证 denylist、专有标识/大文件扫描和 secret 扫描门禁。
- Apache-2.0 源码许可证和“使用者自行安装依赖”的分发边界；
- 随源码分发的 shadcn/ui 生成组件 MIT 声明；
- CodeGraph 仓库索引初始化，本机数据库不进入 Git。

当前尚未交付：

- `ExecutionPlan`、`RunnerAdapter` 和统一事件协议；
- 可执行的 API runner、Arazzo workflow runner 和 Playwright runner；
- 证据脱敏与保留策略的完整实现；
- 远程认证、授权、CSRF 防护和审计；
- 公开仓库、发布包和兼容性承诺。

## 发布门禁

每个公开候选都必须同时满足以下门禁：

| 门禁 | 必须证明的结果 |
| --- | --- |
| G0 内容边界 | 无真实规范、TestCase、账号、环境身份、内部域名、业务素材和生成证据 |
| G1 可复现 | 从公开候选 commit 全新 clone 后可冻结安装、测试、构建和启动 synthetic demo |
| G2 安全 | 当前树及完整历史 secret scan 无未处理项；路径、runner、脱敏和远程边界有失败路径测试 |
| G3 功能 | API/UI runner 均通过 synthetic 端到端流程，执行结果可追溯到规范和 TestCase |
| G4 许可证 | Apache-2.0 已落盘；依赖按锁定版本审计，仓库内第三方源码有对应声明 |
| G5 治理 | 版本策略、贡献规则、安全报告、维护责任和兼容矩阵可执行 |

任一门禁不满足时，不发布新的源码版本、package 或稳定版本。

## 阶段路线

### 阶段 0：源码预览基线

目标：保证仓库本身可独立、可审查、可重复验证。

范围：

- 固化 `ProjectManifest`、catalog、environment、TestCase 和 report 的当前数据模型；TestCase ID 独立于 capability，report 不保留来源框架的历史兼容层；
- 修复 clean checkout、路径边界、专有标识和报告追溯问题；
- 把 repository audit、依赖审计、许可证检查、当前树及历史 secret scan 放入 CI；
- 为桌面和移动端 Workbench 保留最小 UI smoke test。

退出条件：G0、G1、G2 中不依赖 runner 的部分全部通过。完成阶段 0 不代表已具备自动化执行能力。

### 阶段 1：自动化内核 MVP

目标：形成可由 CLI、Workbench 和 CI 共同调用的最小执行内核。

范围：

- 定义版本化的 `ExecutionPlan`、`RunnerCapability`、`ExecutionEvent` 和 `ExecutionResult` schema；
- 定义 `RunnerAdapter` 的能力声明、输入校验、preflight、取消、超时和结构化输出；
- 实现只访问 synthetic loopback 服务的 API runner；
- 实现只访问 synthetic 本机页面的 Playwright runner；
- 建立 redaction pipeline，覆盖 Authorization、Cookie、token、密码、签名、URL query 和可配置字段；
- 提供 `list`、`plan`、`run`、`report` 四类最小 CLI 行为。

退出条件：G3 的 synthetic API/UI 端到端流程通过；任何缺失 secret、越界路径、未注册 runner 或脱敏失败都在执行前或写盘前失败。

### 阶段 2：项目侧 adapter 验证

目标：证明通用核心能够服务独立项目，同时不把真实资产回灌到公共候选。

范围：

- 在接入项目或独立仓库维护 adapter；
- 建立 core/adapter 兼容矩阵和最小升级策略；
- 验证 Windows 与 Linux、最低支持 Node.js 与当前 LTS；
- 记录无法泛化的业务需求，只有出现第二个通用使用场景时才考虑提升为核心契约；
- 完成 runner 进程、报告 HTML、symlink、恶意规范和大体积输入的威胁建模。

退出条件：至少一个 API adapter 和一个 UI adapter 完成独立验证，但公共仓库仍只保留 synthetic fixture。

### 阶段 3：公开候选

目标：从候选 commit 完成一次等同公开发布的隔离演练。

范围：

- 确认 Apache-2.0 文件和源码分发说明完整；
- 复核锁定依赖许可证和仓库内第三方源码声明；开始捆绑二进制依赖时生成完整 notices 与 SBOM；
- 清理完整 Git 历史，确认没有 secret、业务资产和不可发布代码；
- 从公开候选 commit 在隔离目录执行 fresh clone 门禁；
- 增加威胁模型、兼容矩阵、迁移说明、行为准则、问题与变更提报模板和维护者规则；
- 明确采用 DCO 或 CLA，不在发布后临时改变贡献权属规则；
- 为 Scalar 等 0.x 依赖建立锁定版本、升级验证和 bundle budget。

退出条件：G0-G5 全部通过，并形成不可变 release candidate。

### 阶段 4：公开预览版

目标：公开源码并验证外部安装、文档和贡献流程，不承诺稳定 API。

范围：

- 发布带明确 prerelease 标识的源码版本；
- 使用语义化版本和自动生成的变更日志；
- 对外说明本机模式是唯一受支持部署方式；
- 收集外部项目 manifest 和 adapter 反馈，但禁止提交真实测试资产；
- npm 发布保持独立决策，只有 package 边界和升级路径稳定后才启用。

退出条件：至少完成一个外部 synthetic 接入周期，没有高危未处理漏洞，破坏性变更均有迁移说明。

### 阶段 5：1.0 稳定版

目标：对核心契约、升级路径和安全响应作出稳定承诺。

范围：

- 冻结核心 schema 的兼容规则和弃用周期；
- 发布受支持的 runner/adapter 兼容矩阵；
- 明确安全修复窗口、维护分支和终止支持策略；
- 只有在远程认证与权限模型完成独立安全评审后，才评估远程 Workbench。

退出条件：核心契约、升级工具、维护责任和安全响应均有实际演练记录。

## 自动化验证与供应链设计

无论使用何种本机脚本或托管平台，公开候选的自动化验证至少包含：

1. 冻结安装、单元测试、UI smoke test 和生产构建；
2. repository audit：来源标识、禁止文件类型、大文件和生成资产；
3. Gitleaks 当前树扫描与完整 Git 历史扫描；
4. 生产依赖漏洞审计、全依赖许可证策略和仓库内第三方源码 notices；
5. Windows/Linux 兼容矩阵以及最低 Node.js/当前 LTS 组合；
6. 从候选 commit 创建隔离 clone 后再次安装、测试和构建；
7. bundle budget、依赖锁文件变更和 0.x 关键依赖升级门禁；
8. 发布时生成校验和、SBOM 和可追溯 release metadata。

外部贡献者流水线不得注入组织 secret，也不得连接真实测试环境。

## 版本与仓库策略

- 阶段 0-3 保持单仓库和当前 `qa/` workspace，不为未来 package 提前拆分目录。
- schema 从首次公开预览起携带明确版本；未知 schema 默认拒绝，不静默降级。
- 公共 core 不认识项目专用 header、角色、账号或业务模块；这些内容只能存在于项目侧 adapter。
- 首次公开优先发布源码，不同时承诺远程部署、npm package 和 1.0 稳定性。
- 破坏性变更必须包含迁移说明；安全修复可以缩短弃用周期，但必须记录原因。

## 下一批实施顺序

1. 完成阶段 0 的 fresh-clone CI 门禁和最小浏览器 smoke test；
2. 为 `ExecutionPlan`、`ExecutionEvent` 和 redaction schema 编写 synthetic contract tests；
3. 实现 API runner，再实现 Playwright runner，避免两个 runner 同时定义平行契约；
4. 在项目侧 adapter 中验证，收集核心契约缺口；
5. 进入法务、供应链和公开候选演练。

路线图是退出门槛，不是日期承诺。阶段只有在对应证据落盘并通过审查后才更新为已完成。
