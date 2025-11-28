import { keymap } from "@codemirror/view";
import { EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";

/**
 * 包装选中的文本
 */
function wrapSelection(
  view: EditorView,
  before: string,
  after: string = before
): boolean {
  const { state } = view;
  const changes = state.changeByRange((range) => {
    const selectedText = state.sliceDoc(range.from, range.to);

    // 检查是否已经被包装
    const textBefore = state.sliceDoc(
      Math.max(0, range.from - before.length),
      range.from
    );
    const textAfter = state.sliceDoc(
      range.to,
      Math.min(state.doc.length, range.to + after.length)
    );

    if (textBefore === before && textAfter === after) {
      // 移除包装
      return {
        changes: [
          { from: range.from - before.length, to: range.from, insert: "" },
          { from: range.to, to: range.to + after.length, insert: "" },
        ],
        range: EditorSelection.range(
          range.from - before.length,
          range.to - before.length
        ),
      };
    }

    // 添加包装
    const newText = before + selectedText + after;
    return {
      changes: { from: range.from, to: range.to, insert: newText },
      range: EditorSelection.range(
        range.from + before.length,
        range.from + before.length + selectedText.length
      ),
    };
  });

  view.dispatch(changes);
  return true;
}

/**
 * 插入链接
 */
function insertLink(view: EditorView): boolean {
  const { state } = view;
  const range = state.selection.main;
  const selectedText = state.sliceDoc(range.from, range.to);

  const linkText = selectedText || "链接文字";
  const newText = `[${linkText}](url)`;

  view.dispatch({
    changes: { from: range.from, to: range.to, insert: newText },
    selection: selectedText
      ? EditorSelection.range(
          range.from + linkText.length + 3,
          range.from + linkText.length + 6
        )
      : EditorSelection.range(range.from + 1, range.from + 1 + linkText.length),
  });

  return true;
}

/**
 * 插入图片
 */
function insertImage(view: EditorView): boolean {
  const { state } = view;
  const range = state.selection.main;
  const selectedText = state.sliceDoc(range.from, range.to);

  const altText = selectedText || "图片描述";
  const newText = `![${altText}](url)`;

  view.dispatch({
    changes: { from: range.from, to: range.to, insert: newText },
    selection: EditorSelection.range(
      range.from + altText.length + 4,
      range.from + altText.length + 7
    ),
  });

  return true;
}

/**
 * 切换标题级别
 */
function toggleHeading(view: EditorView, level: number): boolean {
  const { state } = view;
  const line = state.doc.lineAt(state.selection.main.head);
  const lineText = line.text;

  // 检查当前标题级别
  const headingMatch = lineText.match(/^(#{1,6})\s/);
  const currentLevel = headingMatch ? headingMatch[1].length : 0;

  let newText: string;
  let cursorOffset: number;

  if (currentLevel === level) {
    // 移除标题
    newText = lineText.replace(/^#{1,6}\s/, "");
    cursorOffset = -level - 1;
  } else if (currentLevel > 0) {
    // 更改标题级别
    newText = "#".repeat(level) + " " + lineText.replace(/^#{1,6}\s/, "");
    cursorOffset = level - currentLevel;
  } else {
    // 添加标题
    newText = "#".repeat(level) + " " + lineText;
    cursorOffset = level + 1;
  }

  view.dispatch({
    changes: { from: line.from, to: line.to, insert: newText },
    selection: EditorSelection.cursor(
      Math.max(line.from, state.selection.main.head + cursorOffset)
    ),
  });

  return true;
}

/**
 * 切换代码块
 */
function toggleCodeBlock(view: EditorView): boolean {
  const { state } = view;
  const range = state.selection.main;
  const selectedText = state.sliceDoc(range.from, range.to);

  const codeBlock = "```\n" + (selectedText || "code") + "\n```";

  view.dispatch({
    changes: { from: range.from, to: range.to, insert: codeBlock },
    selection: selectedText
      ? EditorSelection.cursor(range.from + codeBlock.length)
      : EditorSelection.range(range.from + 4, range.from + 8),
  });

  return true;
}

/**
 * 切换引用
 */
function toggleBlockquote(view: EditorView): boolean {
  const { state } = view;
  const line = state.doc.lineAt(state.selection.main.head);
  const lineText = line.text;

  let newText: string;
  let cursorOffset: number;

  if (lineText.startsWith("> ")) {
    newText = lineText.slice(2);
    cursorOffset = -2;
  } else {
    newText = "> " + lineText;
    cursorOffset = 2;
  }

  view.dispatch({
    changes: { from: line.from, to: line.to, insert: newText },
    selection: EditorSelection.cursor(state.selection.main.head + cursorOffset),
  });

  return true;
}

/**
 * 切换无序列表
 */
function toggleBulletList(view: EditorView): boolean {
  const { state } = view;
  const line = state.doc.lineAt(state.selection.main.head);
  const lineText = line.text;

  let newText: string;
  let cursorOffset: number;

  if (lineText.match(/^[-*+]\s/)) {
    newText = lineText.replace(/^[-*+]\s/, "");
    cursorOffset = -2;
  } else if (lineText.match(/^\d+\.\s/)) {
    newText = "- " + lineText.replace(/^\d+\.\s/, "");
    cursorOffset = 0;
  } else {
    newText = "- " + lineText;
    cursorOffset = 2;
  }

  view.dispatch({
    changes: { from: line.from, to: line.to, insert: newText },
    selection: EditorSelection.cursor(state.selection.main.head + cursorOffset),
  });

  return true;
}

/**
 * Markdown 快捷键映射
 */
export const markdownKeymap = keymap.of([
  // 粗体 Ctrl+B
  {
    key: "Mod-b",
    run: (view) => wrapSelection(view, "**"),
  },
  // 斜体 Ctrl+I
  {
    key: "Mod-i",
    run: (view) => wrapSelection(view, "*"),
  },
  // 删除线 Ctrl+Shift+S
  {
    key: "Mod-Shift-s",
    run: (view) => wrapSelection(view, "~~"),
  },
  // 行内代码 Ctrl+`
  {
    key: "Mod-`",
    run: (view) => wrapSelection(view, "`"),
  },
  // 链接 Ctrl+K
  {
    key: "Mod-k",
    run: insertLink,
  },
  // 图片 Ctrl+Shift+I
  {
    key: "Mod-Shift-i",
    run: insertImage,
  },
  // 标题 Ctrl+1~6
  { key: "Mod-1", run: (view) => toggleHeading(view, 1) },
  { key: "Mod-2", run: (view) => toggleHeading(view, 2) },
  { key: "Mod-3", run: (view) => toggleHeading(view, 3) },
  { key: "Mod-4", run: (view) => toggleHeading(view, 4) },
  { key: "Mod-5", run: (view) => toggleHeading(view, 5) },
  { key: "Mod-6", run: (view) => toggleHeading(view, 6) },
  // 代码块 Ctrl+Shift+K
  {
    key: "Mod-Shift-k",
    run: toggleCodeBlock,
  },
  // 引用 Ctrl+Shift+Q
  {
    key: "Mod-Shift-q",
    run: toggleBlockquote,
  },
  // 无序列表 Ctrl+Shift+L
  {
    key: "Mod-Shift-l",
    run: toggleBulletList,
  },
]);
