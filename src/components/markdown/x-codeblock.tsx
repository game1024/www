"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { codeToHtml, type BundledLanguage } from "shiki";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { file2iconForTheme } from "@/lib/file-icons";

export interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  frame?: boolean;
  collapse?: boolean;
}

export function XCodeBlock({ code, language, title, frame, collapse }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [theme, setTheme] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  // 计算代码行数，collapse=true 且行数 > 5 时才启用折叠
  const lineCount = code.split("\n").length;
  const COLLAPSE_THRESHOLD = 5;
  const needsCollapse = collapse === true && lineCount > COLLAPSE_THRESHOLD;

  // bash/powershell 自动显示 frame
  const shellLang = language === "bash" || language === "powershell";
  const showFrame = frame !== undefined ? frame : (!!title || shellLang);
  const displayTitle = title || (shellLang ? language : undefined);

  // 监听主题变化
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const highlight = async () => {
      try {
        const result = await codeToHtml(code, {
          lang: language as BundledLanguage,
          theme: theme === "dark" ? "github-dark" : "github-light",
        });
        setHtml(result);
      } catch {
        // 如果语言不支持，使用 plaintext
        const result = await codeToHtml(code, {
          lang: "plaintext",
          theme: theme === "dark" ? "github-dark" : "github-light",
        });
        setHtml(result);
      }
    };
    highlight();
  }, [code, language, theme]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, [code]);

  const isCollapsed = needsCollapse && !expanded;

  return (
    <div className="x-codeblock relative group my-2 rounded-lg border border-border overflow-hidden">
      {(displayTitle || showFrame) && (
        <div className="flex items-center px-4 py-1.5 bg-muted border-b border-border text-xs font-code text-muted-foreground relative">
          {showFrame && (
            <div className="flex items-center gap-1.5 absolute left-4">
              <span className="block w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></span>
              <span className="block w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></span>
              <span className="block w-2.5 h-2.5 rounded-full bg-[#28C840]"></span>
            </div>
          )}
          <div className="flex-1 flex items-center gap-2 justify-center">
            {displayTitle && (
              <>
                <Icon icon={file2iconForTheme(displayTitle!, theme as "light" | "dark")} className="size-4 shrink-0" />
                <span className="truncate">{displayTitle}</span>
              </>
            )}
          </div>
        </div>
      )}
      <div className="relative">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          title="复制代码"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </Button>
        <div className={isCollapsed ? "max-h-[calc(1.65rem*5+2rem)] overflow-hidden" : ""}>
          {html ? (
            <div
              className="shiki-wrapper [&>pre]:p-4 [&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:text-sm [&>pre]:leading-relaxed [&_code]:font-code [&_span]:!no-underline [&_span]:![text-decoration:none]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <pre className="p-4 text-sm leading-relaxed overflow-x-auto font-code">
              <code>{code}</code>
            </pre>
          )}
        </div>
        {needsCollapse && (
          <div
            className={`flex items-end justify-center ${
              isCollapsed
                ? "absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/95 via-background/60 to-transparent"
                : "border-t border-border"
            }`}
          >
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-code cursor-pointer"
            >
              <Icon
                icon={expanded ? "ri:arrow-up-s-line" : "ri:arrow-down-s-line"}
                className="size-4"
              />
              {expanded ? "收起" : `展开全部 ${lineCount} 行`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default XCodeBlock;
