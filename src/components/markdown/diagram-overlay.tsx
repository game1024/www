"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const ZOOM_STEP = 0.2;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 5;

interface DiagramOverlayProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function DiagramOverlay({ open, onClose, children }: DiagramOverlayProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const lastPinchRef = useRef(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wheelCleanupRef = useRef<(() => void) | null>(null);

  // 计算自适应缩放
  const computeFitZoom = useCallback(() => {
    if (!contentRef.current || !scrollAreaRef.current) return 1;

    const contentW = contentRef.current.scrollWidth;
    const contentH = contentRef.current.scrollHeight;
    const containerW = scrollAreaRef.current.clientWidth;
    const containerH = scrollAreaRef.current.clientHeight;

    if (contentW <= 0 || contentH <= 0) return 1;

    const padding = 48;
    return Math.min(
      (containerW - padding * 2) / contentW,
      (containerH - padding * 2) / contentH,
      ZOOM_MAX
    );
  }, []);

  // 打开时自适应
  useEffect(() => {
    if (!open) return;
    setPan({ x: 0, y: 0 });
    // 等 Dialog 动画完成后再计算
    const timer = setTimeout(() => {
      const fitZoom = computeFitZoom();
      setZoom(Math.max(ZOOM_MIN, fitZoom));
    }, 50);
    return () => clearTimeout(timer);
  }, [open, computeFitZoom]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP));
  }, []);

  const handleReset = useCallback(() => {
    setPan({ x: 0, y: 0 });
    const fitZoom = computeFitZoom();
    setZoom(Math.max(ZOOM_MIN, fitZoom));
  }, [computeFitZoom]);

  // 鼠标拖拽
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY };
    panRef.current = { ...pan };
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setPan({ x: panRef.current.x + dx, y: panRef.current.y + dy });
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // 触摸拖拽 + 双指缩放
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setDragging(true);
      startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panRef.current = { ...pan };
    } else if (e.touches.length === 2) {
      setDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchRef.current = Math.hypot(dx, dy);
    }
  }, [pan]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging) {
      const dx = e.touches[0].clientX - startRef.current.x;
      const dy = e.touches[0].clientY - startRef.current.y;
      setPan({ x: panRef.current.x + dx, y: panRef.current.y + dy });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastPinchRef.current > 0) {
        const scale = dist / lastPinchRef.current;
        setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z * scale)));
      }
      lastPinchRef.current = dist;
    }
  }, [dragging]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) lastPinchRef.current = 0;
    if (e.touches.length === 0) setDragging(false);
  }, []);

  // 滚轮缩放（使用原生事件监听以支持 preventDefault）
  const wheelHandler = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta)));
  }, []);

  // 使用 callback ref 确保 DOM 挂载后立即绑定 wheel 事件
  const scrollAreaCallbackRef = useCallback((node: HTMLDivElement | null) => {
    // 清理旧的监听器
    if (wheelCleanupRef.current) {
      wheelCleanupRef.current();
      wheelCleanupRef.current = null;
    }
    // 更新 ref
    (scrollAreaRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    // 绑定新的监听器
    if (node) {
      node.addEventListener("wheel", wheelHandler, { passive: false });
      wheelCleanupRef.current = () => node.removeEventListener("wheel", wheelHandler);
    }
  }, [wheelHandler]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (wheelCleanupRef.current) wheelCleanupRef.current();
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-[80vw] h-[85vh] p-0 gap-0 flex flex-col overflow-hidden"
      >
        <DialogTitle className="sr-only">全屏预览</DialogTitle>

        {/* 工具栏 */}
        <div className="flex items-center justify-end gap-1 px-3 py-2 border-b border-border shrink-0">
          <ToolbarButton icon={<Icon icon="ri:zoom-out-line" className="size-4" />} title="缩小" onClick={handleZoomOut} />
          <span className="text-xs text-muted-foreground min-w-[3rem] text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <ToolbarButton icon={<Icon icon="ri:zoom-in-line" className="size-4" />} title="放大" onClick={handleZoomIn} />
          <ToolbarButton icon={<Icon icon="ri:reset-left-line" className="size-4" />} title="重置" onClick={handleReset} />
          <div className="w-px h-5 bg-border mx-1" />
          <ToolbarButton icon={<Icon icon="ri:fullscreen-exit-line" className="size-4" />} title="退出全屏" onClick={onClose} />
        </div>

        {/* 内容区 */}
        <div
          ref={scrollAreaCallbackRef}
          className={`flex-1 overflow-hidden flex items-center justify-center relative select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            ref={contentRef}
            className="pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: dragging ? "none" : "transform 0.15s ease",
              willChange: "transform",
            }}
          >
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToolbarButton({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={onClick}
      title={title}
    >
      {icon}
    </Button>
  );
}
