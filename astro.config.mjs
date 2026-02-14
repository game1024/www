// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import remarkCustomDirectives from './src/plugins/remark-custom-directives.js';
import rehypeKatex from 'rehype-katex';
import rehypeAnchor from './src/plugins/rehype-anchor.js';
import rehypeCodeMeta from './src/plugins/rehype-code-meta.js';
import rehypeFileTree from './src/plugins/rehype-file-tree.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://gm1024.com',
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react({
      include: ['**/react/*', '**/ui/*', '**/*.tsx', '**/*.jsx'],
    }),
    icon(),
    mdx({
      syntaxHighlight: false,
      remarkPlugins: [
        remarkDirective, 
        remarkCustomDirectives,
        remarkMath,
      ],
      rehypePlugins: [
        rehypeKatex,
        rehypeAnchor,
        rehypeCodeMeta,
        rehypeFileTree,
      ],
    }),
  ],
});