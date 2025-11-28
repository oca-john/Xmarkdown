import { useEffect, useRef, useCallback } from "react";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useEditorStore } from "@/store/editor-store";

interface AutoSaveOptions {
  /** 自动保存间隔 (毫秒) */
  interval?: number;
  /** 是否启用自动保存 */
  enabled?: boolean;
}

export function useAutoSave(options: AutoSaveOptions = {}) {
  const { interval = 30000, enabled = true } = options;

  const { content, filePath, isModified, setIsModified } = useEditorStore();
  const lastSavedContentRef = useRef(content);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const save = useCallback(async () => {
    // 只有当文件已存在且有修改时才自动保存
    if (!filePath || !isModified) return;

    // 检查内容是否真的变化了
    if (content === lastSavedContentRef.current) return;

    try {
      await writeTextFile(filePath, content);
      lastSavedContentRef.current = content;
      setIsModified(false);
      console.log("[AutoSave] 文件已自动保存:", filePath);
    } catch (error) {
      console.error("[AutoSave] 保存失败:", error);
    }
  }, [content, filePath, isModified, setIsModified]);

  // 设置自动保存定时器
  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      save();
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, interval, save]);

  // 窗口失去焦点时保存
  useEffect(() => {
    if (!enabled) return;

    const handleBlur = () => {
      save();
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [enabled, save]);

  // 页面关闭前保存
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (filePath && isModified) {
        // 同步保存 - 这里使用 navigator.sendBeacon 可能更好，但 Tauri 环境下不适用
        // 实际上 Tauri 的 beforeunload 处理需要在 Rust 端进行
        save();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled, filePath, isModified, save]);

  return { save };
}
