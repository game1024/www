/**
 * <x-file-tree> Web Component
 * 处理目录展开/折叠时的图标切换
 */

class XFileTree extends HTMLElement {
  connectedCallback() {
    for (const details of this.querySelectorAll('details')) {
      const icon = details.querySelector('.ft-dir-icon');
      if (!icon) continue;

      details.addEventListener('toggle', () => {
        const src = details.open ? icon.dataset.srcOpen : icon.dataset.srcClosed;
        if (src) icon.src = src;
      });
    }
  }
}

if (!customElements.get('x-file-tree')) customElements.define('x-file-tree', XFileTree);
