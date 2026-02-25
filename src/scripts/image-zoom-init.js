/**
 * 图片点击放大 (medium-zoom)
 * 对 .prose 内的所有图片生效，排除图标等小图
 */
import mediumZoom from "medium-zoom";

const zoom = mediumZoom(".prose img:not(.ft-icon):not(.tab-icon)", {
  background: "var(--zoom-overlay, rgba(0, 0, 0, 0.75))",
  margin: 24,
});

// 页面内容变化时（如 View Transitions）重新绑定
document.addEventListener("astro:page-load", () => {
  zoom.detach();
  zoom.attach(".prose img:not(.ft-icon):not(.tab-icon)");
});
