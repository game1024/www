/**
 * rehype 插件：将代码块 meta string 中的属性提取到 <pre> 元素上
 * 
 * 例如 ```cpp title="main.cpp"
 * 会在 <pre> 上添加 data-title="main.cpp"
 * 
 * 行高亮语法：{1,4} 或 {1-3,5,7-9}
 */
import { visit } from 'unist-util-visit';

export default function rehypeCodeMeta() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') return;

      const code = node.children?.find(
        (child) => child.type === 'element' && child.tagName === 'code'
      );
      if (!code) return;

      const meta = code.data?.meta || code.properties?.metastring || '';
      if (!meta) return;

      // 提取 title="xxx" 或 title='xxx'
      const titleMatch = meta.match(/title\s*=\s*["']([^"']+)["']/);
      if (titleMatch) {
        node.properties = node.properties || {};
        node.properties['data-title'] = titleMatch[1];
      }

      // 提取 frame 开关
      const frameMatch = meta.match(/frame(?:\s*=\s*["']?(true|false)["']?)?/);
      if (frameMatch) {
        node.properties = node.properties || {};
        node.properties['data-frame'] = frameMatch[1] !== 'false' ? 'true' : 'false';
      }

      // 提取 collapse 开关
      const collapseMatch = meta.match(/collapse(?:\s*=\s*["']?(true|false)["']?)?/);
      if (collapseMatch) {
        node.properties = node.properties || {};
        node.properties['data-collapse'] = collapseMatch[1] !== 'false' ? 'true' : 'false';
      }

      // 提取行高亮 {1,3-5,7}
      const highlightMatch = meta.match(/\{([\d,\s-]+)\}/);
      if (highlightMatch) {
        node.properties = node.properties || {};
        node.properties['data-highlight-lines'] = highlightMatch[1].replace(/\s/g, '');
      }
      // 提取 ins 行 ins={1,3-5}
      const insMatch = meta.match(/ins\s*=\s*\{([\d,\s-]+)\}/);
      if (insMatch) {
        node.properties = node.properties || {};
        node.properties['data-ins-lines'] = insMatch[1].replace(/\s/g, '');
      }

      // 提取 del 行 del={1,3-5}
      const delMatch = meta.match(/del\s*=\s*\{([\d,\s-]+)\}/);
      if (delMatch) {
        node.properties = node.properties || {};
        node.properties['data-del-lines'] = delMatch[1].replace(/\s/g, '');
      }
      // 提取关键词高亮 mark=/regex/ 或 mark=/regex/flags
      const markMatch = meta.match(/mark\s*=\s*\/((?:[^/\\]|\\.)*)\/([gimsuy]*)/);
      if (markMatch) {
        node.properties = node.properties || {};
        node.properties['data-mark'] = markMatch[1];
        if (markMatch[2]) {
          node.properties['data-mark-flags'] = markMatch[2];
        }
      }
    });
  };
}
