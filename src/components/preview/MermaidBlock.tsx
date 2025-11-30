import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// 初始化 mermaid 配置
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

interface MermaidBlockProps {
  code: string;
  onRenderComplete?: () => void;
}

export function MermaidBlock({ code, onRenderComplete }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const onRenderCompleteRef = useRef(onRenderComplete);
  
  // 保持回调引用最新
  useEffect(() => {
    onRenderCompleteRef.current = onRenderComplete;
  }, [onRenderComplete]);

  useEffect(() => {
    let isCancelled = false;
    
    const renderDiagram = async () => {
      if (!code.trim()) {
        setIsLoading(false);
        onRenderCompleteRef.current?.();
        return;
      }

      setIsLoading(true);
      // 每次渲染使用新的唯一 ID（使用时间戳确保唯一性）
      const currentRenderId = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      try {
        // 渲染图表
        const { svg } = await mermaid.render(currentRenderId, code);
        if (!isCancelled) {
          setSvg(svg);
          setError(null);
          setIsLoading(false);
          onRenderCompleteRef.current?.();
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Mermaid 渲染错误");
          setSvg("");
          setIsLoading(false);
          onRenderCompleteRef.current?.();
        }
      }
    };

    renderDiagram();
    
    return () => {
      isCancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Mermaid 语法错误: {error}</p>
        <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="my-4 flex justify-center items-center rounded-lg bg-muted/50 p-4 min-h-[100px]">
        <span className="text-sm text-muted-foreground">加载图表中...</span>
      </div>
    );
  }

  if (!svg) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center overflow-x-auto rounded-lg bg-muted/50 p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
