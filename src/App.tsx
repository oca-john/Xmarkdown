import { useState, useCallback, useEffect, useRef } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Sidebar } from "@/components/Sidebar";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { SettingsDialog } from "@/components/SettingsDialog";
import { AboutDialog } from "@/components/AboutDialog";
import { useEditorStore } from "@/store/editor-store";
import { useSettingsStore, applyTheme } from "@/store/settings-store";
import { useTranslation } from "@/i18n";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useFileDrop } from "@/hooks/useFileDrop";
import { useMenuEvents } from "@/hooks/useMenuEvents";
import { cn } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const { viewMode } = useEditorStore();
  const { theme, language, defaultViewMode, defaultSidebarOpen, isSidebarOpen, setIsSidebarOpen } = useSettingsStore();
  const { t } = useTranslation(language);
  const [scrollPercent, setScrollPercent] = useState<number | undefined>(undefined);
  const [scrollSource, setScrollSource] = useState<"editor" | "preview">("editor");
  
  // 分割线拖拽状态
  const [splitPercent, setSplitPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 注册功能 Hooks
  useKeyboardShortcuts();
  useAutoSave({ interval: 30000, enabled: true });
  useFileDrop();
  useMenuEvents();

  // 初始化主题
  useEffect(() => {
    applyTheme(theme);
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // 初始化默认视图模式和侧栏状态
  useEffect(() => {
    const { setViewMode } = useEditorStore.getState();
    setViewMode(defaultViewMode);
    setIsSidebarOpen(defaultSidebarOpen);
  }, [defaultSidebarOpen, setIsSidebarOpen]);

  // 初始化菜单栏语言
  useEffect(() => {
    invoke("update_menu_language", { lang: language }).catch(console.error);
  }, [language]);

  // 编辑器滚动处理
  const handleEditorScroll = useCallback(
    (percent: number) => {
      setScrollSource("editor");
      setScrollPercent(percent);
    },
    []
  );

  // 预览区滚动处理
  const handlePreviewScroll = useCallback(
    (percent: number) => {
      setScrollSource("preview");
      setScrollPercent(percent);
    },
    []
  );

  // 分割线拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let percent = (x / rect.width) * 100;
      
      // 限制在 40% - 60% 之间
      percent = Math.max(40, Math.min(60, percent));
      setSplitPercent(percent);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* 工具栏 */}
      <Toolbar />

      {/* 主区域 */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* 侧边栏 */}
        {isSidebarOpen && (
          <div className="w-60 flex-shrink-0 border-r bg-muted/30 overflow-hidden">
            <Sidebar />
          </div>
        )}

        {/* 编辑区域 */}
        <div ref={containerRef} className="flex flex-1 min-h-0 overflow-hidden">
          {/* 编辑器 */}
          {(viewMode === "split" || viewMode === "editor") && (
            <div
              className="h-full min-h-0 overflow-hidden"
              style={{
                width: viewMode === "split" ? `${splitPercent}%` : "100%",
              }}
            >
              <MarkdownEditor 
                onScroll={handleEditorScroll}
                scrollPercent={scrollPercent}
                scrollSource={scrollSource}
              />
            </div>
          )}

          {/* 分割线 */}
          {viewMode === "split" && (
            <div
              className={cn(
                "w-1 flex-shrink-0 bg-border hover:bg-primary/50 cursor-col-resize transition-colors",
                isDragging && "bg-primary"
              )}
              onMouseDown={handleMouseDown}
            />
          )}

          {/* 预览 */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div
              className="h-full min-h-0 overflow-hidden"
              style={{
                width: viewMode === "split" ? `${100 - splitPercent}%` : "100%",
              }}
            >
              <MarkdownPreview 
                scrollPercent={scrollPercent}
                scrollSource={scrollSource}
                onScroll={handlePreviewScroll}
              />
            </div>
          )}
        </div>
      </div>

      {/* 状态栏 */}
      <div className="flex-shrink-0 flex items-center justify-between border-t bg-muted/50 px-4 py-0.5 text-xs text-muted-foreground select-none">
        <span>{t("statusBar.madeBy")}</span>
        <span>
          {viewMode === "split"
            ? t("viewMode.split")
            : viewMode === "editor"
            ? t("viewMode.editor")
            : t("viewMode.preview")}
        </span>
      </div>

      {/* 设置对话框 */}
      <SettingsDialog />
      
      {/* 关于对话框 */}
      <AboutDialog />
    </div>
  );
}

export default App;
