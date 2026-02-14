// x-file-tree Web Component：处理目录图标切换
class XFileTree extends HTMLElement {
  connectedCallback() {
    this.querySelectorAll('details').forEach((details) => {
      const icon = details.querySelector('.ft-dir-icon');
      if (!icon) return;

      const update = () => {
        const src = details.open
          ? icon.dataset.srcOpen
          : icon.dataset.srcClosed;
        if (src) icon.src = src;
      };

      details.addEventListener('toggle', update);
    });
  }
}

if (!customElements.get('x-file-tree')) {
  customElements.define('x-file-tree', XFileTree);
}
