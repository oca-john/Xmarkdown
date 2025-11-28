import { useCallback } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile, readDir } from "@tauri-apps/plugin-fs";
import { useEditorStore } from "@/store/editor-store";
import { useFileStore, type FileNode } from "@/store/file-store";

export function useFileOperations() {
  const {
    content,
    setContent,
    filePath,
    setFilePath,
    setIsModified,
    resetEditor,
  } = useEditorStore();

  const { setFolderPath, setFileTree } = useFileStore();

  // 新建文件
  const newFile = useCallback(() => {
    resetEditor();
    setContent("");
  }, [resetEditor, setContent]);

  // 打开文件
  const openFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Markdown",
            extensions: ["md", "markdown", "txt"],
          },
        ],
      });

      if (selected) {
        const path = selected as string;
        const fileContent = await readTextFile(path);
        setContent(fileContent);
        setFilePath(path);
        setIsModified(false);
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  }, [setContent, setFilePath, setIsModified]);

  // 另存为
  const saveFileAs = useCallback(async (): Promise<boolean> => {
    try {
      const selected = await save({
        filters: [
          {
            name: "Markdown",
            extensions: ["md"],
          },
        ],
        defaultPath: "untitled.md",
      });

      if (selected) {
        const path = selected as string;
        await writeTextFile(path, content);
        setFilePath(path);
        setIsModified(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to save file:", error);
      return false;
    }
  }, [content, setFilePath, setIsModified]);

  // 保存文件
  const saveFile = useCallback(async (): Promise<boolean> => {
    try {
      if (filePath) {
        await writeTextFile(filePath, content);
        setIsModified(false);
        return true;
      } else {
        return await saveFileAs();
      }
    } catch (error) {
      console.error("Failed to save file:", error);
      return false;
    }
  }, [content, filePath, setIsModified, saveFileAs]);

  // 构建文件树
  const buildFileTree = async (dirPath: string): Promise<FileNode[]> => {
    try {
      const entries = await readDir(dirPath);
      const nodes: FileNode[] = [];

      for (const entry of entries) {
        // 过滤隐藏文件和常见的忽略目录
        if (entry.name.startsWith(".") || 
            entry.name === "node_modules" || 
            entry.name === "target" ||
            entry.name === "dist") {
          continue;
        }

        const fullPath = `${dirPath}/${entry.name}`;
        const node: FileNode = {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory,
          isExpanded: false,
        };

        if (entry.isDirectory) {
          node.children = await buildFileTree(fullPath);
        }

        nodes.push(node);
      }

      // 排序：目录在前，文件在后，按名称排序
      return nodes.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error("Failed to read directory:", error);
      return [];
    }
  };

  // 打开文件夹
  const openFolder = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected) {
        const path = selected as string;
        setFolderPath(path);
        const tree = await buildFileTree(path);
        setFileTree(tree);
      }
    } catch (error) {
      console.error("Failed to open folder:", error);
    }
  }, [setFolderPath, setFileTree]);

  return {
    newFile,
    openFile,
    openFolder,
    saveFile,
    saveFileAs,
  };
}
