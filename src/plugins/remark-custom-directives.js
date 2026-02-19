// remark 插件：处理自定义指令（:::note、:::tip 等）
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import { getIconData } from '@iconify/utils';
import { icons as riIcons } from '@iconify-json/ri';

/**
 * 自定义容器配置
 * 可以添加更多类型，如 warning, danger, caution 等
 */
const containerTypes = {
  note: {
    title: 'Note',
    icon: 'ri:information-line',
    className: 'note',
  },
  tip: {
    title: 'Tip',
    icon: 'ri:lightbulb-line',
    className: 'tip',
  },
  important: {
    title: 'Important',
    icon: 'ri:megaphone-line',
    className: 'important',
  },
  warning: {
    title: 'Warning',
    icon: 'ri:alarm-warning-line',
    className: 'warning',
  },
  caution: {
    title: 'Caution',
    icon: 'ri:fire-line',
    className: 'caution',
  },
};

/**
 * 获取图标 SVG
 */
function getIconSVG(iconName) {
  if (!iconName.startsWith('ri:')) return '';
  
  const name = iconName.replace('ri:', '');
  const iconData = getIconData(riIcons, name);
  
  if (!iconData) return '';
  
  const body = iconData.body;
  const width = iconData.width || 24;
  const height = iconData.height || 24;
  
  return `<svg class="container-icon" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}

/**
 * remark 插件：将容器指令转换为自定义 HTML
 */
export default function remarkCustomDirectives() {
  return (tree) => {
    visit(tree, (node) => {
      // 处理容器指令 (:::note, :::tip 等)
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const type = node.name;

        // ── steps 容器指令 ──────────────────────
        if (type === 'steps' && node.type === 'containerDirective') {
          const data = node.data || (node.data = {});
          data.hName = 'div';
          data.hProperties = h('div', { class: 'steps' }).properties;
          return;
        }

        // ── tabs / tab 容器指令 ──────────────────
        if (type === 'tabs' && node.type === 'containerDirective') {
          const data = node.data || (node.data = {});
          data.hName = 'x-tabs';
          data.hProperties = {};
          return;
        }

        // ── filetree 容器指令 ─────────────────────
        if (type === 'filetree' && node.type === 'containerDirective') {
          const data = node.data || (node.data = {});
          data.hName = 'x-file-tree';
          data.hProperties = h('x-file-tree', { class: 'x-file-tree' }).properties;
          return;
        }

        // ── github 仓库卡片指令 ─────────────────
        if (type === 'github' && (node.type === 'containerDirective' || node.type === 'leafDirective')) {
          const repo = node.attributes?.repo;
          if (!repo) return;

          const data = node.data || (node.data = {});
          data.hName = 'github-card';
          data.hProperties = {
            repo,
          };

          node.children = [];
          return;
        }

        if (type === 'tab' && node.type === 'containerDirective') {
          const label = node.attributes?.label || 'Tab';
          const data = node.data || (node.data = {});
          data.hName = 'div';
          data.hProperties = h('div', { role: 'tabpanel', 'data-label': label }).properties;
          // 移除 remark-directive 生成的 label 段落
          node.children = node.children.filter(
            child => !(child.data && child.data.directiveLabel)
          );
          return;
        }

        // ── note / tip / important / warning / caution ──
        const config = containerTypes[type];

        if (!config) {
          return;
        }

        // 获取自定义标题（如果有）
        const customTitle = node.attributes?.title || config.title;

        // 转换为 HTML 结构
        const data = node.data || (node.data = {});
        const tagName = node.type === 'textDirective' ? 'span' : 'div';

        data.hName = tagName;
        data.hProperties = h(tagName, {
          class: `custom-container ${config.className}`,
          'data-type': type,
        }).properties;

        // 添加标题和图标
        if (node.type !== 'textDirective') {
          node.children.unshift({
            type: 'paragraph',
            data: {
              hName: 'div',
              hProperties: {
                class: 'container-title',
              },
            },
            children: [
              {
                type: 'html',
                value: getIconSVG(config.icon),
              },
              {
                type: 'text',
                value: customTitle,
              },
            ],
          });
        }
      }
    });
  };
}
