import { useCallback, useRef, useMemo, useEffect } from "react";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { useEditorStore } from "@/store/editor-store";
import { useSettingsStore } from "@/store/settings-store";
import { markdownKeymap } from "./markdown-keymap";

interface MarkdownEditorProps {
  onScroll?: (scrollPercent: number) => void;
  scrollPercent?: number;
  scrollSource?: "editor" | "preview";
}

export function MarkdownEditor({ onScroll, scrollPercent, scrollSource }: MarkdownEditorProps) {
  const { content, setContent, syncScroll } = useEditorStore();
  const { theme } = useSettingsStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const cmRef = useRef<ReactCodeMirrorRef>(null);
  const isProgrammaticScrollRef = useRef(false);
  const lastScrollPercentRef = useRef<number | undefined>(undefined);
  const isAtBoundaryRef = useRef(false);

  // 计算实际主题
  const isDark = useMemo(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  }, [theme]);

  const handleChange = useCallback(
    (value: string) => {
      setContent(value);
    },
    [setContent]
  );

  // 处理编辑器滚动事件 - 使用默认百分比同步
  const handleScroll = useCallback(
    (view: EditorView) => {
      if (!syncScroll || !onScroll || isProgrammaticScrollRef.current) return;

      const scrollDOM = view.scrollDOM;
      const scrollTop = scrollDOM.scrollTop;
      const maxScroll = scrollDOM.scrollHeight - scrollDOM.clientHeight;

      // 如果无法滚动（内容不超过容器），不触发同步
      if (maxScroll <= 0) return;

      const percent = (scrollTop / maxScroll) * 100;
      const clampedPercent = Math.min(100, Math.max(0, percent));
      
      // 检测是否在边界位置（已经到顶或到底）
      const isAtBoundary = scrollTop <= 0 || scrollTop >= maxScroll - 1;
      
      // 如果上一次已经在边界位置，且这次仍在边界，不再触发同步（防止循环）
      if (isAtBoundaryRef.current && isAtBoundary) return;
      isAtBoundaryRef.current = isAtBoundary;
      
      onScroll(clampedPercent);
    },
    [syncScroll, onScroll]
  );

  // 从预览区同步滚动到编辑器
  useEffect(() => {
    if (scrollSource !== "preview" || scrollPercent === undefined || !cmRef.current?.view) return;
    if (lastScrollPercentRef.current === scrollPercent) return;
    lastScrollPercentRef.current = scrollPercent;
    
    isProgrammaticScrollRef.current = true;
    const view = cmRef.current.view;
    const scrollDOM = view.scrollDOM;
    const maxScroll = scrollDOM.scrollHeight - scrollDOM.clientHeight;
    
    scrollDOM.scrollTop = (scrollPercent / 100) * maxScroll;
    
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 150);
  }, [scrollPercent, scrollSource]);

  const scrollExtension = useMemo(
    () =>
      EditorView.domEventHandlers({
        scroll: (_event, view) => {
          handleScroll(view);
          return false;
        },
      }),
    [handleScroll]
  );

  // 自定义主题 - 支持深色模式
  const customTheme = useMemo(
    () =>
      EditorView.theme(
        {
          "&": {
            height: "100%",
            fontSize: "14px",
            backgroundColor: isDark ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)",
            color: isDark ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)",
          },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          },
          ".cm-content": {
            padding: "16px",
            caretColor: isDark ? "#fff" : "#000",
          },
          ".cm-line": {
            padding: "0 4px",
          },
          "&.cm-focused": {
            outline: "none",
          },
          ".cm-gutters": {
            backgroundColor: isDark ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)",
            color: isDark ? "hsl(215 20.2% 65.1%)" : "hsl(215.4 16.3% 46.9%)",
            border: "none",
          },
          ".cm-activeLineGutter": {
            backgroundColor: isDark ? "hsl(217.2 32.6% 17.5%)" : "hsl(210 40% 96.1%)",
          },
          ".cm-activeLine": {
            backgroundColor: isDark ? "hsl(217.2 32.6% 17.5%)" : "hsl(210 40% 96.1%)",
          },
          ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
            backgroundColor: isDark ? "hsl(217.2 32.6% 25%)" : "hsl(210 40% 90%)",
          },
          ".cm-cursor": {
            borderLeftColor: isDark ? "#fff" : "#000",
          },
        },
        { dark: isDark }
      ),
    [isDark]
  );

  return (
    <div ref={editorRef} className="h-full w-full overflow-hidden">
      <CodeMirror
        ref={cmRef}
        value={content}
        height="100%"
        style={{ height: "100%" }}
        theme={isDark ? "dark" : "light"}
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          markdownKeymap,
          scrollExtension,
          customTheme,
          EditorView.lineWrapping,
        ]}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: true,
        }}
      />
    </div>
  );
}
