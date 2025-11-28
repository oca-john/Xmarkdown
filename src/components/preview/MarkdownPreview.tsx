import { useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { useEditorStore } from "@/store/editor-store";
import { MermaidBlock } from "./MermaidBlock";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

interface MarkdownPreviewProps {
  scrollPercent?: number;
  scrollSource?: "editor" | "preview";
  onScroll?: (scrollPercent: number) => void;
}

export function MarkdownPreview({ scrollPercent, scrollSource, onScroll }: MarkdownPreviewProps) {
  const { content, syncScroll } = useEditorStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const lastScrollPercentRef = useRef<number | undefined>(undefined);
  const isAtBoundaryRef = useRef(false);

  // 从编辑器同步滚动到预览 - 使用默认百分比同步
  useEffect(() => {
    if (scrollSource !== "editor" || scrollPercent === undefined || !previewRef.current) return;
    if (lastScrollPercentRef.current === scrollPercent) return;
    lastScrollPercentRef.current = scrollPercent;

    isProgrammaticScrollRef.current = true;
    const element = previewRef.current;
    const maxScroll = element.scrollHeight - element.clientHeight;
    
    element.scrollTop = (scrollPercent / 100) * maxScroll;

    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 150);
  }, [scrollPercent, scrollSource]);

  // 处理预览区滚动事件 - 使用默认百分比同步
  const handleScroll = useCallback(() => {
    if (!syncScroll || !onScroll || isProgrammaticScrollRef.current || !previewRef.current) return;
    
    const element = previewRef.current;
    const scrollTop = element.scrollTop;
    const maxScroll = element.scrollHeight - element.clientHeight;
    
    // 如果无法滚动（内容不超过容器），不触发同步
    if (maxScroll <= 0) return;
    
    const percent = (scrollTop / maxScroll) * 100;
    const clampedPercent = Math.min(100, Math.max(0, percent));
    
    // 检测是否在边界位置（已经到顶或到底）
    const isAtBoundary = scrollTop <= 0 || scrollTop >= maxScroll - 1;
    
    // 如果上一次已经在边界位置，且这次仍在边界，不再触发同步（防止循环）
    if (isAtBoundaryRef.current && isAtBoundary) return;
    isAtBoundaryRef.current = isAtBoundary;
    
    onScroll(clampedPercent);
  }, [syncScroll, onScroll]);

  return (
    <div
      ref={previewRef}
      className="markdown-preview h-full overflow-auto bg-background"
      onScroll={handleScroll}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
        components={{
          // 自定义链接在新窗口打开
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          // 自定义代码块 - 支持 Mermaid
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : null;
            const codeString = String(children).replace(/\n$/, "");

            // Mermaid 图表
            if (language === "mermaid") {
              return <MermaidBlock code={codeString} />;
            }

            // 内联代码
            if (!language) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            // 代码块
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // 自定义任务列表
          input: ({ type, checked, ...props }) => {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
