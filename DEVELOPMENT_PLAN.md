# Xmarkdown 开发计划文档

## 1. 项目概述
**项目名称**: Xmarkdown
**目标**: 构建一个高性能、跨平台 (Windows & Linux) 的 Markdown 编辑器。
**核心技术栈**:
- **Core**: Rust + Tauri 2.0 (利用系统原生 Webview，极致轻量)
- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui (现代化 UI 组件)
- **Editor**: CodeMirror 6 (或 Monaco Editor)
- **Markdown Engine**: Unified 生态 (Remark + Rehype)

## 2. 核心功能需求
### 2.1 基础编辑功能
- [ ] **实时预览**: 左侧编辑，右侧实时渲染预览 (Split View)。
- [ ] **语法高亮**: 编辑器内支持 Markdown 语法高亮。
- [ ] **同步滚动**: 编辑区与预览区同步滚动。
- [ ] **基础 Markdown 支持**: 标题、列表、粗体/斜体、链接、图片、引用、代码块。

### 2.2 高级渲染支持
- [ ] **GFM 支持**: 表格、任务列表、自动链接 (GitHub Flavored Markdown)。
- [ ] **HTML 支持**: 允许在 Markdown 中嵌入原生 HTML 标签并正确渲染 (需处理安全策略)。
- [ ] **数学公式**: LaTeX/KaTeX 支持。
- [ ] **图表支持**: Mermaid 流程图、时序图支持。
- [ ] **代码块高亮**: 预览模式下的代码语法高亮 (PrismJS 或 Highlight.js)。

### 2.3 文件与系统集成
- [ ] **文件操作**: 新建、打开、保存、另存为。
- [ ] **自动保存**: 可配置的自动保存策略。
- [ ] **拖拽打开**: 支持文件拖拽进入窗口打开。
- [ ] **原生菜单**: 适配 Windows 和 Linux 的原生应用菜单 (File, Edit, View 等)。
- [ ] **快捷键**: 常用快捷键支持 (Ctrl+S 保存, Ctrl+B 粗体等)。

### 2.4 跨平台适配
- [ ] **Windows**: 安装包 (.msi/.exe)，窗口控制风格适配。
- [ ] **Linux**: rpm / deb / appImage 包支持，系统托盘支持 (可选)。
- [ ] **Wayland 适配**: 针对 Wayland 环境的窗口装饰、输入法 (IME) 及 HiDPI 缩放进行测试与修复。

## 3. 技术选型细节

| 模块 | 推荐选型 | 理由 |
| :--- | :--- | :--- |
| **构建工具** | Vite | 极速启动，Tauri 官方推荐 |
| **前端框架** | React | 生态最丰富，组件库选择多 |
| **编辑器内核** | CodeMirror 6 | 轻量级，扩展性强，适合 Markdown 编辑器定制 |
| **MD 解析** | remark-parse + remark-gfm | 业界标准 AST 解析 |
| **MD 渲染** | react-markdown + rehype-raw | React 绑定，rehype-raw 关键用于支持 HTML |
| **状态管理** | Zustand | 简单、轻量，无需 Redux 的样板代码 |
| **UI 组件库** | shadcn/ui (Radix UI + Tailwind) | 源码级拷贝，高度可定制，美观 |

## 4. 开发阶段规划 (Roadmap)

### Phase 1: 环境搭建与原型验证
- [ ] 初始化 Tauri + React + TS 项目。
- [ ] 配置 TailwindCSS 和基础 UI 布局 (侧边栏/编辑器/预览区)。
- [ ] 验证 Tauri 与前端的通信 (IPC)。

### Phase 2: 核心编辑器实现
- [ ] 集成 CodeMirror 6，实现基础文本输入。
- [ ] 集成 `react-markdown`，实现 Markdown -> HTML 的渲染。
- [ ] 实现左右分栏布局与基础的响应式设计。
- [ ] 引入 `rehype-raw` 解决 HTML 标签渲染问题。

### Phase 3: 文件系统交互 (Rust + Tauri API)
- [ ] 实现 `File -> Open` (调用系统文件选择器)。
- [ ] 实现 `File -> Save / Save As` (写入文件系统)。
- [ ] 实现文件内容读取并加载到编辑器。
- [ ] 增加“未保存”状态指示器 (文件名旁显示 *)。

### Phase 4: 增强功能与体验
- [ ] **同步滚动**: 实现编辑视口与预览视口的百分比同步。
- [ ] **扩展语法**: 添加 Mermaid、KaTeX、表格支持。
- [ ] **编辑器增强**: 添加快捷键 (Ctrl+B/I/K)、自动补全列表。
- [ ] **图片处理**: 支持本地图片路径解析 (Tauri `convertFileSrc`) 和粘贴图片上传/保存逻辑。

### Phase 5: 跨平台打磨与打包
- [ ] Windows 窗口边框样式调整。
- [ ] Linux 字体与渲染测试。
- [ ] Wayland 兼容性: 验证在 Gnome/KDE Wayland 会话下的运行表现（特别是 WebKitGTK 渲染问题）。
- [ ] 应用图标设计与配置。
- [ ] CI/CD 流程配置 (GitHub Actions 自动构建 Release)。

## 5. 目录结构规范 (建议)

```
Xmarkdown/
├── src-tauri/           # Rust 后端代码
│   ├── src/
│   │   ├── main.rs      # 入口，菜单定义
│   │   └── lib.rs       # 命令处理 (Commands)
│   ├── tauri.conf.json  # Tauri 配置文件
│   └── capabilities/    # 权限配置 (v2 新特性)
├── src/                 # 前端代码
│   ├── components/      # UI 组件
│   │   ├── editor/      # 编辑器相关组件
│   │   ├── preview/     # 预览器相关组件
│   │   └── ui/          # 通用 UI (shadcn)
│   ├── hooks/           # 自定义 Hooks (useFile, useAutoSave)
│   ├── lib/             # 工具函数
│   ├── store/           # 状态管理 (Zustand)
│   ├── App.tsx
│   └── main.tsx
└── package.json
```
