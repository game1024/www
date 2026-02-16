"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { DiagramOverlay } from "./diagram-overlay";
import { SourceCodeDialog } from "./source-code-dialog";

export interface MermaidBlockProps {
  source: string;
}

export function XMermaid({ source }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      if (!containerRef.current) return;

      try {
        const { default: mermaid } = await import(
          /* @vite-ignore */
          "https://cdn.jsdelivr.net/npm/mermaid@11.12.2/dist/mermaid.esm.min.mjs"
        );

        if (cancelled) return;

        const isDark = document.documentElement.classList.contains("dark");
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "base" : "default",
          ...(isDark && {
            themeVariables: {
              primaryColor: "#24292e",
              primaryBorderColor: "#30363d",
              secondBgColor: "#2d333b",
              textColor: "#c9d1d9",
              //fontFamily: "var(--font-code)",
              primaryTextColor: "#c9d1d9",
              tertiaryTextColor: "#8b949e",
              lineColor: "#30363d",
              signalTextDarkColor: "#c9d1d9",
            },
          }),
          securityLevel: "loose",
        });

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, source);

        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = svg;
        setSvgHtml(svg);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "渲染失败");
        }
      }
    };

    render();

    // 监听主题变化
    const observer = new MutationObserver(() => {
      render();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [source]);

  if (error) {
    return (
      <div className="x-mermaid my-2 p-4 rounded-lg border border-destructive bg-destructive/10 text-destructive text-sm">
        Mermaid 渲染失败: {error}
      </div>
    );
  }

  return (
    <>
      <div className="x-mermaid my-2 rounded-lg border border-border overflow-hidden min-h-[120px] relative group">
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setSourceOpen(true)}
            title="查看源码"
          >
            <Icon icon="ri:code-s-slash-line" className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setOverlayOpen(true)}
            title="全屏查看"
          >
            <Icon icon="ri:fullscreen-line" className="size-4" />
          </Button>
        </div>
        <div
          ref={containerRef}
          className="flex justify-center items-center p-4 overflow-auto [&_foreignObject]:overflow-visible [&_foreignObject]:w-auto"
        />
      </div>

      <DiagramOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)}>
        <div
          className="flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      </DiagramOverlay>

      <SourceCodeDialog
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
        source={source}
        language="mermaid"
      />
    </>
  );
}

export default XMermaid;
