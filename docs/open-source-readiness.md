# 开源准备度

## 当前判断

QA Workbench 采用“通用核心 + 项目清单 + 项目侧 adapter”的产品边界，并按 Apache-2.0 发布源码。当前定位是 `0.1` 早期预览候选：可以进入公开源码发布准备，但尚未承诺稳定 API、远程部署或 npm package。

## 已完成

- 通用 catalog、TestCase、environment 与 Workbench 不依赖固定业务目录；TestCase ID 不再绑定 capability 前缀。
- 默认仓库只包含 synthetic OAS、Arazzo 和 TestCase。
- 文件接口具备 manifest 白名单、路径规范化、realpath 和 symlink 逃逸保护。
- 报告目录使用固定根目录，并具备 realpath 和 symlink 逃逸保护；报告索引只保留 API/UI 的 Allure 2 JSON 与 Playwright HTML。
- server URL 禁止携带 userinfo、query 和 fragment；环境摘要不返回 secret value。
- Workbench 默认只允许 loopback；非 loopback 绑定需要显式 opt-in。
- 默认验证不依赖 Docker、数据库、真实环境或私密凭据。
- 已加入 Apache-2.0；根 package 保持 `private: true`，明确只发布源码。
- 已为随源码分发的 shadcn/ui 生成组件保留 MIT 声明；初始快照未记录上游 revision，已如实标记 unknown，后续同步必须补充准确来源。
- 当前生产依赖只包含宽松许可证或可选择宽松分支的许可证，没有 GPL、LGPL、AGPL 或 SSPL。
- CodeGraph 已初始化，本机索引数据库不会进入 Git。

## 首次公开前仍需完成

1. 当前工作树候选已移除已知专有标识；现有 Git 历史仍含来源项目、非公开设施和个人提交身份，不能直接推送到公开仓库，首次发布必须从验收后的当前树创建干净根提交。
2. 从候选 commit 建立独立 clone，执行冻结安装、测试、构建和启动验证。
3. 在干净根提交形成后重新执行 Gitleaks 当前树与完整历史扫描。
4. 固定与托管平台无关的安全报告和贡献渠道。
5. 对 Scalar 等 `0.x` 关键依赖建立升级验证和 bundle budget。

源码发布不携带 `node_modules`、bundle、容器或第三方二进制，因此 npm 依赖 notices 不是当前发布阻断项；仓库内 shadcn/ui 生成源码的 MIT 声明已单独保留。若以后改变发布形态，应按最终产物重新生成第三方许可证清单和 SBOM。

分阶段交付范围、发布门禁和退出条件见 [开源路线图](open-source-roadmap.md)。公开内容规则见 [公开内容边界](publication-boundary.md)。

## 后续演进

### Runner adapter

先定义最小 `RunnerAdapter` 契约，再分别接入 API、Playwright 和命令型 runner。runner 只接收结构化 execution plan；鉴权、请求头和登录流程属于项目侧 adapter。

### 项目接入

通过项目清单或独立 adapter 验证通用核心。真实 OAS、Arazzo、TestCase、环境身份和报告不能回灌到公共仓库。

### 公开预览

完成内容、安全和 fresh-clone 门禁后发布预览源码。公开仓库不等于稳定 API，也不自动承诺远程部署和 package 分发。

### 版本治理

公开后采用语义化版本、兼容矩阵和安全响应流程；只有经过实际接入和迁移演练后再进入 `1.0`。
