#!/usr/bin/env bun
import { mkdir, writeFile, exists } from "node:fs/promises";
import { join } from "node:path";

const POSTS_DIR = "src/content/posts";

function getDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function generateFrontmatter(title: string) {
  const dateTime = getDateTime();
  return `---
title: "${title}"
description: ""
createdAt: ${dateTime}
updatedAt: ${dateTime}
category: ""
tags: []
---

# ${title}

`;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("❌ 请提供文章标题");
    console.error("用法: bun run new:post <标题>");
    process.exit(1);
  }

  const title = args.join(" ");
  const dirName = title;
  const dirPath = join(POSTS_DIR, dirName);
  const filePath = join(dirPath, "index.mdx");

  // 检查目录是否已存在
  if (await exists(dirPath)) {
    console.error(`❌ 目录已存在: ${dirPath}`);
    process.exit(1);
  }

  // 创建目录
  await mkdir(dirPath, { recursive: true });

  // 创建文件
  const content = generateFrontmatter(title);
  await writeFile(filePath, content, "utf-8");

  console.log(`✅ 文章创建成功!`);
  console.log(`   📁 ${dirPath}`);
  console.log(`   📄 ${filePath}`);
}

main().catch((err) => {
  console.error("❌ 创建失败:", err.message);
  process.exit(1);
});
