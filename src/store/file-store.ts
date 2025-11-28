import { create } from "zustand";

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  isExpanded?: boolean;
}

interface FileState {
  // 当前打开的文件夹路径
  folderPath: string | null;
  setFolderPath: (path: string | null) => void;
  
  // 文件树
  fileTree: FileNode[];
  setFileTree: (tree: FileNode[]) => void;
  
  // 切换目录展开状态
  toggleExpanded: (path: string) => void;
  
  // 打开的文件列表
  openFiles: string[];
  addOpenFile: (path: string) => void;
  removeOpenFile: (path: string) => void;
  
  // 当前活动文件
  activeFile: string | null;
  setActiveFile: (path: string | null) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  folderPath: null,
  setFolderPath: (folderPath) => set({ folderPath }),
  
  fileTree: [],
  setFileTree: (fileTree) => set({ fileTree }),
  
  toggleExpanded: (path) => {
    const toggleNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === path) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: toggleNode(node.children) };
        }
        return node;
      });
    };
    set((state) => ({ fileTree: toggleNode(state.fileTree) }));
  },
  
  openFiles: [],
  addOpenFile: (path) => {
    const { openFiles } = get();
    if (!openFiles.includes(path)) {
      set({ openFiles: [...openFiles, path], activeFile: path });
    } else {
      set({ activeFile: path });
    }
  },
  removeOpenFile: (path) => {
    const { openFiles, activeFile } = get();
    const newOpenFiles = openFiles.filter((f) => f !== path);
    const newActiveFile = activeFile === path 
      ? (newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null)
      : activeFile;
    set({ openFiles: newOpenFiles, activeFile: newActiveFile });
  },
  
  activeFile: null,
  setActiveFile: (activeFile) => set({ activeFile }),
}));
