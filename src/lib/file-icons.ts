/**
 * 根据文件名/后缀获取对应的 vscode-icons 图标名称
 */

// 精确匹配文件名
const fileNameMap: Record<string, string> = {
  bash: "vscode-icons:file-type-shell",
  powershell: "vscode-icons:file-type-powershell",
  "package.json": "vscode-icons:file-type-npm",
  "yarn.lock": "vscode-icons:file-type-yarn",
  ".gitignore": "vscode-icons:file-type-git",
  dockerfile: "vscode-icons:file-type-docker",
  makefile: "vscode-icons:file-type-makefile",
  ".env": "vscode-icons:file-type-dotenv",
};

// 扩展名匹配
const extMap: Record<string, string> = {
  // Web 前端
  js: "vscode-icons:file-type-js-official",
  mjs: "vscode-icons:file-type-js-official",
  cjs: "vscode-icons:file-type-js-official",
  jsx: "vscode-icons:file-type-jsx-official",
  ts: "vscode-icons:file-type-typescript-official",
  tsx: "vscode-icons:file-type-tsx",
  vue: "vscode-icons:file-type-vue",
  svelte: "vscode-icons:file-type-svelte",
  astro: "vscode-icons:file-type-astro",
  css: "vscode-icons:file-type-css",
  scss: "vscode-icons:file-type-scss",
  sass: "vscode-icons:file-type-sass",
  less: "vscode-icons:file-type-less",
  html: "vscode-icons:file-type-html",
  htm: "vscode-icons:file-type-html",

  // 后端
  py: "vscode-icons:file-type-python",
  java: "vscode-icons:file-type-java",
  class: "vscode-icons:file-type-java",
  jar: "vscode-icons:file-type-java",
  rb: "vscode-icons:file-type-ruby",
  go: "vscode-icons:file-type-go",
  rs: "vscode-icons:file-type-rust",
  php: "vscode-icons:file-type-php",
  cs: "vscode-icons:file-type-csharp",
  cpp: "vscode-icons:file-type-cpp",
  c: "vscode-icons:file-type-c",
  h: "vscode-icons:file-type-cheader",
  hpp: "vscode-icons:file-type-cheader",

  // 数据格式
  json: "vscode-icons:file-type-json",
  xml: "vscode-icons:file-type-xml",
  yaml: "vscode-icons:file-type-yaml",
  yml: "vscode-icons:file-type-yaml",
  toml: "vscode-icons:file-type-toml",
  csv: "vscode-icons:file-type-csv",
  sql: "vscode-icons:file-type-sql",

  // 标记语言
  md: "vscode-icons:file-type-markdown",
  markdown: "vscode-icons:file-type-markdown",
  mdx: "vscode-icons:file-type-markdown",
  rst: "vscode-icons:file-type-text",

  // 其他
  sh: "vscode-icons:file-type-shell",
  bash: "vscode-icons:file-type-bash",
  powershell: "vscode-icons:file-type-powershell",
  ps1: "vscode-icons:file-type-powershell",
  git: "vscode-icons:file-type-git",
  docker: "vscode-icons:file-type-docker",
};

// 需要区分 light/dark 主题的图标（value 为 light 主题下使用的变体）
// 默认图标为暗色主题设计，light 变体为亮色主题设计
const themedIcons: Record<string, string> = {
  "vscode-icons:file-type-astro": "vscode-icons:file-type-light-astro",
};

export function file2icon(filename?: string): string {
  if (!filename) return "vscode-icons:file-type-text";

  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const name = filename.toLowerCase();

  if (fileNameMap[name]) return fileNameMap[name];
  return extMap[ext] || "vscode-icons:file-type-text";
}

/**
 * 根据主题返回适合的图标
 * 默认图标为暗色主题设计，themedIcons 记录其亮色主题变体
 */
export function file2iconForTheme(
  filename: string,
  theme: "light" | "dark",
): string {
  const icon = file2icon(filename);
  if (theme === "light" && themedIcons[icon]) {
    return themedIcons[icon];
  }
  return icon;
}

/**
 * 获取图标的 light/dark 主题变体
 * 如果图标有主题变体，返回 { light, dark }；否则返回 null
 * light = 亮色主题下显示的图标，dark = 暗色主题下显示的（默认）
 */
export function file2iconPair(
  filename?: string,
): { light: string; dark: string } | null {
  const icon = file2icon(filename);
  if (themedIcons[icon]) {
    return { light: themedIcons[icon], dark: icon };
  }
  return null;
}
