/**
 * 图片点击放大 (medium-zoom)
 * 对 .prose 内的所有图片生效，排除图标等小图
 */
import mediumZoom from "medium-zoom";

const zoom = mediumZoom(".prose img:not(.ft-icon):not(.tab-icon)", {
  background: "var(--zoom-overlay, rgba(0, 0, 0, 0.75))",
  margin: 24,
});

// chat-context 图片不使用 medium-zoom（正方形裁剪与 zoom 缩放冲突）
zoom.detach(".chat-context img");

/**
 * chat-context 图片：自定义全屏预览
 * 点击后以原始比例铺满视口，再次点击或按 Esc 关闭
 */
function initChatContextZoom() {
  document.querySelectorAll(".chat-context img").forEach((img) => {
    if (img.dataset.chatZoom) return;
    img.dataset.chatZoom = "true";
    img.addEventListener("click", () => {
      const overlay = document.createElement("div");
      overlay.className = "chat-img-overlay";
      const full = document.createElement("img");
      full.src = img.currentSrc || img.src;
      full.className = "chat-img-full";
      overlay.appendChild(full);
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add("active"));

      const close = () => {
        overlay.classList.remove("active");
        overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
      };
      overlay.addEventListener("click", close);
      const onKey = (e) => {
        if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey); document.removeEventListener("wheel", onWheel); }
      };
      const onWheel = () => {
        close();
        document.removeEventListener("keydown", onKey);
        document.removeEventListener("wheel", onWheel);
      };
      document.addEventListener("keydown", onKey);
      document.addEventListener("wheel", onWheel, { passive: true });
    });
  });
}

initChatContextZoom();

// 页面内容变化时（如 View Transitions）重新绑定
document.addEventListener("astro:page-load", () => {
  zoom.detach();
  zoom.attach(".prose img:not(.ft-icon):not(.tab-icon)");
  zoom.detach(".chat-context img");
  initChatContextZoom();
});
