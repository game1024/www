"use client";

import React, { useEffect, useRef, useState } from "react";
import { XCodeBlock } from "./x-codeblock";
import { XMermaid } from "./x-mermaid";
import { XInfographic } from "./x-infographic";

// ========== 类型定义 ==========
interface GameMarkdownProps {
  content: string;
  className?: string;
}

// ========== 主组件：解析并增强 HTML ==========
export function GameMarkdown({ content, className }: GameMarkdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (!content) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const body = doc.body;

    const result: React.ReactNode[] = [];
    let keyIndex = 0;

    const processNode = (node: Node): React.ReactNode | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }

      const el = node as Element;
      const tagName = el.tagName.toLowerCase();

      // 检测 pre > code 结构
      if (tagName === "pre" && el.children.length === 1 && el.children[0].tagName.toLowerCase() === "code") {
        const codeEl = el.children[0] as HTMLElement;
        const classAttr = codeEl.getAttribute("class") || "";
        const langMatch = classAttr.match(/language-(\w+)/);
        const language = langMatch ? langMatch[1] : "plaintext";
        const code = codeEl.textContent || "";

        // 特殊处理 mermaid
        if (language === "mermaid") {
          return <XMermaid key={keyIndex++} source={code.trim()} />;
        }

        // 特殊处理 infographic
        if (language === "infographic") {
          return <XInfographic key={keyIndex++} syntax={code.trim()} />;
        }

        // 普通代码块 - 使用 Shiki 渲染
        const titleAttr = el.getAttribute("data-title") || codeEl.getAttribute("data-title");
        const frameAttr = el.getAttribute("data-frame");
        const collapseAttr = el.getAttribute("data-collapse");
        return <XCodeBlock
          key={keyIndex++}
          code={code.trim()}
          language={language}
          title={titleAttr || undefined}
          frame={frameAttr != null ? frameAttr !== "false" : undefined}
          collapse={collapseAttr != null ? collapseAttr !== "false" : undefined}
        />;
      }

      // 递归处理子节点
      const children = Array.from(el.childNodes).map(processNode).filter(Boolean);

      // 创建 React 元素
      const props: Record<string, any> = { key: keyIndex++ };

      // 复制属性
      Array.from(el.attributes).forEach((attr) => {
        let name = attr.name;
        if (name === "class") name = "className";
        if (name === "for") name = "htmlFor";
        if (name.startsWith("data-")) {
          props[name] = attr.value;
        } else {
          props[name] = attr.value;
        }
      });

      // 对于需要 dangerouslySetInnerHTML 的元素（如包含特殊内容）
      if (tagName === "script" || tagName === "style") {
        return null; // 跳过脚本和样式
      }

      // 自闭合标签
      const voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"];
      if (voidElements.includes(tagName)) {
        return React.createElement(tagName, props);
      }

      return React.createElement(tagName, props, ...children);
    };

    const processedElements = Array.from(body.childNodes)
      .map(processNode)
      .filter(Boolean);

    setElements(processedElements as React.ReactNode[]);
  }, [content]);

  return (
    <div ref={containerRef} className={className}>
      {elements}
    </div>
  );
}

export default GameMarkdown;
