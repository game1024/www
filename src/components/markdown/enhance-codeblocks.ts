/**
 * 客户端增强脚本
 * 扫描页面中的代码块，增强 mermaid 和 infographic
 */

import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { createPortal } from 'react-dom';
import { XMermaid } from './x-mermaid';
import { XInfographic } from './x-infographic';
import { XCodeBlock } from './x-codeblock';

let currentRoot: Root | null = null;
let appRootEl: HTMLElement | null = null;

export function enhanceCodeBlocks() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      cleanup();
      processCodeBlocks();
    });
  } else {
    cleanup();
    processCodeBlocks();
  }
}

function cleanup() {
  if (currentRoot) {
    currentRoot.unmount();
    currentRoot = null;
  }
  if (appRootEl) {
    appRootEl.remove();
    appRootEl = null;
  }
}

function processCodeBlocks() {
  const container = document.querySelector('.game-markdown-content');
  if (!container) return;

  const portals: Array<{ element: React.ReactNode; container: HTMLElement }> = [];

  // 查找所有 pre > code 结构
  const preElements = container.querySelectorAll('pre');

  preElements.forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;

    const classAttr = code.getAttribute('class') || '';
    const langMatch = classAttr.match(/language-(\w+)/);
    const language = langMatch ? langMatch[1] : 'plaintext';
    const codeText = code.textContent || '';

    // 创建替换容器
    const wrapper = document.createElement('div');
    wrapper.className = 'x-component-wrapper';
    pre.parentNode?.insertBefore(wrapper, pre);
    pre.style.display = 'none';

    let component: React.ReactNode;

    if (language === 'mermaid') {
      component = createElement(XMermaid, { source: codeText.trim() });
    } else if (language === 'infographic') {
      component = createElement(XInfographic, { syntax: codeText.trim() });
    } else {
      // 普通代码块 - 使用 Shiki 渲染
      const title = pre.getAttribute('data-title') || code.getAttribute('data-title') || undefined;
      const frameAttr = pre.getAttribute('data-frame');
      const collapseAttr = pre.getAttribute('data-collapse');
      const highlightLines = pre.getAttribute('data-highlight-lines') || undefined;
      const insLines = pre.getAttribute('data-ins-lines') || undefined;
      const delLines = pre.getAttribute('data-del-lines') || undefined;
      const mark = pre.getAttribute('data-mark') || undefined;
      const markFlags = pre.getAttribute('data-mark-flags') || undefined;
      
      component = createElement(XCodeBlock, {
        code: codeText.trim(),
        language,
        title,
        highlightLines,
        insLines,
        delLines,
        mark,
        markFlags,
        ...(frameAttr !== null && { frame: frameAttr === 'true' }),
        ...(collapseAttr !== null && { collapse: collapseAttr === 'true' })
      });
    }

    portals.push({ element: component, container: wrapper });

    // 移除原始 pre
    pre.remove();
  });

  // 渲染所有 portals
  if (portals.length > 0) {
    appRootEl = document.createElement('div');
    appRootEl.id = 'game-markdown-portals';
    document.body.appendChild(appRootEl);

    currentRoot = createRoot(appRootEl);
    currentRoot.render(
      createElement(
        'div',
        null,
        ...portals.map(({ element, container }) => createPortal(element, container))
      )
    );
  }
}
