"use client";

import React, { useCallback } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SourceCodeDialogProps {
  open: boolean;
  onClose: () => void;
  source: string;
  language?: string;
}

export function SourceCodeDialog({
  open,
  onClose,
  source,
  language = "text",
}: SourceCodeDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = source;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [source]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl gap-0 p-0 overflow-hidden">
        <DialogTitle className="sr-only">查看源码</DialogTitle>

        {/* 顶栏 */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0 bg-muted">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon icon="ri:code-s-slash-line" className="size-4" />
            <span>{language}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 gap-1.5 text-xs"
            >
              <Icon
                icon={copied ? "ri:check-line" : "ri:clipboard-line"}
                className="size-3.5"
              />
              {copied ? "已复制" : "复制"}
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onClose}
              title="关闭"
            >
              <Icon icon="ri:close-line" className="size-4" />
            </Button>
          </div>
        </div>

        {/* 代码区 */}
        <ScrollArea type="auto" className="w-full">
          <pre 
            className="max-h-[70vh] p-4 text-sm leading-relaxed whitespace-pre-wrap break-words text-neutral-900 dark:text-neutral-100"
            style={{ backgroundColor: isDark ? "#24292e" : "#fafafa" }}
          >
            <code className="font-code">{source}</code>
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
