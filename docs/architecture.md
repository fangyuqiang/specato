# 架构说明

## 定位

QA Workbench 是 Git-native、spec-to-test 的质量工程基础设施。规范、测试定义和配置骨架保存在 Git 中；运行时 secret、被测环境和证据产物保留在仓库之外或忽略目录中。

项目采用独立仓库、独立依赖和独立验证链路，不以任何业务系统作为默认领域模型或运行时前提。

## 目标与非目标

### 目标

- 从仓库规范发现模块、接口、流程和 TestCase，并生成统一目录。
- 用显式契约隔离项目配置、环境来源、测试框架和报告格式。
- 让本机工作台、CLI 和 CI 复用相同的发现与执行能力。
- 为每次执行生成可追溯且已脱敏的结构化证据。
- 通过完全合成的 demo 证明仓库不依赖任何接入项目运行。

### 非目标

- 不内置某个产品平台、后端框架或组织流程的业务规则。
- 不作为 secret manager、生产调度平台或公网多租户服务。
- 不承诺无配置地兼容所有测试框架。
- 不负责迁移、修改或管理接入方原有的 QA 资产。

## 分层模型

```text
Git specifications and project manifest
                  │
                  ▼
     CatalogProvider / EnvironmentProvider
                  │
                  ▼
       Core orchestration and validation
                  │
                  ▼
              RunnerAdapter
                  │
                  ▼
       Evidence store / ReportDefinition
                  │
                  ▼
         Workbench UI, CLI and CI
```

各层职责如下：

1. **规范与项目清单**：声明模块、规范位置、可用 runner、环境变量引用和报告策略。
2. **Provider 层**：读取不同来源并归一化为核心模型，不执行测试。
3. **核心编排层**：校验输入、选择测试、建立 execution plan、调用 runner，并管理状态。
4. **Runner adapter 层**：把通用 execution plan 翻译为具体框架调用。
5. **证据与报告层**：接收结构化结果，执行脱敏、聚合和持久化。
6. **入口层**：Workbench UI、CLI 和 CI 只通过核心服务操作，不直接读取业务目录。

## 核心契约

### `ProjectManifest`

描述项目 ID、规范来源、provider / runner 注册、允许的 workspace 和默认报告。TestCase source 显式声明 `files`、`module` 与 `capability`，不能从固定目录结构反推业务范围。它不得包含 secret value，也不得假设任何接入方的业务目录。

### `CatalogProvider`

把 TestCase、OpenAPI、Arazzo 或其他规范来源归一化为可查询的测试条目。provider 负责来源解析和诊断，核心层负责选择与编排。

### `EnvironmentProvider`

解析环境名称、base URL 和 secret reference，并返回已校验的运行配置。UI 可读取配置状态，但不能读取敏感值。

### `RunnerAdapter`

声明 runner 能力、输入 schema、执行前检查和结构化输出。adapter 不应通过 shell 字符串拼接参数，也不应把特定项目请求头或鉴权角色提升为核心概念。

### `ReportDefinition`

定义结果如何聚合、脱敏和呈现。报告消费结构化事件，不反向依赖具体 runner 的私有日志格式。

当前预览实现只接受 API/UI 两层的 Allure 2 JSON 结果和 Playwright HTML 报告；旧版 XML、Unit 报告层及其他历史格式不属于兼容契约。

## 数据流与失败策略

1. 加载并校验 `ProjectManifest`。
2. provider 发现规范，输出统一 catalog 及诊断信息。
3. 用户或 CI 选择测试，核心层建立 execution plan。
4. `EnvironmentProvider` 解析所需引用；缺失配置时在网络调用前失败。
5. `RunnerAdapter` 执行计划并持续输出结构化事件。
6. 证据层先脱敏再写盘，报告层生成摘要和可追溯链接。

默认采用 fail-closed：来源越界、schema 无效、runner 未注册、必要环境缺失或脱敏失败时，不继续执行。

## 仓库与部署决策

- 保留 `qa/` workspace 结构；只有在形成稳定发布单元时才拆分 package。
- 所有默认示例均为合成项目，禁止连接真实业务环境。
- Workbench 首阶段是本机工具，只监听 loopback。
- 仓库文件读取使用 manifest allowlist；动态报告使用固定报告根目录。两者都必须执行路径规范化和 realpath 边界检查。
- 真实项目接入应由项目清单或项目侧 adapter 完成，不能把非公开资产放入公共核心。

## 扩展规则

新增领域或框架时，优先回答以下问题：

1. 差异能否由项目清单表达？
2. 若不能，属于 catalog、environment、runner 还是 report 契约？
3. 新契约能否由完全合成的 fixture 验证？
4. 是否会让核心层认识业务专有名词或 secret？

只有通用语义进入核心。接入方专用、包含非公开协议或真实资产的实现，应留在项目侧 adapter 中。

## 演进方向

在独立安装、测试、构建和安全审计稳定后，再评估：

- 将核心契约发布为独立 package；
- 增加受支持的 OpenAPI / Arazzo / Playwright 等 adapter；
- 为项目侧 adapter 提供版本兼容矩阵；
- 在认证和权限模型成熟后提供远程工作台模式。

这些方向不是当前预览版的完成条件。
