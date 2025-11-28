import { Sun, Moon, Monitor, Languages, Layout, Info, PanelLeft } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useSettingsStore,
  applyTheme,
  type Theme,
  type Language,
  type DefaultViewMode,
} from "@/store/settings-store";
import { useTranslation } from "@/i18n";
import { APP_NAME, AUTHOR } from "@/version";

export function SettingsDialog() {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    defaultViewMode,
    setDefaultViewMode,
    defaultSidebarOpen,
    setDefaultSidebarOpen,
    isSettingsOpen,
    setIsSettingsOpen,
  } = useSettingsStore();

  const { t } = useTranslation(language);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    // 更新菜单栏语言
    try {
      await invoke("update_menu_language", { lang: newLang });
    } catch (e) {
      console.error("Failed to update menu language:", e);
    }
  };

  const themeOptions: { value: Theme; icon: React.ReactNode; labelKey: "settings.themeLight" | "settings.themeDark" | "settings.themeSystem" }[] = [
    { value: "light", icon: <Sun className="h-3 w-3" />, labelKey: "settings.themeLight" },
    { value: "dark", icon: <Moon className="h-3 w-3" />, labelKey: "settings.themeDark" },
    { value: "system", icon: <Monitor className="h-3 w-3" />, labelKey: "settings.themeSystem" },
  ];

  const languageOptions: { value: Language; label: string }[] = [
    { value: "zh-CN", label: "简体中文" },
    { value: "zh-TW", label: "繁體中文" },
    { value: "en", label: "English" },
  ];

  const viewModeOptions: { value: DefaultViewMode; labelKey: "settings.defaultViewSplit" | "settings.defaultViewEditor" | "settings.defaultViewPreview" }[] = [
    { value: "split", labelKey: "settings.defaultViewSplit" },
    { value: "editor", labelKey: "settings.defaultViewEditor" },
    { value: "preview", labelKey: "settings.defaultViewPreview" },
  ];

  const techStack = ["Tauri", "React", "TypeScript", "Vite", "TailwindCSS", "CodeMirror"];

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[510px] sm:min-w-[510px]">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* 主题设置 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sun className="h-4 w-4" />
              {t("settings.theme")}
            </div>
            <div className="flex gap-2">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={theme === option.value ? "default" : "outline"}
                  className="flex-1 gap-2 h-7 text-xs"
                  onClick={() => handleThemeChange(option.value)}
                >
                  {option.icon}
                  {t(option.labelKey)}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 语言设置 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Languages className="h-4 w-4" />
              {t("settings.language")}
            </div>
            <div className="flex gap-2">
              {languageOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={language === option.value ? "default" : "outline"}
                  className="flex-1 h-7 text-xs"
                  onClick={() => handleLanguageChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 默认视图模式 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layout className="h-4 w-4" />
              {t("settings.defaultView")}
            </div>
            <div className="flex gap-2">
              {viewModeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={defaultViewMode === option.value ? "default" : "outline"}
                  className="flex-1 h-7 text-xs"
                  onClick={() => setDefaultViewMode(option.value)}
                >
                  {t(option.labelKey)}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 默认侧栏展开 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <PanelLeft className="h-4 w-4" />
              {t("settings.defaultSidebar")}
            </div>
            <div className="flex gap-2">
              <Button
                variant={defaultSidebarOpen ? "default" : "outline"}
                className="flex-1 h-7 text-xs"
                onClick={() => setDefaultSidebarOpen(true)}
              >
                {t("settings.sidebarShow")}
              </Button>
              <Button
                variant={!defaultSidebarOpen ? "default" : "outline"}
                className="flex-1 h-7 text-xs"
                onClick={() => setDefaultSidebarOpen(false)}
              >
                {t("settings.sidebarHide")}
              </Button>
            </div>
          </div>

          <Separator />

          {/* 关于信息 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4" />
              {t("about.title")}
            </div>
            
            <div className="flex items-start gap-3">
              {/* 软件图标 */}
              <img 
                src="/icon-128.png" 
                alt={APP_NAME}
                className="w-12 h-12 rounded-xl shadow flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{APP_NAME}</span>
                  <span className="text-xs text-muted-foreground">{t("about.version")}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("about.description")}
                </p>
                <div className="text-xs mt-1">
                  <span className="text-muted-foreground">{t("about.author")}: </span>
                  <span>{AUTHOR}</span>
                </div>
              </div>
            </div>

            {/* 技术栈 */}
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
