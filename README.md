# QA Workbench

QA Workbench 是一个 Git-native、spec-to-test 的质量工程工作台。它以仓库中的规范和测试定义为事实来源，把测试目录、环境解析、执行器适配、证据归档和结果报告组织成可审查、可版本化的工作流。

> 当前状态：`0.1` 早期预览。源码按 Apache-2.0 发布，尚未承诺稳定 API、远程部署或 npm package。

## 项目目标

- 用 Git 管理测试规范、测试用例和变更历史。
- 将规范中的模块、接口、流程和场景归一化为统一测试目录。
- 通过稳定的 provider / adapter 接口接入不同项目、环境和测试框架。
- 统一保存执行证据、日志摘要和可追溯报告。
- 提供本机工作台，帮助开发、测试和 AI agent 发现、运行、复核测试。

## 核心边界

通用核心不得依赖任何单一业务仓库的目录、域名、鉴权角色、请求头、数据库或测试账号。项目差异必须通过项目清单、provider 或 runner adapter 注入。

本仓库只接受可公开、可复现的源码与合成示例，不得带入：

- SQL dump、真实或脱敏不充分的业务数据；
- 任何真实项目的 OpenAPI / Arazzo 文档和工作流；
- UI 截图基线、页面快照和真实品牌素材；
- 真实 TestCase、业务验收规则和缺陷复现资料；
- 密钥、token、Cookie、环境身份、测试账号或内部地址。

可执行示例必须使用虚构命名、合成数据和本机服务。完整规则见 [公开内容边界](docs/publication-boundary.md)。

## 当前已实现

- `qa/project.yaml`：声明项目、模块和 OpenAPI / Arazzo / TestCase 来源。
- 通用 catalog 与 TestCase 解析器；TestCase source 显式声明文件、模块和 capability，不依赖固定业务目录，TestCase ID 也不从 capability 推导。
- 支持任意命名 server、环境继承和 secret reference 的环境解析器。
- 默认仅监听 loopback 的本机 Workbench，以及受 manifest 白名单约束的只读文件接口。
- 报告文件使用固定输出根目录和 realpath 边界；当前只索引 API/UI 的 Allure 2 `*-result.json`，并通过 `caseRef` 关联 TestCase catalog。
- 完全合成的 OAS、Arazzo、TestCase 示例和离线单元测试。

Runner adapter、远程认证、package 发布与真实项目接入仍属于后续工作，不计入当前预览版的已交付能力。

## 预期结构

```text
qa-workbench/
├─ qa/                    # 项目清单、通用核心与 Workbench
├─ examples/              # 合成 OAS、Arazzo 和 TestCase 示例
└─ docs/                  # 架构、安全和维护文档
```

当前保留 `qa/` 作为 workspace 根目录。仓库不得依赖相邻目录、个人工作区或非公开基础设施。

## 本地验证

维护者应能在全新 clone 中独立执行：

```powershell
corepack enable
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm run audit:repository
```

实际脚本以根目录 `package.json` 为准。任何需要真实业务环境或私密凭据才能通过的默认测试，都属于发布阻断问题。

## 安全原则

- 工作台默认仅监听 loopback，不作为公网服务暴露。
- 配置只保存环境变量名或 secret reference，不保存 secret value。
- 日志、报告和失败证据在写盘前必须脱敏。
- 来自外部贡献者的流水线默认不注入组织密钥。
- 缺少必要配置时，在发起网络请求前明确失败。

漏洞报告与敏感信息处理方式见 [SECURITY.md](SECURITY.md)。

## 参与维护

当前仓库以小步、可验证的通用能力开发为主。新增能力前，请先阅读 [架构说明](docs/architecture.md) 和 [CONTRIBUTING.md](CONTRIBUTING.md)。

公开发布的阶段、已完成门禁和剩余阻断见 [开源准备度](docs/open-source-readiness.md)；分阶段实施与退出条件见 [开源路线图](docs/open-source-roadmap.md)。

## 许可证与分发方式

QA Workbench 自有源码采用 [Apache License 2.0](LICENSE)。第三方依赖继续适用各自版本声明的许可证和版权；随仓库分发的 shadcn/ui 生成源码见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

本仓库只发布源码，不提交 `node_modules`、第三方二进制或构建产物。使用者通过锁文件自行安装依赖；根 package 保持 `private: true`，避免被误发布到 npm。若未来开始分发 bundle、容器、离线依赖或新的第三方源码，必须按实际进入产物的组件补充许可证、版本来源与通知。
