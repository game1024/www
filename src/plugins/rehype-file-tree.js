/**
 * rehype 插件：将 <x-file-tree> 内的 <ul>/<li> 转换为带图标的文件树结构
 * 配合 remark-custom-directives 中的 :::filetree 指令使用
 */
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import { toString } from 'hast-util-to-string';

// ── 图标映射（内联版 file2icon）──
const fileNameMap = {
  'package.json': 'vscode-icons:file-type-npm',
  'yarn.lock': 'vscode-icons:file-type-yarn',
  '.gitignore': 'vscode-icons:file-type-git',
  'dockerfile': 'vscode-icons:file-type-docker',
  'makefile': 'vscode-icons:file-type-makefile',
  '.env': 'vscode-icons:file-type-dotenv',
  'tsconfig.json': 'vscode-icons:file-type-tsconfig',
  '.prettierrc': 'vscode-icons:file-type-prettier',
  '.eslintrc': 'vscode-icons:file-type-eslint',
};

const extMap = {
  js: 'vscode-icons:file-type-js-official',
  mjs: 'vscode-icons:file-type-js-official',
  cjs: 'vscode-icons:file-type-js-official',
  jsx: 'vscode-icons:file-type-jsx-official',
  ts: 'vscode-icons:file-type-typescript-official',
  tsx: 'vscode-icons:file-type-tsx',
  vue: 'vscode-icons:file-type-vue',
  svelte: 'vscode-icons:file-type-svelte',
  astro: 'vscode-icons:file-type-astro',
  css: 'vscode-icons:file-type-css',
  scss: 'vscode-icons:file-type-scss',
  sass: 'vscode-icons:file-type-sass',
  less: 'vscode-icons:file-type-less',
  html: 'vscode-icons:file-type-html',
  htm: 'vscode-icons:file-type-html',
  py: 'vscode-icons:file-type-python',
  java: 'vscode-icons:file-type-java',
  rb: 'vscode-icons:file-type-ruby',
  go: 'vscode-icons:file-type-go',
  rs: 'vscode-icons:file-type-rust',
  php: 'vscode-icons:file-type-php',
  cs: 'vscode-icons:file-type-csharp',
  cpp: 'vscode-icons:file-type-cpp',
  c: 'vscode-icons:file-type-c',
  h: 'vscode-icons:file-type-cheader',
  hpp: 'vscode-icons:file-type-cheader',
  json: 'vscode-icons:file-type-json',
  xml: 'vscode-icons:file-type-xml',
  yaml: 'vscode-icons:file-type-yaml',
  yml: 'vscode-icons:file-type-yaml',
  toml: 'vscode-icons:file-type-toml',
  csv: 'vscode-icons:file-type-csv',
  sql: 'vscode-icons:file-type-sql',
  md: 'vscode-icons:file-type-markdown',
  mdx: 'vscode-icons:file-type-markdown',
  sh: 'vscode-icons:file-type-shell',
  bash: 'vscode-icons:file-type-shell',
  ps1: 'vscode-icons:file-type-powershell',
  svg: 'vscode-icons:file-type-svg',
  png: 'vscode-icons:file-type-image',
  jpg: 'vscode-icons:file-type-image',
  jpeg: 'vscode-icons:file-type-image',
  gif: 'vscode-icons:file-type-image',
  webp: 'vscode-icons:file-type-image',
  ico: 'vscode-icons:file-type-image',
  git: 'vscode-icons:file-type-git',
  docker: 'vscode-icons:file-type-docker',
  lock: 'vscode-icons:file-type-lock',
};

// 需要区分 light/dark 主题的图标（value 为 light 主题下使用的变体）
// 默认图标为暗色主题设计，light 变体为亮色主题设计
const themedIcons = {
  'vscode-icons:file-type-astro': 'vscode-icons:file-type-light-astro',
};

function file2icon(filename) {
  if (!filename) return 'vscode-icons:file-type-text';
  const name = filename.toLowerCase();
  if (fileNameMap[name]) return fileNameMap[name];
  const ext = name.split('.').pop() || '';
  return extMap[ext] || 'vscode-icons:file-type-text';
}

function iconUrl(icon) {
  const [prefix, name] = icon.split(':');
  return `https://api.iconify.design/${prefix}/${name}.svg`;
}

const FOLDER_OPEN_URL = iconUrl('vscode-icons:default-folder-opened');
const FOLDER_CLOSED_URL = iconUrl('vscode-icons:default-folder');

// 箭头 SVG hast 节点
function chevronNode() {
  return {
    type: 'element',
    tagName: 'span',
    properties: { className: ['ft-chevron'] },
    children: [{
      type: 'element',
      tagName: 'svg',
      properties: { viewBox: '0 0 24 24', width: '12', height: '12', fill: 'currentColor' },
      children: [{
        type: 'element',
        tagName: 'path',
        properties: { d: 'M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z' },
        children: [],
      }],
    }],
  };
}

// 构建 <img> 图标节点
function iconImgNode(iconName, extraClass) {
  const props = {
    className: ['ft-icon'],
    src: iconUrl(iconName),
    alt: '',
    width: '16',
    height: '16',
    loading: 'lazy',
    decoding: 'async',
  };
  if (extraClass) {
    props.className.push(extraClass);
  }
  return { type: 'element', tagName: 'img', properties: props, children: [] };
}

