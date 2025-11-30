import { create } from "zustand";

const DEFAULT_CONTENT = `# 欢迎使用 Xmarkdown

Xmarkdown 是一款高性能、跨平台的 Markdown 编辑器。

## 功能特性

- **实时预览**: 左侧编辑，右侧实时渲染
- **语法高亮**: 支持 Markdown 语法高亮
- **同步滚动**: 编辑区与预览区同步滚动
- **GFM 支持**: 表格、任务列表、自动链接
- **数学公式**: LaTeX/KaTeX 支持
- **图表支持**: Mermaid 流程图

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, Xmarkdown!");
}
\`\`\`

## 表格示例

| 功能 | 状态 |
| --- | --- |
| 基础编辑 | ✅ |
| 实时预览 | ✅ |
| 文件操作 | ✅ |
| Mermaid 图表 | ✅ |
| 数学公式 | ✅ |

## 任务列表

- [x] 初始化项目
- [x] 实现编辑器
- [x] 添加 Mermaid 支持
- [ ] 添加更多功能

## 数学公式

行内公式: $E = mc^2$

块级公式:

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## Mermaid 流程图

\`\`\`mermaid
graph TD
    A[开始] --> B{是否有文件?}
    B -->|是| C[打开文件]
    B -->|否| D[新建文件]
    C --> E[编辑内容]
    D --> E
    E --> F[保存文件]
    F --> G[结束]
\`\`\`

## 快捷键

| 快捷键 | 功能 |
| --- | --- |
| Ctrl+B | **粗体** |
| Ctrl+I | *斜体* |
| Ctrl+K | [链接](url) |
| Ctrl+S | 保存 |
| Ctrl+O | 打开 |

> 开始编写你的 Markdown 文档吧！
`;

interface EditorState {
  // 编辑器内容
  content: string;
  setContent: (content: string) => void;
  
  // 文件状态
  filePath: string | null;
  setFilePath: (path: string | null) => void;
  
  // 修改状态
  isModified: boolean;
  setIsModified: (modified: boolean) => void;
  
  // 视图模式
  viewMode: "split" | "editor" | "preview";
  setViewMode: (mode: "split" | "editor" | "preview") => void;
  
  // 滚动同步
  syncScroll: boolean;
  setSyncScroll: (sync: boolean) => void;
  
  // 光标位置
  cursorPosition: { line: number; column: number };
  setCursorPosition: (pos: { line: number; column: number }) => void;
  
  // 重置编辑器
  resetEditor: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  content: DEFAULT_CONTENT,
  setContent: (content) => set({ content, isModified: true }),
  
  filePath: null,
  setFilePath: (filePath) => set({ filePath }),
  
  isModified: false,
  setIsModified: (isModified) => set({ isModified }),
  
  viewMode: "split",
  setViewMode: (viewMode) => set({ viewMode }),
  
  syncScroll: true,
  setSyncScroll: (syncScroll) => set({ syncScroll }),
  
  cursorPosition: { line: 1, column: 1 },
  setCursorPosition: (cursorPosition) => set({ cursorPosition }),
  
  resetEditor: () => set({
    content: "",
    filePath: null,
    isModified: false,
    cursorPosition: { line: 1, column: 1 },
  }),
}));
