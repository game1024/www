/**
 * 图片点击放大 (medium-zoom)
 * 对 .prose 内的所有图片生效，排除图标等小图
 */
import mediumZoom from "medium-zoom";

const zoom = mediumZoom(".prose img:not(.ft-icon):not(.tab-icon)", {
  background: "var(--zoom-overlay, rgba(0, 0, 0, 0.75))",
  margin: 24,
});

// chat-context 内的图片放大时移除正方形裁剪约束
zoom.on("open", (e) => {
  const img = e.detail.zoom.getZoomedImage();
  if (img && img.closest(".chat-context")) {
    img.style.aspectRatio = "auto";
    img.style.objectFit = "contain";
    img.style.width = "auto";
    img.style.height = "auto";
  }
});

zoom.on("close", (e) => {
  const img = e.detail.zoom.getZoomedImage();
  if (img && img.closest(".chat-context")) {
    img.style.aspectRatio = "";
    img.style.objectFit = "";
    img.style.width = "";
    img.style.height = "";
  }
});

// 页面内容变化时（如 View Transitions）重新绑定
document.addEventListener("astro:page-load", () => {
  zoom.detach();
  zoom.attach(".prose img:not(.ft-icon):not(.tab-icon)");
});
