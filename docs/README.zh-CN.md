<div align="right">
  <a href="README.md">English</a> | <strong>简体中文</strong>
</div>

# QA Workbench 文档

本目录将 QA Workbench 定义为一个 **AI-native、Git-based、SDD-driven 的 API/UI 自动化测试解决方案**。

英文是默认语言。每份持续维护的文档都有一个命名为 `*.zh-CN.md` 的简体中文镜像；每次变更必须同步更新两份文件。

## 从这里开始

| 文档 | 回答的问题 |
| --- | --- |
| [AI-native SDD 运行模型](ai-native-sdd.zh-CN.md) | 谁驱动流程、Git 与 SDD 如何配合，以及为什么可视化 Workbench UI 是人的观察面而不是流程驱动者 |
| [架构说明](architecture.zh-CN.md) | 规范、AI client、核心契约、既有 runner、证据和 UI 如何协作 |
| [公开内容边界](publication-boundary.zh-CN.md) | 哪些内容可以进入公共仓库，哪些必须留在项目侧或本机 |
| [开源准备度](open-source-readiness.zh-CN.md) | 当前已经公开和验证的内容，以及尚未完成的事项 |
| [开源路线图](open-source-roadmap.zh-CN.md) | 交付阶段、门禁和退出条件 |

## 项目级文档

| 文档 | 用途 |
| --- | --- |
| [README](../README.zh-CN.md) | 产品概览和快速开始 |
| [参与贡献](../CONTRIBUTING.zh-CN.md) | 开发与文档工作流 |
| [安全策略](../SECURITY.zh-CN.md) | 漏洞报告和运行边界 |
| [第三方源码声明](../THIRD_PARTY_NOTICES.zh-CN.md) | 随仓库分发的第三方源码 |
| [AI Agent 指令](../AGENTS.zh-CN.md) | coding assistant 必须遵守的仓库约束 |

`examples/` 下的可执行 Markdown 文件是 synthetic TestCase fixture，属于机器读取的测试输入，不是需要翻译的项目文档。
