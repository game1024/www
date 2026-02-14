"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PostItem {
  slug: string;
  title: string;
  category?: string;
  tags?: string[];
  wordCount: number;
  createdAt: string; // ISO string
}

interface PostTableProps {
  posts: PostItem[];
  pageSize?: number;
}

export function PostTable({ posts, pageSize = 10 }: PostTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(posts.length / pageSize);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return posts.slice(start, start + pageSize);
  }, [posts, currentPage, pageSize]);

  // 生成页码列表
  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function formatWordCount(count: number) {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return `${count}`;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">标题</TableHead>
            <TableHead className="w-[12%]">分类</TableHead>
            <TableHead className="w-[24%]">标签</TableHead>
            <TableHead className="w-[10%] text-right">字数</TableHead>
            <TableHead className="w-[14%] text-right">发表日期</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPosts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                暂无文章
              </TableCell>
            </TableRow>
          ) : (
            paginatedPosts.map((post) => (
              <TableRow key={post.slug}>
                <TableCell className="font-medium">
                  <a
                    href={`/posts/${post.slug}`}
                    className="hover:text-primary transition-colors hover:underline underline-offset-4"
                  >
                    {post.title}
                  </a>
                </TableCell>
                <TableCell>
                  {post.category && (
                    <Badge variant="secondary">{post.category}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {post.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[11px] font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {formatWordCount(post.wordCount)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {formatDate(post.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* 翻页器 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            共 {posts.length} 篇文章
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>

            {pageNumbers.map((page, i) =>
              page === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">
                  …
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="min-w-8"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostTable;
