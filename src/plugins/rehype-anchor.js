/**
 * rehype-anchor 插件
 * 合并 rehype-slug + rehype-autolink-headings 的功能
 * 为标题元素添加 id 并包裹锚点链接
 */
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';

const headingTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

export default function rehypeAnchor() {
  return (tree) => {
    const slugger = new GithubSlugger();

    visit(tree, 'element', (node) => {
      if (!headingTags.has(node.tagName)) return;

      // 提取标题文本
      const text = extractText(node);
      if (!text) return;

      // 生成唯一 slug
      const id = slugger.slug(text);
      node.properties = node.properties || {};
      node.properties.id = id;

      // 将子节点包裹在 <a> 中 (behavior: 'wrap')
      node.children = [
        {
          type: 'element',
          tagName: 'a',
          properties: {
            href: `#${id}`,
            className: ['anchor-link'],
          },
          children: node.children,
        },
      ];
    });
  };
}

/**
 * 递归提取节点中的文本内容
 */
function extractText(node) {
  if (node.type === 'text') {
    return node.value;
  }
  if (node.children) {
    return node.children.map(extractText).join('');
  }
  return '';
}
