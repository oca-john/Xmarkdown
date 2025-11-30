import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useEditorStore } from "@/store/editor-store";
import { useSettingsStore } from "@/store/settings-store";
import { useFileOperations } from "./useFileOperations";

export function useMenuEvents() {
  const { setViewMode, syncScroll, setSyncScroll } = useEditorStore();
  const { setIsSettingsOpen, toggleSidebar, setIsAboutOpen } = useSettingsStore();
  const { newFile, openFile, openFolder, saveFile, saveFileAs } = useFileOperations();

  useEffect(() => {
    // 文件操作事件
    const unlistenNew = listen("menu-new", () => {
      newFile();
    });

    const unlistenOpen = listen("menu-open", () => {
      openFile();
    });

    const unlistenOpenFolder = listen("menu-open-folder", () => {
      openFolder();
    });

    const unlistenSave = listen("menu-save", () => {
      saveFile();
    });

    const unlistenSaveAs = listen("menu-save-as", () => {
      saveFileAs();
    });

    // 侧边栏切换
    const unlistenToggleSidebar = listen("menu-toggle-sidebar", () => {
      toggleSidebar();
    });

    // 视图切换事件
    const unlistenView = listen<string>("menu-view", (event) => {
      const mode = event.payload as "split" | "editor" | "preview";
      setViewMode(mode);
    });

    // 同步滚动切换
    const unlistenSyncScroll = listen("menu-toggle-sync-scroll", () => {
      setSyncScroll(!syncScroll);
    });

    // 关于对话框
    const unlistenAbout = listen("menu-about", () => {
      setIsAboutOpen(true);
    });

    // 设置面板
    const unlistenSettings = listen("menu-settings", () => {
      setIsSettingsOpen(true);
    });

    // 编辑操作
    const unlistenUndo = listen("menu-undo", () => document.execCommand("undo"));
    const unlistenRedo = listen("menu-redo", () => document.execCommand("redo"));
    const unlistenCut = listen("menu-cut", () => document.execCommand("cut"));
    const unlistenCopy = listen("menu-copy", () => document.execCommand("copy"));
    const unlistenPaste = listen("menu-paste", () => {
      navigator.clipboard.readText().then(text => {
        document.execCommand("insertText", false, text);
      }).catch(() => {
        document.execCommand("paste");
      });
    });
    const unlistenSelectAll = listen("menu-select-all", () => document.execCommand("selectAll"));

    // 清理函数
    return () => {
      unlistenNew.then((fn) => fn());
      unlistenOpen.then((fn) => fn());
      unlistenOpenFolder.then((fn) => fn());
      unlistenSave.then((fn) => fn());
      unlistenSaveAs.then((fn) => fn());
      unlistenToggleSidebar.then((fn) => fn());
      unlistenView.then((fn) => fn());
      unlistenSyncScroll.then((fn) => fn());
      unlistenAbout.then((fn) => fn());
      unlistenSettings.then((fn) => fn());
      
      unlistenUndo.then((fn) => fn());
      unlistenRedo.then((fn) => fn());
      unlistenCut.then((fn) => fn());
      unlistenCopy.then((fn) => fn());
      unlistenPaste.then((fn) => fn());
      unlistenSelectAll.then((fn) => fn());
    };
  }, [newFile, openFile, openFolder, saveFile, saveFileAs, toggleSidebar, setViewMode, syncScroll, setSyncScroll, setIsSettingsOpen, setIsAboutOpen]);
}
