import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/store/settings-store";
import { useTranslation } from "@/i18n";
import { APP_NAME, AUTHOR } from "@/version";

export function AboutDialog() {
  const { language, isAboutOpen, setIsAboutOpen } = useSettingsStore();
  const { t } = useTranslation(language);

  const techStack = ["Tauri", "React", "TypeScript", "Vite", "TailwindCSS", "CodeMirror"];

  return (
    <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{t("about.title")}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          {/* 软件图标 */}
          <img 
            src="/icon-128.png" 
            alt={APP_NAME}
            className="w-20 h-20 rounded-2xl shadow-lg"
          />
          
          {/* 软件名称和版本 */}
          <div className="text-center">
            <h2 className="text-xl font-semibold">{APP_NAME}</h2>
            <p className="text-sm text-muted-foreground">{t("about.version")}</p>
          </div>
          
          {/* 软件介绍 */}
          <p className="text-center text-sm text-muted-foreground px-4">
            {t("about.description")}
          </p>
          
          {/* 作者信息 */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t("about.author")}: </span>
            <span className="font-medium">{AUTHOR}</span>
          </div>
          
          {/* 技术栈 */}
          <div className="flex flex-wrap justify-center gap-2 px-4">
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
      </DialogContent>
    </Dialog>
  );
}
