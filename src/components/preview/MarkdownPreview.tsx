import { useRef, useEffect, useCallback, useState, useMemo } from "react";
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

// 小文档阈值（字符数），低于此值的文档会等待完整渲染后再启用滚动同步
const SMALL_DOCUMENT_THRESHOLD = 10000;

export function MarkdownPreview({ scrollPercent, scrollSource, onScroll }: MarkdownPreviewProps) {
  const { content, syncScroll } = useEditorStore();
  
  // Mermaid 渲染跟踪
  const [mermaidRenderedCount, setMermaidRenderedCount] = useState(0);
  const mermaidRenderedCountRef = useRef(0);
  const lastContentRef = useRef<string>("");

  const previewRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const lastScrollPercentRef = useRef<number | undefined>(undefined);
  const lastScrollHeightRef = useRef<number>(0);
  
  // 计算文档中的 Mermaid 块数量
  const mermaidBlockCount = useMemo(() => {
    const matches = content.match(/```mermaid[\s\S]*?```/g);
    return matches ? matches.length : 0;
  }, [content]);
  
  // 判断是否为小文档
  const isSmallDocument = content.length < SMALL_DOCUMENT_THRESHOLD;
  
  // 判断是否所有 Mermaid 块都已渲染完成
  const allMermaidRendered = mermaidBlockCount === 0 || mermaidRenderedCount >= mermaidBlockCount;
  
  // 小文档且含有 Mermaid 时，需等待渲染完成才启用滚动同步
  const scrollSyncReady = !isSmallDocument || allMermaidRendered;
  
  // 内容变化时重置 Mermaid 渲染计数
  useEffect(() => {
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      mermaidRenderedCountRef.current = 0;
      setMermaidRenderedCount(0);
    }
  }, [content]);
  
  // Mermaid 渲染完成回调 - 使用 ref 避免触发重新渲染
  const handleMermaidRenderComplete = useCallback(() => {
    mermaidRenderedCountRef.current += 1;
    // 只有当所有 Mermaid 块都渲染完成时才更新状态
    if (mermaidRenderedCountRef.current >= mermaidBlockCount) {
      setMermaidRenderedCount(mermaidRenderedCountRef.current);
    }
  }, [mermaidBlockCount]);

  // 从编辑器同步滚动到预览 - 使用默认百分比同步
  useEffect(() => {
    if (scrollSource !== "editor" || scrollPercent === undefined || !previewRef.current) return;
    // 小文档且 Mermaid 未渲染完成时，不执行滚动同步
    if (!scrollSyncReady) return;
    if (lastScrollPercentRef.current === scrollPercent) return;
    lastScrollPercentRef.current = scrollPercent;

    isProgrammaticScrollRef.current = true;
    const element = previewRef.current;
    const { scrollHeight, clientHeight } = element;
    const maxScroll = scrollHeight - clientHeight;
    
    // 计算目标 scrollTop (默认逻辑)
    const targetScrollTop = (scrollPercent / 100) * maxScroll;
    
    element.scrollTop = targetScrollTop;
    lastScrollHeightRef.current = scrollHeight;

    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 150);
  }, [scrollPercent, scrollSource, scrollSyncReady]);

  // 监听内容高度变化（如流程图渲染后高度增加），重新应用滚动位置
  useEffect(() => {
    if (!previewRef.current || scrollPercent === undefined) return;
    
    const element = previewRef.current;
    
    const observer = new ResizeObserver(() => {
      if (isProgrammaticScrollRef.current) return;
      
      const { scrollHeight, clientHeight } = element;
      const maxScroll = scrollHeight - clientHeight;
      
      // 如果高度变化且有有效的滚动百分比，重新应用滚动位置
      if (scrollHeight !== lastScrollHeightRef.current && maxScroll > 0 && lastScrollPercentRef.current !== undefined) {
        const targetScrollTop = (lastScrollPercentRef.current / 100) * maxScroll;
        element.scrollTop = targetScrollTop;
        lastScrollHeightRef.current = scrollHeight;
      }
    });
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [scrollPercent]);

  // 处理预览区滚动事件 - 使用默认百分比同步
  const handleScroll = useCallback(() => {
    // 小文档且 Mermaid 未渲染完成时，不触发滚动同步
    if (!syncScroll || !onScroll || isProgrammaticScrollRef.current || !previewRef.current || !scrollSyncReady) return;
    
    const element = previewRef.current;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const maxScroll = scrollHeight - clientHeight;
    
    // 如果无法滚动（内容不超过容器），不触发同步
    if (maxScroll <= 0) return;
    
    // 默认同步逻辑
    const percent = (scrollTop / maxScroll) * 100;
    
    onScroll(percent);
  }, [syncScroll, onScroll, scrollSyncReady]);

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
              return <MermaidBlock code={codeString} onRenderComplete={handleMermaidRenderComplete} />;
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
