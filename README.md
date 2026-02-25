# Game1024の博客

🌐 [gm1024.com](https://gm1024.com)

基于 Astro 构建的个人博客，支持丰富的 MDX 扩展语法。

## MDX 扩展语法

详细语法请参阅 👉 [Game1024の写作指南](https://gm1024.com/posts/game1024%E3%81%AE%E5%86%99%E4%BD%9C%E6%8C%87%E5%8D%97)

### 提示框

支持 `note` / `tip` / `important` / `warning` / `caution` 五种类型。

![提示框](https://github.com/user-attachments/assets/fd25e515-f901-4d96-a72b-a86223bedaef)

### Steps 步骤

将有序列表渲染为带数字标记的步骤指南。

![Steps](https://github.com/user-attachments/assets/aae2365b-2975-44ab-9d5b-31d2e6ad1d87)

### Tabs 选项卡

支持自动匹配包管理器图标（npm / pnpm / yarn / bun）等。

![Tabs](https://github.com/user-attachments/assets/ac718b76-1238-42c7-b8da-01030f201d21)

### FileTree 文件树

自动匹配 VS Code 风格文件图标，支持加粗高亮和折叠。

![FileTree](https://github.com/user-attachments/assets/7566ddcf-a401-4c6b-8955-f8280d195aee)

### Mermaid 图表

使用 Mermaid 语法绘制流程图、时序图等，支持全屏预览和查看源码。

![Mermaid](https://github.com/user-attachments/assets/90a6fe33-bbba-4629-892f-9fea00d31c37)

### Infographic 信息图

基于 AntV Infographic，使用简洁的文本语法生成信息图。

![Infographic](https://github.com/user-attachments/assets/dad349b6-8d6c-44a4-b8d5-a91f9a80212d)

### Github卡片
![Github卡片](https://github.com/user-attachments/assets/5e031cdf-6887-4778-8160-847ed1ca6486)


## 技术栈

| 类别       | 技术                                                                |
| ---------- | ------------------------------------------------------------------- |
| 框架       | [Astro](https://astro.build/) + [MDX](https://mdxjs.com/)          |
| UI         | [React](https://react.dev/) + [Radix UI](https://www.radix-ui.com/) |
| 样式       | [Tailwind CSS v4](https://tailwindcss.com/)                        |
| 代码高亮   | [Shiki](https://shiki.style/)                                      |
| 数学公式   | [KaTeX](https://katex.org/) （remark-math + rehype-katex）          |
| 图表       | [Mermaid](https://mermaid.js.org/) / [AntV Infographic](https://github.com/AntV/infographic) |
| 搜索       | [Pagefind](https://pagefind.app/)                                   |
| 图标       | [Iconify](https://iconify.design/) + [Remix Icon](https://remixicon.com/) |
| 包管理     | [Bun](https://bun.sh/)                                             |

## 字体

| 字体         | 用途     | 来源                                                                 |
| ------------ | -------- | -------------------------------------------------------------------- |
| LXGW Bright  | 正文字体 | [jsDelivr CDN](https://cdn.jsdelivr.net/gh/game1024/web-fonts@main/LXGWBright/result.css) 自托管 |
| Geist Mono   | 代码字体 | [Google Font](https://fonts.google.com/specimen/Geist+Mono)                                   |



## License

[MIT](./LICENSE)
