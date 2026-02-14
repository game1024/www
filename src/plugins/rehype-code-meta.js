/**
 * rehype 插件：将代码块 meta string 中的属性提取到 <pre> 元素上
 * 
 * 例如 ```cpp title="main.cpp"
 * 会在 <pre> 上添加 data-title="main.cpp"
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
    });
  };
}
