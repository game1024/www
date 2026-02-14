"use client";

import React, { useEffect, useRef, useState } from "react";
import { Infographic } from "@antv/infographic";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { DiagramOverlay } from "./diagram-overlay";
import { SourceCodeDialog } from "./source-code-dialog";

export interface InfographicBlockProps {
    syntax: string;
}

export function XInfographic({ syntax }: InfographicBlockProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const instance = useRef<Infographic | null>(null);
    const [overlayOpen, setOverlayOpen] = useState(false);
    const [snapshotHtml, setSnapshotHtml] = useState<string>("");
    const [sourceOpen, setSourceOpen] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        const createAndRender = () => {
            if (!containerRef.current) return;

            // 销毁旧实例
            if (instance.current) {
                instance.current.destroy();
                instance.current = null;
            }

            containerRef.current.innerHTML = "";

            const isDark = document.documentElement.classList.contains("dark");

            const infographic = new Infographic({
                container: containerRef.current!,
                width: "100%",
                theme: isDark ? "dark" : "default",
                themeConfig: {
                  colorBg: isDark ? "#24292e" : "#ffffff",
                  colorPrimary: isDark ? "#58a6ff" : "#0366d6",
                },
            });
            infographic.render(syntax);
            instance.current = infographic;

            // 保存快照用于全屏
            requestAnimationFrame(() => {
                if (containerRef.current) {
                    setSnapshotHtml(containerRef.current.innerHTML);
                }
            });
        };

        createAndRender();

        // 监听主题变化，重建实例
        const observer = new MutationObserver(() => {
            createAndRender();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => {
            if (instance.current) instance.current.destroy();
            observer.disconnect();
        };
    }, [syntax]);

    return (
        <>
            <div className="x-infographic my-2 rounded-lg border border-border overflow-hidden min-h-[200px] relative group">
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="outline"
                        size="icon-xs"
                        onClick={() => setSourceOpen(true)}
                        title="查看源码"
                    >
                        <Icon icon="ri:code-s-slash-line" className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-xs"
                        onClick={() => setOverlayOpen(true)}
                        title="全屏查看"
                    >
                        <Icon icon="ri:fullscreen-line" className="size-4" />
                    </Button>
                </div>
                <div
                    ref={containerRef}
                    className="flex justify-center items-center overflow-auto"
                    style={{ minHeight: "20rem" }}
                />
            </div>

            <DiagramOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)}>
                <div
                    className="flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: snapshotHtml }}
                />
            </DiagramOverlay>

            <SourceCodeDialog
                open={sourceOpen}
                onClose={() => setSourceOpen(false)}
                source={syntax}
                language="infographic"
            />
        </>
    );
}

export default XInfographic;
