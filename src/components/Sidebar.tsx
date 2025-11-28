import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
import { useFileStore, type FileNode } from "@/store/file-store";
import { useEditorStore } from "@/store/editor-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { readTextFile } from "@tauri-apps/plugin-fs";

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
}

function FileTreeItem({ node, depth }: FileTreeItemProps) {
  const { toggleExpanded, setActiveFile, addOpenFile } = useFileStore();
  const { setContent, setFilePath, setIsModified } = useEditorStore();

  const handleClick = async () => {
    if (node.isDirectory) {
      toggleExpanded(node.path);
    } else {
      // 打开文件
      try {
        const content = await readTextFile(node.path);
        setContent(content);
        setFilePath(node.path);
        setIsModified(false);
        addOpenFile(node.path);
        setActiveFile(node.path);
      } catch (error) {
        console.error("Failed to read file:", error);
      }
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent rounded-sm text-sm",
          "select-none"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.isDirectory ? (
          <>
            {node.isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            )}
            {node.isExpanded ? (
              <FolderOpen className="h-4 w-4 flex-shrink-0 text-yellow-500" />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0 text-yellow-500" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {node.isDirectory && node.isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { folderPath, fileTree } = useFileStore();
  const { language } = useSettingsStore();
  const { t } = useTranslation(language);

  if (!folderPath) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
        <span>{t("sidebar.noFolder")}</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto py-2">
      {fileTree.map((node) => (
        <FileTreeItem key={node.path} node={node} depth={0} />
      ))}
    </div>
  );
}
