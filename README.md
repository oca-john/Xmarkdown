# Xmarkdown

![Version](https://img.shields.io/badge/version-0.9.8-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey)

一款高性能、跨平台的 Markdown 编辑器，基于 Tauri 2.0 + React + TypeScript 构建。

## 功能特性

- **实时预览**: 左侧编辑，右侧实时渲染
- **语法高亮**: 编辑器内 Markdown 语法高亮
- **同步滚动**: 编辑区与预览区同步滚动
- **GFM 支持**: 表格、任务列表、自动链接
- **数学公式**: LaTeX/KaTeX 支持
- **代码高亮**: 预览区代码语法高亮
- **文件操作**: 新建、打开、保存、另存为
- **快捷键**: 常用快捷键支持

## 技术栈

- **Core**: Rust + Tauri 2.0
- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Editor**: CodeMirror 6
- **Markdown**: react-markdown + remark-gfm + rehype

## 开发环境

### 前置要求

- Node.js 18+
- Rust (rustup)
- Tauri CLI

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri dev
```

### 构建

```bash
npm run tauri build
```

## 快捷键

| 快捷键 | 功能 |
| --- | --- |
| Ctrl+N | 新建文件 |
| Ctrl+O | 打开文件 |
| Ctrl+S | 保存文件 |
| Ctrl+Shift+S | 另存为 |

## 许可证

MIT License

## 作者

Made with ♥️ by Oca John

---

**Xmarkdown** v0.9.8 — *轻量优雅，专注书写。*
