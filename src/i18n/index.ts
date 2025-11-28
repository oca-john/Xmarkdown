import type { Language } from "@/store/settings-store";
import { VERSION, APP_NAME, AUTHOR, DESCRIPTION } from "@/version";

export const translations = {
  "zh-CN": {
    // 工具栏
    "toolbar.new": "新建",
    "toolbar.open": "打开文件",
    "toolbar.save": "保存",
    "toolbar.saveAs": "另存为",
    "toolbar.undo": "撤销",
    "toolbar.redo": "重做",
    "toolbar.cut": "剪切",
    "toolbar.copy": "复制",
    "toolbar.paste": "粘贴",
    "toolbar.untitled": "未命名",
    "toolbar.editorOnly": "仅编辑器",
    "toolbar.splitView": "分栏视图",
    "toolbar.previewOnly": "仅预览",
    "toolbar.syncScrollOn": "关闭同步滚动",
    "toolbar.syncScrollOff": "开启同步滚动",
    
    // 视图模式
    "viewMode.split": "分栏视图",
    "viewMode.editor": "编辑模式",
    "viewMode.preview": "预览模式",
    
    // 设置面板
    "settings.title": "设置",
    "settings.theme": "主题",
    "settings.themeLight": "浅色",
    "settings.themeDark": "深色",
    "settings.themeSystem": "跟随系统",
    "settings.language": "语言",
    "settings.defaultView": "默认显示方式",
    "settings.defaultViewSplit": "对照模式",
    "settings.defaultViewEditor": "编辑模式",
    "settings.defaultViewPreview": "预览模式",
    "settings.defaultSidebar": "默认侧栏",
    "settings.sidebarShow": "展开",
    "settings.sidebarHide": "收起",
    
    // 状态栏
    "statusBar.madeBy": `Made with ❤️ by ${AUTHOR}`,
    
    // 侧边栏
    "sidebar.toggle": "切换侧边栏",
    "sidebar.openFolder": "打开文件夹",
    "sidebar.noFolder": "使用 文件 → 打开文件夹 来打开项目",
    
    // 关于
    "about.title": `关于 ${APP_NAME}`,
    "about.version": `版本 ${VERSION}`,
    "about.description": DESCRIPTION["zh-CN"],
    "about.author": "作者",
    "about.techStack": "技术栈",
  },
  "zh-TW": {
    // 工具栏
    "toolbar.new": "新建",
    "toolbar.open": "開啟檔案",
    "toolbar.save": "儲存",
    "toolbar.saveAs": "另存為",
    "toolbar.undo": "復原",
    "toolbar.redo": "重做",
    "toolbar.cut": "剪下",
    "toolbar.copy": "複製",
    "toolbar.paste": "貼上",
    "toolbar.untitled": "未命名",
    "toolbar.editorOnly": "僅編輯器",
    "toolbar.splitView": "分欄視圖",
    "toolbar.previewOnly": "僅預覽",
    "toolbar.syncScrollOn": "關閉同步滾動",
    "toolbar.syncScrollOff": "開啟同步滾動",
    
    // 视图模式
    "viewMode.split": "分欄視圖",
    "viewMode.editor": "編輯模式",
    "viewMode.preview": "預覽模式",
    
    // 设置面板
    "settings.title": "設定",
    "settings.theme": "主題",
    "settings.themeLight": "淺色",
    "settings.themeDark": "深色",
    "settings.themeSystem": "跟隨系統",
    "settings.language": "語言",
    "settings.defaultView": "預設顯示方式",
    "settings.defaultViewSplit": "對照模式",
    "settings.defaultViewEditor": "編輯模式",
    "settings.defaultViewPreview": "預覽模式",
    "settings.defaultSidebar": "預設側欄",
    "settings.sidebarShow": "展開",
    "settings.sidebarHide": "收起",
    
    // 状态栏
    "statusBar.madeBy": `Made with ❤️ by ${AUTHOR}`,
    
    // 侧边栏
    "sidebar.toggle": "切換側邊欄",
    "sidebar.openFolder": "開啟資料夾",
    "sidebar.noFolder": "使用 檔案 → 開啟資料夾 來開啟專案",
    
    // 关于
    "about.title": `關於 ${APP_NAME}`,
    "about.version": `版本 ${VERSION}`,
    "about.description": DESCRIPTION["zh-TW"],
    "about.author": "作者",
    "about.techStack": "技術棧",
  },
  "en": {
    // 工具栏
    "toolbar.new": "New",
    "toolbar.open": "Open File",
    "toolbar.save": "Save",
    "toolbar.saveAs": "Save As",
    "toolbar.undo": "Undo",
    "toolbar.redo": "Redo",
    "toolbar.cut": "Cut",
    "toolbar.copy": "Copy",
    "toolbar.paste": "Paste",
    "toolbar.untitled": "Untitled",
    "toolbar.editorOnly": "Editor Only",
    "toolbar.splitView": "Split View",
    "toolbar.previewOnly": "Preview Only",
    "toolbar.syncScrollOn": "Disable Sync Scroll",
    "toolbar.syncScrollOff": "Enable Sync Scroll",
    
    // 视图模式
    "viewMode.split": "Split View",
    "viewMode.editor": "Editor Mode",
    "viewMode.preview": "Preview Mode",
    
    // 设置面板
    "settings.title": "Settings",
    "settings.theme": "Theme",
    "settings.themeLight": "Light",
    "settings.themeDark": "Dark",
    "settings.themeSystem": "System",
    "settings.language": "Language",
    "settings.defaultView": "Default View",
    "settings.defaultViewSplit": "Split Mode",
    "settings.defaultViewEditor": "Editor Mode",
    "settings.defaultViewPreview": "Preview Mode",
    "settings.defaultSidebar": "Default Sidebar",
    "settings.sidebarShow": "Show",
    "settings.sidebarHide": "Hide",
    
    // 状态栏
    "statusBar.madeBy": `Made with ❤️ by ${AUTHOR}`,
    
    // 侧边栏
    "sidebar.toggle": "Toggle Sidebar",
    "sidebar.openFolder": "Open Folder",
    "sidebar.noFolder": "Use File → Open Folder to open a project",
    
    // 关于
    "about.title": `About ${APP_NAME}`,
    "about.version": `Version ${VERSION}`,
    "about.description": DESCRIPTION["en"],
    "about.author": "Author",
    "about.techStack": "Tech Stack",
  },
};

export type TranslationKey = keyof typeof translations["zh-CN"];

export function t(key: TranslationKey, language: Language): string {
  return translations[language][key] || translations["zh-CN"][key] || key;
}

export function useTranslation(language: Language) {
  return {
    t: (key: TranslationKey) => t(key, language),
  };
}
