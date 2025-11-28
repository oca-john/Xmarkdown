import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type Language = "zh-CN" | "zh-TW" | "en";
export type DefaultViewMode = "split" | "editor" | "preview";

interface SettingsState {
  // 主题设置
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // 语言设置
  language: Language;
  setLanguage: (language: Language) => void;
  
  // 默认视图模式
  defaultViewMode: DefaultViewMode;
  setDefaultViewMode: (mode: DefaultViewMode) => void;
  
  // 默认侧栏展开
  defaultSidebarOpen: boolean;
  setDefaultSidebarOpen: (open: boolean) => void;
  
  // 设置面板状态
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  
  // 侧边栏状态
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // 关于对话框状态
  isAboutOpen: boolean;
  setIsAboutOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
      
      language: "zh-CN",
      setLanguage: (language) => set({ language }),
      
      defaultViewMode: "split",
      setDefaultViewMode: (defaultViewMode) => set({ defaultViewMode }),
      
      defaultSidebarOpen: false,
      setDefaultSidebarOpen: (defaultSidebarOpen) => set({ defaultSidebarOpen }),
      
      isSettingsOpen: false,
      setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
      
      isSidebarOpen: false,
      setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      isAboutOpen: false,
      setIsAboutOpen: (isAboutOpen) => set({ isAboutOpen }),
    }),
    {
      name: "xmarkdown-settings",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        defaultViewMode: state.defaultViewMode,
        defaultSidebarOpen: state.defaultSidebarOpen,
      }),
    }
  )
);

// 应用主题到 document
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", isDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}