// 构建文件图标节点（主题感知：可能返回多个节点）
function fileIconNodes(iconName) {
  const lightVariant = themedIcons[iconName];
  if (lightVariant) {
    return [
      iconImgNode(lightVariant, 'ft-themed-light'),
      iconImgNode(iconName, 'ft-themed-dark'),
    ];
  }
  return [iconImgNode(iconName)];
}

// 目录图标节点（open/closed 切换用 data 属性）
function dirIconNode() {
  return {
    type: 'element',
    tagName: 'img',
    properties: {
      className: ['ft-icon', 'ft-dir-icon'],
      src: FOLDER_OPEN_URL,
      'data-src-open': FOLDER_OPEN_URL,
      'data-src-closed': FOLDER_CLOSED_URL,
      alt: '',
      width: '16',
      height: '16',
    },
    children: [],
  };
}

// 占位符节点
function placeholderNode() {
  return {
    type: 'element',
    tagName: 'li',
    properties: { className: ['ft-item', 'ft-file', 'ft-placeholder'] },
    children: [{
      type: 'element',
      tagName: 'span',
      properties: { className: ['ft-entry'] },
      children: [{
        type: 'element',
        tagName: 'span',
        properties: { className: ['ft-name'] },
        children: [{ type: 'text', value: '…' }],
      }],
    }],
  };
}

/**
 * 处理单个 <li> 节点
 */
function processLi(li) {
  // 找直接子 <ul>
  const childUl = li.children?.find(
    c => c.type === 'element' && c.tagName === 'ul'
  );
  // 非 <ul> 子节点（文本、strong 等）
  const nonUlChildren = (li.children || []).filter(
    c => !(c.type === 'element' && c.tagName === 'ul')
  );

  // 获取纯文字
  const plainText = textFromChildren(nonUlChildren).trim();

  // 检查是否高亮（<strong> 包裹）
  const isHighlighted = nonUlChildren.some(
    c => c.type === 'element' && (c.tagName === 'strong' || c.tagName === 'b')
  );

  // 检查占位符
  const isPlaceholder = /^(\.{3}|…)$/.test(plainText);

  // 检查目录
  const isDirectory = !!childUl || plainText.endsWith('/');

  // 文件名和注释分离
  let fileName = plainText;
  let comment = '';
  if (isDirectory && fileName.endsWith('/')) fileName = fileName.slice(0, -1);

  const spIdx = fileName.indexOf(' ');
  if (spIdx > 0 && !isPlaceholder) {
    comment = fileName.slice(spIdx + 1);
    fileName = fileName.slice(0, spIdx);
  }

  // ── 占位符 ──
  if (isPlaceholder) {
    return placeholderNode();
  }

  const nameClasses = ['ft-name'];
  if (isHighlighted) nameClasses.push('ft-highlight');

  const nameNode = {
    type: 'element',
    tagName: 'span',
    properties: { className: nameClasses },
    children: [{ type: 'text', value: fileName }],
  };

  const commentNode = comment ? {
    type: 'element',
    tagName: 'span',
    properties: { className: ['ft-comment'] },
    children: [{ type: 'text', value: comment }],
  } : null;

  // ── 目录 ──
  if (isDirectory) {
    // 递归处理子 <ul>
    let processedChildUl;
    if (childUl) {
      processedChildUl = processUl(childUl);
    } else {
      // 空目录的占位
      processedChildUl = {
        type: 'element',
        tagName: 'ul',
        properties: { className: ['ft-list'], role: 'group' },
        children: [placeholderNode()],
      };
    }

    const summaryChildren = [chevronNode(), dirIconNode(), nameNode];
    if (commentNode) summaryChildren.push(commentNode);

    return {
      type: 'element',
      tagName: 'li',
      properties: { className: ['ft-item', 'ft-directory'] },
      children: [{
        type: 'element',
        tagName: 'details',
        properties: { open: true },
        children: [
          {
            type: 'element',
            tagName: 'summary',
            properties: { className: ['ft-entry'] },
            children: summaryChildren,
          },
          processedChildUl,
        ],
      }],
    };
  }

  // ── 文件 ──
  const entryChildren = [...fileIconNodes(file2icon(fileName)), nameNode];
  if (commentNode) entryChildren.push(commentNode);

  return {
    type: 'element',
    tagName: 'li',
    properties: { className: ['ft-item', 'ft-file'] },
    children: [{
      type: 'element',
      tagName: 'span',
      properties: { className: ['ft-entry'] },
      children: entryChildren,
    }],
  };
}

/**
 * 处理 <ul> 节点
 */
function processUl(ul) {
  const items = (ul.children || []).filter(
    c => c.type === 'element' && c.tagName === 'li'
  );

  return {
    type: 'element',
    tagName: 'ul',
    properties: { className: ['ft-list'], role: 'group' },
    children: items.map(li => processLi(li)),
  };
}

/**
 * 从 hast 子节点列表提取纯文字
 */
function textFromChildren(children) {
  let result = '';
  for (const child of children) {
    if (child.type === 'text') {
      result += child.value;
    } else if (child.children) {
      result += textFromChildren(child.children);
    }
  }
  return result;
}

export default function rehypeFileTree() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'x-file-tree') return;

      // 找到内部的顶层 <ul>
      const ul = node.children?.find(
        c => c.type === 'element' && c.tagName === 'ul'
      );

      if (!ul) return;

      // 处理并替换
      const processedUl = processUl(ul);

      // 替换 children 为处理后的树
      node.children = [processedUl];
    });
  };
}
