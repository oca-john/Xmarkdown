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
}

let mermaidId = 0;

export function MermaidBlock({ code }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${mermaidId++}`);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code.trim()) return;

      try {
        // 验证语法
        await mermaid.parse(code);
        // 渲染图表
        const { svg } = await mermaid.render(idRef.current, code);
        setSvg(svg);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Mermaid 渲染错误");
        setSvg("");
      }
    };

    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="my-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Mermaid 语法错误: {error}</p>
        <pre className="mt-2 text-xs text-muted-foreground">{code}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center overflow-x-auto rounded-lg bg-muted/50 p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
