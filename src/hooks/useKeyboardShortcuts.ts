import { useEffect } from "react";
import { useFileOperations } from "./useFileOperations";

export function useKeyboardShortcuts() {
  const { newFile, openFile, saveFile, saveFileAs } = useFileOperations();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === "n") {
        e.preventDefault();
        newFile();
      } else if (isMod && e.key === "o") {
        e.preventDefault();
        openFile();
      } else if (isMod && e.shiftKey && e.key === "s") {
        e.preventDefault();
        saveFileAs();
      } else if (isMod && e.key === "s") {
        e.preventDefault();
        saveFile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [newFile, openFile, saveFile, saveFileAs]);
}
