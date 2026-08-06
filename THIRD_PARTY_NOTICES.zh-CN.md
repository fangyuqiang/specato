<div align="right">
  <a href="THIRD_PARTY_NOTICES.md">English</a> | <strong>简体中文</strong>
</div>

# 第三方源码声明

本文件记录随 QA Workbench 源码仓库分发的第三方源码。使用者通过 `pnpm install` 下载的 npm 依赖不会复制到本源码仓库中，并继续适用其锁定版本附带的许可证。

## shadcn/ui

- **上游：** <https://github.com/shadcn-ui/ui>
- **许可证：** MIT
- **范围：** `qa/workbench/components.json`、`qa/workbench/src/components/ui/`、`qa/workbench/src/lib/utils.js` 以及相关 UI 样式中生成或改写的部分
- **来源：** 初始源码快照没有记录上游版本或 commit，因此标记为 `unknown`；以后每次同步都必须在变更说明中记录准确的上游 revision

以下上游许可证原文适用于上述范围。为避免法律歧义，许可证正文保留官方英文，不提供改写后的翻译版本。

MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
