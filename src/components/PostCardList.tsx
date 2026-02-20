"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

export interface PostItem {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  wordCount: number;
  createdAt: string; // ISO string
}

interface PostCardListProps {
  posts: PostItem[];
  pageSize?: number;
  title?: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatWordCount(count: number) {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万字`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k字`;
  return `${count}字`;
}

function formatReadingTime(count: number) {
  const minutes = Math.max(1, Math.ceil(count / 400));
  return `${minutes}分钟`;
}

function PostCard({ post }: { post: PostItem }) {
  return (
    <div
      className="group flex flex-col rounded-lg border border-border/60 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm cursor-pointer min-h-[160px]"
      onClick={() => window.location.href = `/posts/${post.slug}`}
    >
      {/* 首行：分类 + 日期/字数/阅读时间 */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="min-w-0">
          {post.category && (
            <a
              href={`/categories/${encodeURIComponent(post.category)}`}
              className="inline-flex"
              onClick={(e) => e.stopPropagation()}
            >
              <Badge variant="secondary" className="text-[11px] hover:bg-primary/15 transition-colors cursor-pointer">
                <Icon icon="ri:stack-fill" className="size-3 mr-0.5" />
                {post.category}
              </Badge>
            </a>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums leading-none">
          <span className="inline-flex items-center gap-0.5">
            <Icon icon="ri:calendar-line" className="size-3 shrink-0" />
            {formatDate(post.createdAt)}
          </span>
          <span className="hidden sm:inline-flex items-center gap-0.5">
            <Icon icon="ri:file-text-line" className="size-3 shrink-0" />
            {formatWordCount(post.wordCount)}
          </span>
          <span className="hidden sm:inline-flex items-center gap-0.5">
            <Icon icon="ri:time-line" className="size-3 shrink-0" />
            {formatReadingTime(post.wordCount)}
          </span>
        </div>
      </div>

      {/* 标题 */}
      <a
        href={`/posts/${post.slug}`}
        className="block min-w-0 mb-1"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          <span className="link-underline">{post.title}</span>
        </h3>
      </a>

      {/* 描述 */}
      {post.description && (
        <p className="text-xs text-muted-foreground line-clamp-3 mb-2 leading-relaxed">
          {post.description}
        </p>
      )}
    </div>
  );
}

export function PostCardList({ posts, pageSize = 6, title }: PostCardListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(posts.length / pageSize);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return posts.slice(start, start + pageSize);
  }, [posts, currentPage, pageSize]);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always produce exactly 7 slots: [1] [...] [a] [b] [c] [...] [last]
      pages.push(1);
      if (currentPage <= 3) {
        pages.push(2, 3, 4);
        pages.push("...");
      } else if (currentPage >= totalPages - 2) {
        pages.push("...");
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pages.push("...");
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      )}
      {/* 文章列表 */}
      {paginatedPosts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">
          暂无文章
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))" }}>
          {paginatedPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {/* 翻页器 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-muted-foreground">
            共 {posts.length} 篇 · {currentPage}/{totalPages}
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

            <span className="hidden sm:contents">
            {pageNumbers.map((page, i) =>
              page === "..." ? (
                <span key={`ellipsis-${i}`} className="w-8 text-center text-muted-foreground text-sm">
                  …
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 tabular-nums"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}
            </span>

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

export default PostCardList;
