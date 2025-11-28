import { useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";

export function useFileDrop() {
  const { setContent, setFilePath, setIsModified } = useEditorStore();

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const fileName = file.name.toLowerCase();

      // 只接受 markdown 文件
      if (
        !fileName.endsWith(".md") &&
        !fileName.endsWith(".markdown") &&
        !fileName.endsWith(".txt")
      ) {
        console.warn("不支持的文件类型:", fileName);
        return;
      }

      try {
        // 获取文件路径 - Tauri 环境下可以通过 webkitRelativePath 或其他方式
        // 但在 web 标准中，出于安全考虑无法直接获取完整路径
        // 这里我们读取文件内容
        const text = await file.text();
        setContent(text);
        setFilePath(null); // 拖拽的文件我们不设置路径，需要用户手动保存
        setIsModified(true);
        console.log("[FileDrop] 已加载文件:", fileName);
      } catch (error) {
        console.error("[FileDrop] 读取文件失败:", error);
      }
    },
    [setContent, setFilePath, setIsModified]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  useEffect(() => {
    document.addEventListener("drop", handleDrop);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);

    return () => {
      document.removeEventListener("drop", handleDrop);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
    };
  }, [handleDrop, handleDragOver, handleDragEnter, handleDragLeave]);
}
